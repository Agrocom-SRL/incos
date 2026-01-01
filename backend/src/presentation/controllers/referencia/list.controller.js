import { logger } from '../../../shared/logger.js';

/**
 * GET /api/v1/idiomas
 * Controller para listar idiomas con filtros y paginación
 */
export class ListIdiomasController {
  constructor({ listIdiomasUseCase }) {
    this.listIdiomasUseCase = listIdiomasUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de idiomas', {
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
      logger.error('Error al listar idiomas', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

/**
 * GET /api/v1/estados-civiles
 * Controller para listar estados civiles con filtros y paginación
 */
export class ListEstadosCivilesController {
  constructor({ listEstadosCivilesUseCase }) {
    this.listEstadosCivilesUseCase = listEstadosCivilesUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de estados civiles', {
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
      logger.error('Error al listar estados civiles', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

/**
 * GET /api/v1/tipos-parentesco
 * Controller para listar tipos de parentesco con filtros y paginación
 */
export class ListTiposParentescoController {
  constructor({ listTiposParentescoUseCase }) {
    this.listTiposParentescoUseCase = listTiposParentescoUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de tipos de parentesco', {
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
      logger.error('Error al listar tipos de parentesco', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

/**
 * GET /api/v1/documentacion
 * Controller para listar tipos de documentación con filtros y paginación
 */
export class ListDocumentacionController {
  constructor({ listDocumentacionUseCase }) {
    this.listDocumentacionUseCase = listDocumentacionUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de tipos de documentación', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listDocumentacionUseCase) {
        throw new Error('ListDocumentacionUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listDocumentacionUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.documentacion,
        message: 'Listado de tipos de documentación obtenido correctamente',
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
      logger.error('Error al listar tipos de documentación', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

