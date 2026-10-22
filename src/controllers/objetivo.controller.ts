import { Request, Response } from 'express';
import {
  ActualizarObjetivoInput,
  CrearObjetivoInput,
  EstadoObjetivo,
  objetivoService,
} from '../services/objetivo.service';

export async function obtenerObjetivos(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const objetivos = await objetivoService.obtenerObjetivos();
    response.status(200).json(objetivos);
  } catch (error) {
    console.error('Error fetching objetivos', error);
    response.status(500).json({
      error: 'No se pudieron obtener los objetivos',
    });
  }
}

export async function crearObjetivo(
  request: Request,
  response: Response,
): Promise<void> {
  const { nombre, monto_meta, monto_actual, fecha_limite, estado } =
    request.body as Partial<CrearObjetivoInput>;

  if (
    typeof nombre !== 'string' ||
    nombre.trim().length === 0 ||
    typeof monto_meta !== 'number' ||
    !Number.isFinite(monto_meta) ||
    monto_meta <= 0 ||
    (monto_actual !== undefined &&
      (typeof monto_actual !== 'number' ||
        !Number.isFinite(monto_actual) ||
        monto_actual < 0 ||
        monto_actual > monto_meta))
    || (fecha_limite !== undefined &&
      fecha_limite !== null &&
      (typeof fecha_limite !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha_limite)))
    || (estado !== undefined &&
      !['activo', 'pausado', 'completado', 'cancelado'].includes(estado))
  ) {
    response.status(400).json({
      error:
        'nombre y monto_meta son obligatorios; los montos deben ser válidos y monto_actual no puede superar monto_meta',
    });
    return;
  }

  try {
    const objetivo = await objetivoService.crearObjetivo({
      nombre: nombre.trim(),
      monto_meta,
      monto_actual,
      fecha_limite,
      estado: estado as EstadoObjetivo | undefined,
    });
    response.status(201).json(objetivo);
  } catch (error) {
    console.error('Error creating objetivo', error);
    response.status(500).json({
      error: 'No se pudo crear el objetivo',
    });
  }
}

export async function actualizarAhorro(
  request: Request,
  response: Response,
): Promise<void> {
  const id = Number(request.params['id']);
  const { monto_actual } = request.body as { monto_actual?: unknown };

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof monto_actual !== 'number' ||
    !Number.isFinite(monto_actual) ||
    monto_actual < 0
  ) {
    response.status(400).json({ error: 'id y monto_actual deben ser valores válidos' });
    return;
  }

  try {
    const objetivo = await objetivoService.actualizarAhorro(id, monto_actual);
    response.status(200).json(objetivo);
  } catch (error) {
    if (error instanceof Error && error.message === 'OBJETIVO_NOT_FOUND') {
      response.status(404).json({ error: 'Objetivo no encontrado' });
      return;
    }
    if (error instanceof Error && error.message === 'OBJETIVO_AMOUNT_EXCEEDED') {
      response.status(400).json({
        error: 'El ahorro no puede superar el monto de la meta',
      });
      return;
    }
    console.error('Error updating objetivo', error);
    response.status(500).json({ error: 'No se pudo actualizar el objetivo' });
  }
}

function obtenerObjetivoInput(body: unknown): ActualizarObjetivoInput | null {
  const { nombre, monto_meta, monto_actual, fecha_limite, estado } =
    body as Partial<ActualizarObjetivoInput>;

  if (
    typeof nombre !== 'string' ||
    nombre.trim().length === 0 ||
    typeof monto_meta !== 'number' ||
    !Number.isFinite(monto_meta) ||
    monto_meta <= 0 ||
    typeof monto_actual !== 'number' ||
    !Number.isFinite(monto_actual) ||
    monto_actual < 0 ||
    monto_actual > monto_meta
    || (fecha_limite !== undefined &&
      fecha_limite !== null &&
      (typeof fecha_limite !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha_limite)))
    || (estado !== undefined &&
      !['activo', 'pausado', 'completado', 'cancelado'].includes(estado))
  ) {
    return null;
  }

  return {
    nombre: nombre.trim(),
    monto_meta,
    monto_actual,
    fecha_limite: fecha_limite ?? null,
    estado: estado as EstadoObjetivo | undefined,
  };
}

export async function actualizarObjetivo(
  request: Request,
  response: Response,
): Promise<void> {
  const id = Number(request.params['id']);
  const input = obtenerObjetivoInput(request.body);

  if (!Number.isInteger(id) || id <= 0 || input === null) {
    response.status(400).json({
      error: 'id, nombre, monto_meta y monto_actual deben ser válidos',
    });
    return;
  }

  try {
    const objetivo = await objetivoService.actualizarObjetivo(id, input);
    response.status(200).json(objetivo);
  } catch (error) {
    if (error instanceof Error && error.message === 'OBJETIVO_NOT_FOUND') {
      response.status(404).json({ error: 'Objetivo no encontrado' });
      return;
    }
    console.error('Error updating objetivo', error);
    response.status(500).json({ error: 'No se pudo actualizar el objetivo' });
  }
}

export async function eliminarObjetivo(
  request: Request,
  response: Response,
): Promise<void> {
  const id = Number(request.params['id']);

  if (!Number.isInteger(id) || id <= 0) {
    response.status(400).json({ error: 'El id del objetivo no es válido' });
    return;
  }

  try {
    await objetivoService.eliminarObjetivo(id);
    response.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'OBJETIVO_NOT_FOUND') {
      response.status(404).json({ error: 'Objetivo no encontrado' });
      return;
    }
    console.error('Error deleting objetivo', error);
    response.status(500).json({ error: 'No se pudo eliminar el objetivo' });
  }
}
