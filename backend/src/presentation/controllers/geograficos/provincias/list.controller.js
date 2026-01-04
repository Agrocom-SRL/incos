/**
 * GET /api/v1/provincias
 * Controller para listar provincias con filtros y paginación
 */
export class ListProvinciasController {
  constructor({ listProvinciasUseCase, logger }) {
    this.listProvinciasUseCase = listProvinciasUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de provincias', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listProvinciasUseCase) {
        throw new Error('ListProvinciasUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listProvinciasUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.provincias,
        message: 'Listado de provincias obtenido correctamente',
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
      this.logger.error('Error al listar provincias', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

