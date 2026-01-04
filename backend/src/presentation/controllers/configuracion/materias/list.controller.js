/**
 * GET /api/v1/materias
 * Controller para listar materias con filtros y paginación
 */
export class ListMateriasController {
  constructor({ listMateriasUseCase, logger }) {
    this.listMateriasUseCase = listMateriasUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de materias', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listMateriasUseCase) {
        throw new Error('ListMateriasUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listMateriasUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.materias,
        message: 'Listado de materias obtenido correctamente',
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
      this.logger.error('Error al listar materias', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

