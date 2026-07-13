/**
 * POST /api/v1/gestiones
 * Controller para crear una gestión académica
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para crear gestiones
 * - Delegar lógica de negocio a CreateGestionUseCase
 * - Formatear respuesta JSON estandarizada (201, data.gestion)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP de la creación
 * - Dependency Inversion: Depende de CreateGestionUseCase (abstracción)
 */
export class CreateGestionController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {CreateGestionUseCase} params.useCase - Caso de uso de creación
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
   */
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const result = await this.useCase.execute(req.body, req.usuario?.id ?? null);
      return this.responseFormatter.created(res, result, 'gestión', result.gestion.id, req);
    } catch (e) {
      return next(e);
    }
  }
}
