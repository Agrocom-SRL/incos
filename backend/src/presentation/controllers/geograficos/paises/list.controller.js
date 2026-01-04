/**
 * GET /api/v1/paises
 * Controller para listar países con filtros y paginación
 */
export class ListPaisesController {
  constructor({ listPaisesUseCase, logger }) {
    this.listPaisesUseCase = listPaisesUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de países', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listPaisesUseCase) {
        throw new Error('ListPaisesUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listPaisesUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.paises,
        message: 'Listado de países obtenido correctamente',
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
      this.logger.error('Error al listar países', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

