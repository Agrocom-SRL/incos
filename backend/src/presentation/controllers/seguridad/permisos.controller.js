/**
 * Controlador HTTP: catálogo de permisos (SEG).
 */
export class SeguridadPermisosController {
  /**
   * @param {Object} deps
   */
  constructor({ listarPermisosUseCase, responseFormatter }) {
    this.listarPermisosUseCase = listarPermisosUseCase;
    this.responseFormatter = responseFormatter;
  }

  list = async (req, res, next) => {
    try {
      const data = await this.listarPermisosUseCase.execute(req.query);
      return this.responseFormatter._success(
        res,
        data,
        { statusCode: 200, message: 'Catálogo de permisos obtenido correctamente' },
        req
      );
    } catch (e) {
      next(e);
    }
  };
}
