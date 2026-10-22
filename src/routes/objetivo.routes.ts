import { Router } from 'express';
import {
  actualizarAhorro,
  actualizarObjetivo,
  crearObjetivo,
  eliminarObjetivo,
  obtenerObjetivos,
} from '../controllers/objetivo.controller';

const objetivoRoutes = Router();

objetivoRoutes.get('/', obtenerObjetivos);
objetivoRoutes.post('/', crearObjetivo);
objetivoRoutes.put('/:id', actualizarObjetivo);
objetivoRoutes.patch('/:id/ahorro', actualizarAhorro);
objetivoRoutes.delete('/:id', eliminarObjetivo);

export default objetivoRoutes;
