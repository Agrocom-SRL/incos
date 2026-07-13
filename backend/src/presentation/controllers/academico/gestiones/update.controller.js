/**
 * PUT /api/v1/gestiones/:id
 * Controller para actualizar una gestión académica
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP PUT para editar gestiones
 * - Delegar lógica de negocio a UpdateGestionUseCase
 * - Formatear respuesta JSON estandarizada (200, data.gestion)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP de la edición
 * - Dependency Inversion: Depende de UpdateGestionUseCase (abstracción)
 */
export class UpdateGestionController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {UpdateGestionUseCase} params.useCase - Caso de uso de actualización
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
   */
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.body, req.usuario?.id ?? null);
      return this.responseFormatter.updated(res, result, 'gestión', id, req);
    } catch (e) {
      return next(e);
    }
  }
}
