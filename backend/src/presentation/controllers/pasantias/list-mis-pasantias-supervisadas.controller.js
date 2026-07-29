/**
 * GET /api/v1/pasantias/mis-pasantias (P18)
 * Bandeja del docente supervisor de la SESIÓN (vista 167 WHERE
 * docente_supervisor_id). dataFieldName: 'misPasantias'. El docente se
 * resuelve en servidor (anti-IDOR).
 */
export class ListMisPasantiasSupervisadasController {
  constructor({ listMisPasantiasSupervisadasUseCase, logger, responseFormatter }) {
    this.listMisPasantiasSupervisadasUseCase = listMisPasantiasSupervisadasUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      this.logger.info('[Pasantías] Mis pasantías supervisadas solicitado', { usuarioId });

      const data = await this.listMisPasantiasSupervisadasUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mis pasantías supervisadas obtenidas correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al obtener mis pasantías supervisadas', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
