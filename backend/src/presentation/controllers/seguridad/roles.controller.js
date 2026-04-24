/**
 * Controlador HTTP: roles y permisos por rol (SEG).
 */
export class SeguridadRolesController {
  /**
   * @param {Object} deps
   */
  constructor({
    listarRolesUseCase,
    obtenerPermisosRolUseCase,
    obtenerPermisosGrillaRolUseCase,
    actualizarPermisosRolUseCase,
    responseFormatter,
  }) {
    this.listarRolesUseCase = listarRolesUseCase;
    this.obtenerPermisosRolUseCase = obtenerPermisosRolUseCase;
    this.obtenerPermisosGrillaRolUseCase = obtenerPermisosGrillaRolUseCase;
    this.actualizarPermisosRolUseCase = actualizarPermisosRolUseCase;
    this.responseFormatter = responseFormatter;
  }

  list = async (req, res, next) => {
    try {
      const data = await this.listarRolesUseCase.execute();
      return this.responseFormatter._success(
        res,
        data,
        { statusCode: 200, message: 'Roles obtenidos correctamente' },
        req
      );
    } catch (e) {
      next(e);
    }
  };

  getPermisos = async (req, res, next) => {
    try {
      const rolId = parseInt(req.params.id, 10);
      const data = await this.obtenerPermisosRolUseCase.execute(rolId);
      return this.responseFormatter._success(
        res,
        data,
        { statusCode: 200, message: 'Permisos del rol obtenidos correctamente' },
        req
      );
    } catch (e) {
      next(e);
    }
  };

  getPermisosGrilla = async (req, res, next) => {
    try {
      const rolId = parseInt(req.params.id, 10);
      const { dominio } = req.query;
      const data = await this.obtenerPermisosGrillaRolUseCase.execute(rolId, dominio);
      return this.responseFormatter._success(
        res,
        data,
        { statusCode: 200, message: 'Permisos de grilla obtenidos correctamente' },
        req
      );
    } catch (e) {
      next(e);
    }
  };

  putPermisos = async (req, res, next) => {
    try {
      const rolId = parseInt(req.params.id, 10);
      const data = await this.actualizarPermisosRolUseCase.execute(rolId, req.body);
      return this.responseFormatter._success(
        res,
        data,
        { statusCode: 200, message: 'Permisos del rol actualizados correctamente' },
        req
      );
    } catch (e) {
      next(e);
    }
  };
}
