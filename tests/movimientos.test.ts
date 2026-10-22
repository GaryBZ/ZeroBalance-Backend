import request from 'supertest';
import app from '../src/app';
import { movimientoService } from '../src/services/movimiento.service';

jest.mock('../src/services/movimiento.service', () => ({
  movimientoService: {
    crearMovimiento: jest.fn(),
    obtenerMovimientos: jest.fn(),
  },
}));

describe('POST /api/movimientos', () => {
  it('debería crear un movimiento y devolver status 201', async () => {
    const movimientoCreado = {
      id: 1,
      tipo: 'gasto' as const,
      monto: 86.4,
      descripcion: 'Compra del supermercado',
      fecha: '2026-10-17T23:00:00.000Z',
      categoria_id: 2,
    };

    jest
      .mocked(movimientoService.crearMovimiento)
      .mockResolvedValue(movimientoCreado);

    const response = await request(app)
      .post('/api/movimientos')
      .send({
        tipo: 'gasto',
        monto: 86.4,
        descripcion: 'Compra del supermercado',
        categoria_id: 2,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(movimientoCreado);
    expect(movimientoService.crearMovimiento).toHaveBeenCalledWith({
      tipo: 'gasto',
      monto: 86.4,
      descripcion: 'Compra del supermercado',
      categoria_id: 2,
    });
  });

  describe('GET /api/movimientos', () => {
    it('debería devolver un arreglo de movimientos con status 200', async () => {
      const movimientos = [
        {
          id: 2,
          tipo: 'gasto' as const,
          monto: 45.5,
          descripcion: 'Compra de comida',
          fecha: '2026-10-17T23:00:00.000Z',
          categoria_id: 2,
        },
        {
          id: 1,
          tipo: 'ingreso' as const,
          monto: 3000,
          descripcion: 'Nómina mensual',
          fecha: '2026-10-01T12:00:00.000Z',
          categoria_id: null,
        },
      ];

      jest
        .mocked(movimientoService.obtenerMovimientos)
        .mockResolvedValue(movimientos);

      const response = await request(app).get('/api/movimientos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(movimientos);
      expect(movimientoService.obtenerMovimientos).toHaveBeenCalledTimes(1);
    });
  });
});
