/**
 * Servicio de formateo de respuestas exitosas para HTTP
 *
 * Responsabilidades:
 * - Formatear respuestas exitosas con estructura estándar
 * - Manejar diferentes tipos de respuestas (listado con paginación, creación, etc.)
 * - Agregar metadatos comunes (timestamp, requestId)
 * - Mantener consistencia en el formato de respuestas exitosas
 *
 * Ubicación: infrastructure/services (capa de infraestructura)
 *
 * Este servicio separa la lógica de formateo de los controllers,
 * siguiendo el principio de Single Responsibility (SRP) y manteniendo
 * consistencia con ErrorFormatter.
 *
 * Principios SOLID:
 * - Single Responsibility: Solo formatea respuestas exitosas
 * - DRY: Evita duplicación de código de formateo entre controllers
 *
 * Clean Architecture:
 * - Infrastructure Layer: Servicio para formatear respuestas HTTP
 * - Se inyecta en controllers a través de DI (igual que ErrorFormatter)
 *
 * @example
 * // En un controller (inyectado):
 * constructor({ useCase, logger, responseFormatter }) {
 *   this.responseFormatter = responseFormatter;
 * }
 *
 * // Uso:
 * const result = await this.useCase.execute(data);
 * return this.responseFormatter.created(res, result[this.dataFieldName], this.resourceName);
 */
export class ResponseFormatter {
  /**
   * Formatea una respuesta exitosa estándar
   * Método interno usado por otros métodos específicos
   *
   * @private
   * @param {Object} res - Response de Express
   * @param {*} data - Datos a incluir en la respuesta
   * @param {Object} options - Opciones de formateo
   * @param {number} options.statusCode - Código de estado HTTP (default: 200)
   * @param {string} options.message - Mensaje de éxito (opcional)
   * @param {Object} options.pagination - Información de paginación (opcional)
   * @param {Object} req - Request de Express (para requestId)
   * @returns {Object} Response de Express
   */
  _success(res, data, options = {}, req = null) {
    const {
      statusCode = 200,
      message = null,
      pagination = null,
    } = options;

    const response = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...(req?.id && { requestId: req.id }),
      },
    };

    if (message) {
      response.message = message;
    }

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Formatea una respuesta de listado con paginación
   *
   * @param {Object} res - Response de Express
   * @param {Array} data - Array de datos
   * @param {Object} pagination - Información de paginación
   * @param {number} pagination.page - Página actual
   * @param {number} pagination.limit - Límite por página
   * @param {number} pagination.total - Total de registros
   * @param {number} pagination.totalPages - Total de páginas
   * @param {string} resourceName - Nombre del recurso (para mensaje)
   * @param {Object} req - Request de Express (para requestId)
   * @returns {Object} Response de Express
   */
  list(res, data, pagination, resourceName, req = null) {
    return this._success(res, data, {
      statusCode: 200,
      message: `Listado de ${resourceName} obtenido correctamente`,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    }, req);
  }

  /**
   * Formatea una respuesta de creación (201 Created)
   *
   * @param {Object} res - Response de Express
   * @param {*} data - Datos del recurso creado
   * @param {string} resourceName - Nombre del recurso (para mensaje)
   * @param {number|string} resourceId - ID del recurso creado
   * @param {Object} req - Request de Express (para requestId)
   * @returns {Object} Response de Express
   */
  created(res, data, resourceName, resourceId, req = null) {
    const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    return this._success(res, data, {
      statusCode: 201,
      message: `${capitalizedName} (ID: ${resourceId}) creado correctamente`,
    }, req);
  }

  /**
   * Formatea una respuesta de obtención por ID (200 OK)
   *
   * @param {Object} res - Response de Express
   * @param {*} data - Datos del recurso obtenido (debe contener el ID)
   * @param {string} resourceName - Nombre del recurso (para mensaje)
   * @param {number|string} resourceId - ID del recurso obtenido
   * @param {Object} req - Request de Express (para requestId)
   * @returns {Object} Response de Express
   */
  retrieved(res, data, resourceName, resourceId, req = null) {
    const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    return this._success(res, data, {
      statusCode: 200,
      message: `${capitalizedName} (ID: ${resourceId}) obtenido correctamente`,
    }, req);
  }

  /**
   * Formatea una respuesta de actualización (200 OK)
   *
   * @param {Object} res - Response de Express
   * @param {*} data - Datos del recurso actualizado (debe contener el ID)
   * @param {string} resourceName - Nombre del recurso (para mensaje)
   * @param {number|string} resourceId - ID del recurso actualizado
   * @param {Object} req - Request de Express (para requestId)
   * @returns {Object} Response de Express
   */
  updated(res, data, resourceName, resourceId, req = null) {
    const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    return this._success(res, data, {
      statusCode: 200,
      message: `${capitalizedName} (ID: ${resourceId}) actualizado correctamente`,
    }, req);
  }

  /**
   * Formatea una respuesta de generación de documento (200 OK)
   *
   * @param {Object} res - Response de Express
   * @param {*} data - Datos del documento generado
   * @param {string} resourceName - Nombre del recurso (para mensaje)
   * @param {number|string} resourceId - ID del recurso para el cual se generó el documento
   * @param {Object} req - Request de Express (para requestId)
   * @returns {Object} Response de Express
   */
  generated(res, data, resourceName, resourceId, req = null) {
    const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    return this._success(res, data, {
      statusCode: 200,
      message: `${capitalizedName} (ID: ${resourceId}) generada correctamente`,
    }, req);
  }

  /**
   * Formatea una respuesta de eliminación (200 OK)
   *
   * @param {Object} res - Response de Express
   * @param {string} resourceName - Nombre del recurso (para mensaje)
   * @param {number|string} resourceId - ID del recurso eliminado
   * @param {Object} req - Request de Express (para requestId)
   * @returns {Object} Response de Express
   */
  deleted(res, resourceName, resourceId, req = null) {
    const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    return this._success(res, null, {
      statusCode: 200,
      message: `${capitalizedName} (ID: ${resourceId}) eliminado correctamente`,
    }, req);
  }
}

/**
 * Instancia singleton del ResponseFormatter
 * Se registra en el container para inyección de dependencias
 */
export const responseFormatter = new ResponseFormatter();

export default responseFormatter;
