/**
 * GET /api/v1/estados-civiles
 * Controller para listar estados civiles con filtros y paginación
 */
export class ListEstadosCivilesController {
  constructor({ listEstadosCivilesUseCase, logger }) {
    this.listEstadosCivilesUseCase = listEstadosCivilesUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de estados civiles', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listEstadosCivilesUseCase) {
        throw new Error('ListEstadosCivilesUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listEstadosCivilesUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.estadosCiviles,
        message: 'Listado de estados civiles obtenido correctamente',
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
      this.logger.error('Error al listar estados civiles', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

