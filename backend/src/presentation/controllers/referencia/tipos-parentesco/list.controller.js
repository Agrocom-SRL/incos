/**
 * GET /api/v1/tipos-parentesco
 * Controller para listar tipos de parentesco con filtros y paginación
 */
export class ListTiposParentescoController {
  constructor({ listTiposParentescoUseCase, logger }) {
    this.listTiposParentescoUseCase = listTiposParentescoUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de tipos de parentesco', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listTiposParentescoUseCase) {
        throw new Error('ListTiposParentescoUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listTiposParentescoUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.tiposParentesco,
        message: 'Listado de tipos de parentesco obtenido correctamente',
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
      this.logger.error('Error al listar tipos de parentesco', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

