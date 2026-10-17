import { Request, Response } from 'express';
import {
  CrearMovimientoInput,
  movimientoService,
} from '../services/movimiento.service';

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
  const { tipo, monto, descripcion, categoria_id } = request.body as Partial<CrearMovimientoInput>;

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
    response.status(400).json({
      error: 'tipo, monto y descripcion son obligatorios; los valores deben ser válidos',
    });
    return;
  }

  try {
    const movimiento = await movimientoService.crearMovimiento({
      tipo,
      monto,
      descripcion: descripcion.trim(),
      categoria_id: categoria_id ?? null,
    });
    response.status(201).json(movimiento);
  } catch (error) {
    console.error('Error creating movimiento', error);
    response.status(500).json({ error: 'No se pudo crear el movimiento' });
  }
}
