import cors from 'cors';
import express from 'express';
import movimientoRoutes from './routes/movimientoRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/movimientos', movimientoRoutes);

export default app;
