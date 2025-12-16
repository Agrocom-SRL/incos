import { logger } from '../../../shared/logger.js';
import { StudentMapper } from '../../../application/mappers/StudentMapper.js';
import container from '../../../infrastructure/container/index.js';

/**
 * GET /api/v1/estudiantes
 * Controller para listar estudiantes con filtros y paginación
 * 
 * NOTA: Implementación rápida para presentación - usa repositorio directamente
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

      // Implementación rápida: usar repositorio directamente
      // TODO: Crear ListStudentsUseCase cuando se tenga tiempo
      const studentRepository = container.resolve('studentRepository');
      
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

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      // Obtener estudiantes con paginación
      const result = await studentRepository.findAll(
        filters,
        pageNum,
        limitNum
      );

      // Convertir entidades a formato de presentación (castellano)
      const estudiantesData = StudentMapper.entitiesToPresentation(
        result.students || []
      );

      // Calcular total de páginas
      const totalPages = Math.ceil(result.total / limitNum);

      res.status(200).json({
        success: true,
        data: estudiantesData,
        message: 'Listado de estudiantes obtenido correctamente',
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: totalPages,
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
