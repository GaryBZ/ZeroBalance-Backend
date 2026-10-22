import { pool } from '../config/db';

export interface CrearMovimientoInput {
  tipo: 'ingreso' | 'gasto';
  monto: number;
  descripcion: string;
  categoria_id?: number | null;
}

export type ActualizarMovimientoInput = CrearMovimientoInput;

export interface Movimiento {
  id: number;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  descripcion: string;
  fecha: Date | string;
  categoria_id: number | null;
}

export const movimientoService = {
  async obtenerMovimientos(): Promise<Movimiento[]> {
    const result = await pool.query<Movimiento>(
      'SELECT * FROM movimientos ORDER BY fecha DESC',
    );

    return result.rows;
  },

  async crearMovimiento(input: CrearMovimientoInput): Promise<Movimiento> {
    const result = await pool.query<Movimiento>(
      `INSERT INTO movimientos (tipo, monto, descripcion, categoria_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tipo, monto, descripcion, fecha, categoria_id`,
      [
        input.tipo,
        input.monto,
        input.descripcion,
        input.categoria_id ?? null,
      ],
    );

    return result.rows[0];
  },

  async actualizarMovimiento(
    id: number,
    input: ActualizarMovimientoInput,
  ): Promise<Movimiento> {
    const result = await pool.query<Movimiento>(
      `UPDATE movimientos
       SET tipo = $1, monto = $2, descripcion = $3, categoria_id = $4
       WHERE id = $5
       RETURNING id, tipo, monto, descripcion, fecha, categoria_id`,
      [input.tipo, input.monto, input.descripcion, input.categoria_id ?? null, id],
    );

    if (result.rows.length === 0) {
      throw new Error('MOVIMIENTO_NOT_FOUND');
    }

    return result.rows[0];
  },

  async eliminarMovimiento(id: number): Promise<void> {
    const result = await pool.query(
      'DELETE FROM movimientos WHERE id = $1',
      [id],
    );

    if (result.rowCount === 0) {
      throw new Error('MOVIMIENTO_NOT_FOUND');
    }
  },
};
