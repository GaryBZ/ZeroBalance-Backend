import request from 'supertest';
import app from '../src/app';
import { movimientoService } from '../src/services/movimiento.service';

jest.mock('../src/services/movimientoService', () => ({
  movimientoService: {
    crearMovimiento: jest.fn(),
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
});
