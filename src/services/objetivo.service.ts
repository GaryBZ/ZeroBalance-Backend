import { pool } from '../config/db';

export interface CrearObjetivoInput {
  nombre: string;
  monto_meta: number;
  monto_actual?: number;
  fecha_limite?: string | null;
  estado?: EstadoObjetivo;
}

export type ActualizarObjetivoInput = CrearObjetivoInput;
export type EstadoObjetivo = 'activo' | 'pausado' | 'completado' | 'cancelado';

export interface Objetivo {
  id: number;
  nombre: string;
  monto_meta: number;
  monto_actual: number;
  fecha_limite: string | null;
  estado: EstadoObjetivo;
  promedio_mensual: number | string;
}

export const objetivoService = {
  async obtenerObjetivos(): Promise<Objetivo[]> {
    const result = await pool.query<Objetivo>(
      `SELECT objetivos.id, objetivos.nombre, objetivos.monto_meta,
              objetivos.monto_actual, objetivos.fecha_limite, objetivos.estado,
              COALESCE((
                SELECT stats.total / GREATEST(
                  1,
                  CEIL(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - stats.primera))
                    / 2592000)
                )
                FROM (
                  SELECT SUM(abonos.monto) AS total, MIN(abonos.fecha) AS primera
                  FROM abonos_objetivo AS abonos
                  WHERE abonos.objetivo_id = objetivos.id
                ) AS stats
              ), 0) AS promedio_mensual
       FROM objetivos_ahorro AS objetivos
       ORDER BY objetivos.id ASC`,
    );

    return result.rows;
  },

  async crearObjetivo(input: CrearObjetivoInput): Promise<Objetivo> {
    const result = await pool.query<Objetivo>(
      `INSERT INTO objetivos_ahorro
         (nombre, monto_meta, monto_actual, fecha_limite, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, monto_meta, monto_actual, fecha_limite, estado,
                 0 AS promedio_mensual`,
      [
        input.nombre,
        input.monto_meta,
        input.monto_actual ?? 0,
        input.fecha_limite ?? null,
        input.estado ?? 'activo',
      ],
    );

    return result.rows[0];
  },

  async actualizarAhorro(id: number, monto_actual: number): Promise<Objetivo> {
    const existente = await pool.query<{
      monto_meta: number | string;
      monto_actual: number | string;
    }>(
      'SELECT monto_meta, monto_actual FROM objetivos_ahorro WHERE id = $1',
      [id],
    );

    if (existente.rows.length === 0) {
      throw new Error('OBJETIVO_NOT_FOUND');
    }

    if (monto_actual > Number(existente.rows[0].monto_meta)) {
      throw new Error('OBJETIVO_AMOUNT_EXCEEDED');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query<Objetivo>(
        `UPDATE objetivos_ahorro
         SET monto_actual = $1,
             estado = CASE WHEN $1 >= monto_meta THEN 'completado'
                           ELSE estado END
         WHERE id = $2
         RETURNING id, nombre, monto_meta, monto_actual, fecha_limite, estado,
                   0 AS promedio_mensual`,
        [monto_actual, id],
      );
      const abono = monto_actual - Number(existente.rows[0].monto_actual);
      if (abono > 0) {
        await client.query(
          'INSERT INTO abonos_objetivo (objetivo_id, monto) VALUES ($1, $2)',
          [id, abono],
        );
      }
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async actualizarObjetivo(
    id: number,
    input: ActualizarObjetivoInput,
  ): Promise<Objetivo> {
    const result = await pool.query<Objetivo>(
      `UPDATE objetivos_ahorro
       SET nombre = $1, monto_meta = $2, monto_actual = $3,
           fecha_limite = $4, estado = $5
       WHERE id = $4
       RETURNING id, nombre, monto_meta, monto_actual, fecha_limite, estado,
                 0 AS promedio_mensual`,
      [input.nombre, input.monto_meta, input.monto_actual ?? 0,
       input.fecha_limite ?? null, input.estado ?? 'activo', id],
    );

    if (result.rows.length === 0) {
      throw new Error('OBJETIVO_NOT_FOUND');
    }

    return result.rows[0];
  },

  async eliminarObjetivo(id: number): Promise<void> {
    const result = await pool.query(
      'DELETE FROM objetivos_ahorro WHERE id = $1',
      [id],
    );

    if (result.rowCount === 0) {
      throw new Error('OBJETIVO_NOT_FOUND');
    }
  },
};
