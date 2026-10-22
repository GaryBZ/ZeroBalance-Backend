import { pool } from '../config/db';

export interface Categoria {
  id: number;
  nombre: string;
}

export const categoriaService = {
  async obtenerCategorias(): Promise<Categoria[]> {
    const result = await pool.query<Categoria>(
      'SELECT id, nombre FROM categorias ORDER BY id ASC',
    );

    return result.rows;
  },
};
