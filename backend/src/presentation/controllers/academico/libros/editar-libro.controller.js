/**
 * PATCH /api/v1/libros/:id — edita/cierra el libro (dataFieldName: `libro`;
 * al cerrar, además `cierre` = { forzado, pendientesAsentados,
 * filasSincronizadas }). Con notas pendientes y sin `forzarCierre` responde
 * 409 CONFLICT con `details.pendientes` (desglose para el modal del frontend).
 *
 * Identidad: `req.usuario` (la asigna `auth.middleware.js`; `req.user` no
 * existe en este backend). El username viaja al sello de auditoría del cierre.
 */
export class EditarLibroController {
  constructor({ editarLibroUseCase, logger, responseFormatter }) {
    this.editarLibroUseCase = editarLibroUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.editarLibroUseCase.execute({
        usuarioId: req.usuario?.id ?? null,
        usuarioNombre: req.usuario?.username ?? null,
        id: Number(req.params.id),
        body: req.body,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Libro de registro actualizado' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error PATCH libro', { error: error.message });
      return next(error);
    }
  }
}

export default EditarLibroController;
