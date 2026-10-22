import { pool } from '../config/db';

export interface ConfiguracionPresupuesto {
  id: number;
  ingreso_base: number;
}

export interface LimiteCategoria {
  id: number;
  categoria_id: number;
  categoria_nombre: string;
  limite_monto: number;
}

export interface Presupuesto {
  configuracion: ConfiguracionPresupuesto | null;
  limites: LimiteCategoria[];
}

export interface ActualizarPresupuestoInput {
  ingreso_base: number;
  limites: Array<{ categoria_id: number; limite_monto: number }>;
}

export const presupuestoService = {
  async obtenerPresupuesto(): Promise<Presupuesto> {
    const [configuracionResult, limitesResult] = await Promise.all([
      pool.query<ConfiguracionPresupuesto>(
        `SELECT id, ingreso_base
         FROM configuracion_presupuesto
         ORDER BY id ASC
         LIMIT 1`,
      ),
      pool.query<LimiteCategoria>(
        `SELECT
           limites.id,
           limites.categoria_id,
           categorias.nombre AS categoria_nombre,
           limites.limite_monto
         FROM limites_categoria AS limites
         INNER JOIN categorias
           ON categorias.id = limites.categoria_id
         ORDER BY categorias.id ASC`,
      ),
    ]);

    return {
      configuracion: configuracionResult.rows[0] ?? null,
      limites: limitesResult.rows,
    };
  },

  async actualizarPresupuesto(
    input: ActualizarPresupuestoInput,
  ): Promise<Presupuesto> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE configuracion_presupuesto
         SET ingreso_base = $1
         WHERE id = (SELECT id FROM configuracion_presupuesto ORDER BY id ASC LIMIT 1)`,
        [input.ingreso_base],
      );

      for (const limite of input.limites) {
        await client.query(
          `INSERT INTO limites_categoria (categoria_id, limite_monto)
           VALUES ($1, $2)
           ON CONFLICT (categoria_id)
           DO UPDATE SET limite_monto = EXCLUDED.limite_monto`,
          [limite.categoria_id, limite.limite_monto],
        );
      }

      await client.query('COMMIT');
      const configuracion = await this.obtenerPresupuesto();
      return configuracion;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
