/**
 * GET /api/v1/discapacidad
 * Controller para listar tipos de discapacidad con filtros y paginación
 */
export class ListDiscapacidadController {
  constructor({ listDiscapacidadUseCase, logger }) {
    this.listDiscapacidadUseCase = listDiscapacidadUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de tipos de discapacidad', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listDiscapacidadUseCase) {
        throw new Error('ListDiscapacidadUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listDiscapacidadUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.discapacidades,
        message: 'Listado de tipos de discapacidad obtenido correctamente',
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
      this.logger.error('Error al listar tipos de discapacidad', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

