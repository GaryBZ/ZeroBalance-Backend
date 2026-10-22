import { Router } from 'express';
import { actualizarRecurrente, crearRecurrente, eliminarRecurrente, listarRecurrentes } from '../controllers/recurrente.controller';

const recurrenteRoutes = Router();
recurrenteRoutes.get('/', listarRecurrentes);
recurrenteRoutes.post('/', crearRecurrente);
recurrenteRoutes.put('/:id', actualizarRecurrente);
recurrenteRoutes.delete('/:id', eliminarRecurrente);
export default recurrenteRoutes;
