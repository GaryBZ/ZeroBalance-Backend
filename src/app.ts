import cors from 'cors';
import express from 'express';
import categoriaRoutes from './routes/categoria.routes';
import movimientoRoutes from './routes/movimiento.routes';
import objetivoRoutes from './routes/objetivo.routes';
import presupuestoRoutes from './routes/presupuesto.routes';
import recurrenteRoutes from './routes/recurrente.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/categorias', categoriaRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/objetivos', objetivoRoutes);
app.use('/api/presupuestos', presupuestoRoutes);
app.use('/api/recurrentes', recurrenteRoutes);

export default app;
