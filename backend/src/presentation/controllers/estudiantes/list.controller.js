import { logger } from '../../../shared/logger.js';

/**
 * GET /api/v1/estudiantes
 * Controller para listar estudiantes con filtros y paginación
 */
export class ListStudentsController {
  constructor({ listStudentsUseCase }) {
    this.listStudentsUseCase = listStudentsUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search, carrera, estado, gestion, sort } =
        req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de estudiantes', {
        page,
        limit,
        filters: { search, carrera, estado, gestion },
        userId,
      });

      if (!this.listStudentsUseCase) {
        throw new Error('ListStudentsUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }
      if (estado) {
        filters.estado = estado;
      }
      if (sort) {
        filters.sort = sort;
      }

      const result = await this.listStudentsUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.students,
        message: 'Listado de estudiantes obtenido correctamente',
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error al listar estudiantes', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}
