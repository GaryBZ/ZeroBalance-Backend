import { Router } from 'express';
import { obtenerCategorias } from '../controllers/categoria.controller';

const categoriaRoutes = Router();

categoriaRoutes.get('/', obtenerCategorias);

export default categoriaRoutes;
