import { Router } from 'express';
import { crearMovimiento } from '../controllers/movimientoController';

const movimientoRoutes = Router();

movimientoRoutes.post('/', crearMovimiento);

export default movimientoRoutes;
