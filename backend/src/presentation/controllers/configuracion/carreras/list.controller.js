/**
 * GET /api/v1/carreras
 * Controller para listar carreras con filtros y paginación
 */
export class ListCarrerasController {
  constructor({ listCarrerasUseCase, logger }) {
    this.listCarrerasUseCase = listCarrerasUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de carreras', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listCarrerasUseCase) {
        throw new Error('ListCarrerasUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listCarrerasUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.carreras,
        message: 'Listado de carreras obtenido correctamente',
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
      this.logger.error('Error al listar carreras', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

