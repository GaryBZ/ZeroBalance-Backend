import { Request, Response } from 'express';
import { presupuestoService } from '../services/presupuesto.service';

export async function obtenerPresupuesto(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const presupuesto = await presupuestoService.obtenerPresupuesto();
    response.status(200).json(presupuesto);
  } catch (error) {
    console.error('Error fetching presupuesto', error);
    response.status(500).json({
      error: 'No se pudo obtener la configuración del presupuesto',
    });
  }

}

export async function actualizarPresupuesto(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { ingreso_base, limites } = request.body as {
      ingreso_base?: unknown;
      limites?: unknown;
    };
    const limitesValidos = Array.isArray(limites)
      ? limites as Array<{ categoria_id?: unknown; limite_monto?: unknown }>
      : [];

    if (
      typeof ingreso_base !== 'number' ||
      !Number.isFinite(ingreso_base) ||
      ingreso_base < 0 ||
      !Array.isArray(limites) ||
      limitesValidos.some(
        (limite) =>
          !limite ||
          typeof limite.categoria_id !== 'number' ||
          !Number.isInteger(limite.categoria_id) ||
          limite.categoria_id <= 0 ||
          typeof limite.limite_monto !== 'number' ||
          !Number.isFinite(limite.limite_monto) ||
          limite.limite_monto < 0,
      )
    ) {
      response.status(400).json({
        error: 'ingreso_base y límites deben contener valores válidos',
      });
      return;
    }

    try {
      const presupuesto = await presupuestoService.actualizarPresupuesto({
        ingreso_base,
        limites: limitesValidos as Array<{
          categoria_id: number;
          limite_monto: number;
        }>,
      });
      response.status(200).json(presupuesto);
    } catch (error) {
      console.error('Error updating presupuesto', error);
      response.status(500).json({
        error: 'No se pudo actualizar el presupuesto',
      });
  }
}
