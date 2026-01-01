import { logger } from '../../../shared/logger.js';

/**
 * GET /api/v1/paises
 * Controller para listar países con filtros y paginación
 */
export class ListPaisesController {
  constructor({ listPaisesUseCase }) {
    this.listPaisesUseCase = listPaisesUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de países', {
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
      logger.error('Error al listar países', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

/**
 * GET /api/v1/departamentos
 * Controller para listar departamentos con filtros y paginación
 */
export class ListDepartamentosController {
  constructor({ listDepartamentosUseCase }) {
    this.listDepartamentosUseCase = listDepartamentosUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de departamentos', {
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
      logger.error('Error al listar departamentos', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

/**
 * GET /api/v1/provincias
 * Controller para listar provincias con filtros y paginación
 */
export class ListProvinciasController {
  constructor({ listProvinciasUseCase }) {
    this.listProvinciasUseCase = listProvinciasUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de provincias', {
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
      logger.error('Error al listar provincias', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

/**
 * GET /api/v1/municipios
 * Controller para listar municipios con filtros y paginación
 */
export class ListMunicipiosController {
  constructor({ listMunicipiosUseCase }) {
    this.listMunicipiosUseCase = listMunicipiosUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de municipios', {
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
      logger.error('Error al listar municipios', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

