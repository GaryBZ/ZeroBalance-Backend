import { pool } from '../config/db';

export type Frecuencia = 'semanal' | 'mensual' | 'anual';

export interface GastoRecurrenteInput {
  descripcion: string;
  monto: number;
  categoria_id?: number | null;
  frecuencia: Frecuencia;
  proxima_fecha: string;
  activo?: boolean;
}

export interface GastoRecurrente extends GastoRecurrenteInput {
  id: number;
  categoria_id: number | null;
  activo: boolean;
}

export const recurrenteService = {
  async listar(): Promise<GastoRecurrente[]> {
    const result = await pool.query<GastoRecurrente>(
      `SELECT id, descripcion, monto, categoria_id, frecuencia, proxima_fecha, activo
       FROM gastos_recurrentes ORDER BY proxima_fecha ASC`,
    );
    return result.rows;
  },

  async crear(input: GastoRecurrenteInput): Promise<GastoRecurrente> {
    const result = await pool.query<GastoRecurrente>(
      `INSERT INTO gastos_recurrentes
       (descripcion, monto, categoria_id, frecuencia, proxima_fecha, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, descripcion, monto, categoria_id, frecuencia, proxima_fecha, activo`,
      [input.descripcion, input.monto, input.categoria_id ?? null, input.frecuencia, input.proxima_fecha, input.activo ?? true],
    );
    return result.rows[0];
  },

  async actualizar(id: number, input: GastoRecurrenteInput): Promise<GastoRecurrente> {
    const result = await pool.query<GastoRecurrente>(
      `UPDATE gastos_recurrentes
       SET descripcion = $1, monto = $2, categoria_id = $3, frecuencia = $4,
           proxima_fecha = $5, activo = $6
       WHERE id = $7
       RETURNING id, descripcion, monto, categoria_id, frecuencia, proxima_fecha, activo`,
      [input.descripcion, input.monto, input.categoria_id ?? null, input.frecuencia, input.proxima_fecha, input.activo ?? true, id],
    );
    if (result.rows.length === 0) throw new Error('RECURRENTE_NOT_FOUND');
    return result.rows[0];
  },

  async eliminar(id: number): Promise<void> {
    const result = await pool.query('DELETE FROM gastos_recurrentes WHERE id = $1', [id]);
    if (result.rowCount === 0) throw new Error('RECURRENTE_NOT_FOUND');
  },
};
