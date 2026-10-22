import { Router } from 'express';
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  obtenerMovimientos,
} from '../controllers/movimiento.controller';

const movimientoRoutes = Router();

movimientoRoutes.get('/', obtenerMovimientos);
movimientoRoutes.post('/', crearMovimiento);
movimientoRoutes.put('/:id', actualizarMovimiento);
movimientoRoutes.delete('/:id', eliminarMovimiento);

export default movimientoRoutes;
