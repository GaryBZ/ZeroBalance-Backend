import { Request, Response } from 'express';
import { Frecuencia, GastoRecurrenteInput, recurrenteService } from '../services/recurrente.service';

function validar(body: unknown): GastoRecurrenteInput | null {
  const input = body as Partial<GastoRecurrenteInput>;
  if (
    typeof input.descripcion !== 'string' || input.descripcion.trim() === '' ||
    typeof input.monto !== 'number' || !Number.isFinite(input.monto) || input.monto <= 0 ||
    !['semanal', 'mensual', 'anual'].includes(input.frecuencia ?? '') ||
    typeof input.proxima_fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.proxima_fecha) ||
    (input.categoria_id !== undefined && input.categoria_id !== null &&
      (!Number.isInteger(input.categoria_id) || input.categoria_id <= 0))
  ) return null;
  return {
    descripcion: input.descripcion.trim(),
    monto: input.monto,
    categoria_id: input.categoria_id ?? null,
    frecuencia: input.frecuencia as Frecuencia,
    proxima_fecha: input.proxima_fecha,
    activo: input.activo ?? true,
  };
}

export async function listarRecurrentes(_req: Request, res: Response): Promise<void> {
  try { res.json(await recurrenteService.listar()); }
  catch (error) { console.error('Error fetching recurrentes', error); res.status(500).json({ error: 'No se pudieron obtener los gastos recurrentes' }); }
}

export async function crearRecurrente(req: Request, res: Response): Promise<void> {
  const input = validar(req.body);
  if (!input) { res.status(400).json({ error: 'Los datos del gasto recurrente no son válidos' }); return; }
  try { res.status(201).json(await recurrenteService.crear(input)); }
  catch (error) { console.error('Error creating recurrente', error); res.status(500).json({ error: 'No se pudo crear el gasto recurrente' }); }
}

export async function actualizarRecurrente(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  const input = validar(req.body);
  if (!Number.isInteger(id) || id <= 0 || !input) { res.status(400).json({ error: 'Los datos del gasto recurrente no son válidos' }); return; }
  try { res.json(await recurrenteService.actualizar(id, input)); }
  catch (error) {
    if (error instanceof Error && error.message === 'RECURRENTE_NOT_FOUND') { res.status(404).json({ error: 'Gasto recurrente no encontrado' }); return; }
    console.error('Error updating recurrente', error); res.status(500).json({ error: 'No se pudo actualizar el gasto recurrente' });
  }
}

export async function eliminarRecurrente(req: Request, res: Response): Promise<void> {
  const id = Number(req.params['id']);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: 'El id no es válido' }); return; }
  try { await recurrenteService.eliminar(id); res.status(204).send(); }
  catch (error) {
    if (error instanceof Error && error.message === 'RECURRENTE_NOT_FOUND') { res.status(404).json({ error: 'Gasto recurrente no encontrado' }); return; }
    console.error('Error deleting recurrente', error); res.status(500).json({ error: 'No se pudo eliminar el gasto recurrente' });
  }
}
