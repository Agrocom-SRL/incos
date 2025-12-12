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

      // TODO: Implementar ListStudentsUseCase
      // const result = await this.listStudentsUseCase.execute({
      //   page: parseInt(page),
      //   limit: parseInt(limit),
      //   search,
      //   carreraId: carrera ? parseInt(carrera) : undefined,
      //   estado,
      //   gestion,
      //   sort,
      // }, userId);

      // Por ahora retornar placeholder
      res.status(200).json({
        success: true,
        data: [],
        message: 'Listado de estudiantes (pendiente de implementación)',
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
