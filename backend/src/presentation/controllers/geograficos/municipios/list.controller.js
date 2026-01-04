/**
 * GET /api/v1/municipios
 * Controller para listar municipios con filtros y paginación
 */
export class ListMunicipiosController {
  constructor({ listMunicipiosUseCase, logger }) {
    this.listMunicipiosUseCase = listMunicipiosUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      this.logger.info('Request de listado de municipios', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listMunicipiosUseCase) {
        throw new Error('ListMunicipiosUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listMunicipiosUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.municipios,
        message: 'Listado de municipios obtenido correctamente',
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
      this.logger.error('Error al listar municipios', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

