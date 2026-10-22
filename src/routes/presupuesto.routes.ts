import { Router } from 'express';
import { obtenerPresupuesto } from '../controllers/presupuesto.controller';
import { actualizarPresupuesto } from '../controllers/presupuesto.controller';

const presupuestoRoutes = Router();

presupuestoRoutes.get('/', obtenerPresupuesto);
presupuestoRoutes.put('/', actualizarPresupuesto);

export default presupuestoRoutes;
