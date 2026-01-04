/**
 * GET /api/v1/idiomas
 * Controller para listar idiomas con filtros y paginación
 */
export class ListIdiomasController {
  constructor({ listIdiomasUseCase, logger }) {
    this.listIdiomasUseCase = listIdiomasUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de idiomas', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listIdiomasUseCase) {
        throw new Error('ListIdiomasUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listIdiomasUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.idiomas,
        message: 'Listado de idiomas obtenido correctamente',
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
      this.logger.error('Error al listar idiomas', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

