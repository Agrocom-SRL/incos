/**
 * Clase base para errores personalizados de la aplicación
 * 
 * Ubicación: domain/errors (capa de dominio - más interna)
 * 
 * En Clean Architecture, los errores están en Domain porque:
 * - Domain es la capa más interna, sin dependencias externas
 * - Todas las demás capas (Application, Infrastructure, Presentation) pueden depender de Domain
 * - Los errores son conceptos del dominio de negocio (NotFoundError, ValidationError, etc.)
 * 
 * Estos errores pueden ser lanzados desde cualquier capa:
 * - Domain: Reglas de negocio
 * - Application: Casos de uso
 * - Infrastructure: Repositorios, servicios
 * - Presentation: Middlewares, controllers
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación (400)
 */
export class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Error de validación semántica / payload (422 Unprocessable Entity)
 */
export class UnprocessableEntityError extends AppError {
  constructor(message = 'Los datos proporcionados son inválidos', details = [], extensions = {}) {
    super(message, 422, 'VALIDATION_ERROR');
    this.details = details;
    this.extensions = extensions;
  }
}

/**
 * Error de recurso no encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

/**
 * Error de no autorizado (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Error de acceso denegado (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado', details) {
    super(message, 403, 'FORBIDDEN');
    if (details !== undefined) {
      this.details = details;
    }
  }
}

/**
 * Error de conflicto (409)
 *
 * `details` (opcional) viaja en la respuesta (`ErrorFormatter.formatOperationalError`)
 * para que el cliente pueda resolver el conflicto con información concreta
 * (p. ej. el desglose de notas pendientes al cerrar un libro de registro) sin
 * una segunda consulta.
 */
export class ConflictError extends AppError {
  constructor(message, details) {
    super(message, 409, 'CONFLICT');
    if (details !== undefined) {
      this.details = details;
    }
  }
}

