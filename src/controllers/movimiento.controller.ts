import { Request, Response } from 'express';
import {
  ActualizarMovimientoInput,
  CrearMovimientoInput,
  movimientoService,
} from '../services/movimiento.service';

function validarMovimiento(body: unknown): ActualizarMovimientoInput | null {
  const { tipo, monto, descripcion, categoria_id } =
    body as Partial<ActualizarMovimientoInput>;

  if (
    (tipo !== 'ingreso' && tipo !== 'gasto') ||
    typeof monto !== 'number' ||
    !Number.isFinite(monto) ||
    monto <= 0 ||
    typeof descripcion !== 'string' ||
    descripcion.trim().length === 0 ||
    (categoria_id !== undefined &&
      categoria_id !== null &&
      (!Number.isInteger(categoria_id) || categoria_id <= 0))
  ) {
    return null;
  }

  return {
    tipo,
    monto,
    descripcion: descripcion.trim(),
    categoria_id: categoria_id ?? null,
  };
}

export async function obtenerMovimientos(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const movimientos = await movimientoService.obtenerMovimientos();
    response.status(200).json(movimientos);
  } catch (error) {
    console.error('Error fetching movimientos', error);
    response.status(500).json({
      error: 'No se pudieron obtener los movimientos',
    });
  }
}

export async function crearMovimiento(
  request: Request,
  response: Response,
): Promise<void> {
  const input = validarMovimiento(request.body);
  if (input === null) {
    response.status(400).json({
      error: 'tipo, monto y descripcion son obligatorios; los valores deben ser válidos',
    });
    return;
  }

  try {
    const movimiento = await movimientoService.crearMovimiento(input);
    response.status(201).json(movimiento);
  } catch (error) {
    console.error('Error creating movimiento', error);
    response.status(500).json({ error: 'No se pudo crear el movimiento' });
  }
}

export async function actualizarMovimiento(
    request: Request,
    response: Response,
  ): Promise<void> {
    const id = Number(request.params['id']);
    const input = validarMovimiento(request.body);

    if (!Number.isInteger(id) || id <= 0 || input === null) {
      response.status(400).json({ error: 'Los datos del movimiento no son válidos' });
      return;
    }

    try {
      response.status(200).json(await movimientoService.actualizarMovimiento(id, input));
    } catch (error) {
      if (error instanceof Error && error.message === 'MOVIMIENTO_NOT_FOUND') {
        response.status(404).json({ error: 'Movimiento no encontrado' });
        return;
      }
      console.error('Error updating movimiento', error);
      response.status(500).json({ error: 'No se pudo actualizar el movimiento' });
    }
  }

export async function eliminarMovimiento(
    request: Request,
    response: Response,
  ): Promise<void> {
    const id = Number(request.params['id']);

    if (!Number.isInteger(id) || id <= 0) {
      response.status(400).json({ error: 'El id del movimiento no es válido' });
      return;
    }

    try {
      await movimientoService.eliminarMovimiento(id);
      response.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'MOVIMIENTO_NOT_FOUND') {
        response.status(404).json({ error: 'Movimiento no encontrado' });
        return;
      }
      console.error('Error deleting movimiento', error);
      response.status(500).json({ error: 'No se pudo eliminar el movimiento' });
  }
}
