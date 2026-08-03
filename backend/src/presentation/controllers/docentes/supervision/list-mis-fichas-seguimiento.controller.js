/**
 * GET /api/v1/supervision-docente/mis-fichas (S5)
 * Fichas de los cursos del docente de la SESIÓN (vista 174 WHERE docente_id).
 * Gate solo [authenticate]: el docente se resuelve en servidor (anti-IDOR,
 * 403 si el usuario no está vinculado a un docente).
 * dataFieldName: 'fichasSeguimiento'.
 */
export class ListMisFichasSeguimientoController {
  constructor({ listMisFichasSeguimientoDocenteUseCase, logger, responseFormatter }) {
    this.listMisFichasSeguimientoDocenteUseCase = listMisFichasSeguimientoDocenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      this.logger.info('[Supervisión docente] Mis fichas solicitado', { usuarioId });

      const data = await this.listMisFichasSeguimientoDocenteUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mis fichas de seguimiento obtenidas correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Supervisión docente] Error al obtener mis fichas', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
