/**
 * GET /api/v1/departamentos
 * Controller para listar departamentos con filtros y paginación
 */
export class ListDepartamentosController {
  constructor({ listDepartamentosUseCase, logger }) {
    this.listDepartamentosUseCase = listDepartamentosUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de departamentos', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listDepartamentosUseCase) {
        throw new Error('ListDepartamentosUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listDepartamentosUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.departamentos,
        message: 'Listado de departamentos obtenido correctamente',
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
      this.logger.error('Error al listar departamentos', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

