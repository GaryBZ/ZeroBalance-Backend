import { Router } from 'express';
import {
  crearMovimiento,
  obtenerMovimientos,
} from '../controllers/movimiento.controller';

const movimientoRoutes = Router();

movimientoRoutes.get('/', obtenerMovimientos);
movimientoRoutes.post('/', crearMovimiento);

export default movimientoRoutes;
