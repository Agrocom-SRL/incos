/**
 * Controlador HTTP: administración de usuarios y overrides (SEG).
 */
export class SeguridadUsuariosController {
  /**
   * @param {Object} deps
   */
  constructor({
    listarUsuariosUseCase,
    obtenerUsuarioUseCase,
    crearUsuarioUseCase,
    buscarParaAltaUsuarioEstudiantesUseCase,
    buscarParaAltaUsuarioDocentesUseCase,
    actualizarUsuarioUseCase,
    cambiarEstadoUsuarioUseCase,
    cambiarPasswordUsuarioUseCase,
    obtenerPermisosUsuarioUseCase,
    agregarOverridePermisoUseCase,
    eliminarOverridePermisoUseCase,
    responseFormatter,
  }) {
    this.listarUsuariosUseCase = listarUsuariosUseCase;
    this.obtenerUsuarioUseCase = obtenerUsuarioUseCase;
    this.crearUsuarioUseCase = crearUsuarioUseCase;
    this.buscarParaAltaUsuarioEstudiantesUseCase = buscarParaAltaUsuarioEstudiantesUseCase;
    this.buscarParaAltaUsuarioDocentesUseCase = buscarParaAltaUsuarioDocentesUseCase;
    this.actualizarUsuarioUseCase = actualizarUsuarioUseCase;
    this.cambiarEstadoUsuarioUseCase = cambiarEstadoUsuarioUseCase;
    this.cambiarPasswordUsuarioUseCase = cambiarPasswordUsuarioUseCase;
    this.obtenerPermisosUsuarioUseCase = obtenerPermisosUsuarioUseCase;
    this.agregarOverridePermisoUseCase = agregarOverridePermisoUseCase;
    this.eliminarOverridePermisoUseCase = eliminarOverridePermisoUseCase;
    this.responseFormatter = responseFormatter;
  }

  list = async (req, res, next) => {
    try {
      const result = await this.listarUsuariosUseCase.execute(req.query);
      return this.responseFormatter.list(
        res,
        result.usuarios,
        result.pagination,
        'usuarios',
        req
      );
    } catch (e) {
      next(e);
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.obtenerUsuarioUseCase.execute(id);
      return this.responseFormatter.retrieved(res, data, 'usuario', id, req);
    } catch (e) {
      next(e);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await this.crearUsuarioUseCase.execute(req.body);
      return this.responseFormatter.created(res, data, 'usuario', data.id, req);
    } catch (e) {
      next(e);
    }
  };

  buscarEstudiantesParaAlta = async (req, res, next) => {
    try {
      const limit = req.query.limit ?? 20;
      const rows = await this.buscarParaAltaUsuarioEstudiantesUseCase.execute(req.query.query, limit);
      return this.responseFormatter._success(
        res,
        { estudiantes: rows },
        { statusCode: 200, message: 'Búsqueda realizada correctamente' },
        req
      );
    } catch (e) {
      next(e);
    }
  };

  buscarDocentesParaAlta = async (req, res, next) => {
    try {
      const limit = req.query.limit ?? 20;
      const rows = await this.buscarParaAltaUsuarioDocentesUseCase.execute(req.query.query, limit);
      return this.responseFormatter._success(
        res,
        { docentes: rows },
        { statusCode: 200, message: 'Búsqueda realizada correctamente' },
        req
      );
    } catch (e) {
      next(e);
    }
  };

  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.actualizarUsuarioUseCase.execute(id, req.body);
      return this.responseFormatter.updated(res, data, 'usuario', id, req);
    } catch (e) {
      next(e);
    }
  };

  patchEstado = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.cambiarEstadoUsuarioUseCase.execute(id, {
        estado: req.body.estado,
        motivo: req.body.motivo,
      });
      return this.responseFormatter.updated(res, data, 'usuario', id, req);
    } catch (e) {
      next(e);
    }
  };

  patchPassword = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.cambiarPasswordUsuarioUseCase.execute(
        id,
        req.body.password_nuevo
      );
      return this.responseFormatter.updated(res, data, 'usuario', id, req);
    } catch (e) {
      next(e);
    }
  };

  getPermisos = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.obtenerPermisosUsuarioUseCase.execute(id);
      return this.responseFormatter._success(
        res,
        data,
        { statusCode: 200, message: 'Permisos del usuario obtenidos correctamente' },
        req
      );
    } catch (e) {
      next(e);
    }
  };

  addPermiso = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.agregarOverridePermisoUseCase.execute(id, req.body);
      return this.responseFormatter.created(
        res,
        data,
        'override de permiso',
        data.id,
        req
      );
    } catch (e) {
      next(e);
    }
  };

  deletePermiso = async (req, res, next) => {
    try {
      const usuarioId = parseInt(req.params.id, 10);
      const overrideId = parseInt(req.params.overrideId, 10);
      const data = await this.eliminarOverridePermisoUseCase.execute(
        usuarioId,
        overrideId
      );
      return this.responseFormatter._success(
        res,
        data,
        { statusCode: 200, message: data.message },
        req
      );
    } catch (e) {
      next(e);
    }
  };
}
