import { pool } from '../config/db';

export interface CrearMovimientoInput {
  tipo: 'ingreso' | 'gasto';
  monto: number;
  descripcion: string;
  categoria_id?: number | null;
}

export interface Movimiento {
  id: number;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  descripcion: string;
  fecha: Date | string;
  categoria_id: number | null;
}

export const movimientoService = {
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
};
