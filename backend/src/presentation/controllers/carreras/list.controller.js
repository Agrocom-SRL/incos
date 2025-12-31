import { logger } from '../../../shared/logger.js';
import container from '../../../infrastructure/container/index.js';

/**
 * GET /api/v1/carreras
 * Controller para listar carreras con filtros y paginación
 * 
 * NOTA: Implementación rápida - usa repositorio directamente
 * TODO: Crear Use Case cuando se tenga tiempo
 */
export class ListCarrerasController {
  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search, sort } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de carreras', {
        page,
        limit,
        filters: { search },
        userId,
      });

      // Obtener repositorio del container
      const careerRepository = container.resolve('careerRepository');

      // Construir filtros (el formato que espera BaseRepository.findAll)
      const filters = {};
      if (search) {
        filters.search = search;
      }
      if (sort) {
        filters.sort = sort;
      }

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;

      // Obtener carreras usando el método findAll del BaseRepository
      // Formato: findAll(filters, page, limit)
      const result = await careerRepository.findAll(filters, pageNum, limitNum);

      // El resultado de findAll viene en formato: { careers: Array, total: number }
      // Necesitamos extraer el array de carreras
      const careers = result.careers || result.data || [];
      const total = result.total || 0;
      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: careers,
        message: 'Listado de carreras obtenido correctamente',
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          totalPages: totalPages,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error al listar carreras', { 
        error: error.message, 
        stack: error.stack 
      });
      next(error);
    }
  }
}

