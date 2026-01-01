import { logger } from '../../../shared/logger.js';

/**
 * GET /api/v1/carreras
 * Controller para listar carreras con filtros y paginación
 */
export class ListCarrerasController {
  constructor({ listCarrerasUseCase }) {
    this.listCarrerasUseCase = listCarrerasUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de carreras', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listCarrerasUseCase) {
        throw new Error('ListCarrerasUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listCarrerasUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.carreras,
        message: 'Listado de carreras obtenido correctamente',
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
      logger.error('Error al listar carreras', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

/**
 * GET /api/v1/materias
 * Controller para listar materias con filtros y paginación
 */
export class ListMateriasController {
  constructor({ listMateriasUseCase }) {
    this.listMateriasUseCase = listMateriasUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de materias', {
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
      logger.error('Error al listar materias', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

/**
 * GET /api/v1/discapacidad
 * Controller para listar tipos de discapacidad con filtros y paginación
 */
export class ListDiscapacidadController {
  constructor({ listDiscapacidadUseCase }) {
    this.listDiscapacidadUseCase = listDiscapacidadUseCase;
  }

  async handle(req, res, next) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const userId = req.user?.id || req.user?.userId;

      logger.info('Request de listado de tipos de discapacidad', {
        page,
        limit,
        filters: { search },
        userId,
      });

      if (!this.listDiscapacidadUseCase) {
        throw new Error('ListDiscapacidadUseCase no está configurado');
      }
      
      const filters = {};
      if (search) {
        filters.search = search;
      }

      const result = await this.listDiscapacidadUseCase.execute(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.discapacidades,
        message: 'Listado de tipos de discapacidad obtenido correctamente',
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
      logger.error('Error al listar tipos de discapacidad', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

