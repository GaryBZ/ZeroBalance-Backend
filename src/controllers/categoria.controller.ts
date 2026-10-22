import { Request, Response } from 'express';
import { categoriaService } from '../services/categoria.service';

export async function obtenerCategorias(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const categorias = await categoriaService.obtenerCategorias();
    response.status(200).json(categorias);
  } catch (error) {
    console.error('Error fetching categorias', error);
    response.status(500).json({
      error: 'No se pudieron obtener las categorías',
    });
  }
}
