/**
 * Grilla de Nivelación de un paralelo (P1 nivel 2): asignaturas (columnas) +
 * estudiantes con celdas nota/evento. NO reutiliza el pivote de Centralizador
 * (decisión de arquitectura, ver docs/plan/calificaciones-centralizador-nivelacion-rediseno.md).
 */

export class ObtenerNivelacionParaleloUseCase {
  /**
   * @param {import('@infrastructure/repositories/NivelacionRepository.js').default} nivelacionRepository
   */
  constructor(nivelacionRepository) {
    this.nivelacionRepository = nivelacionRepository;
  }

  /**
   * @param {{ paraleloGestionId: number }} params
   */
  async ejecutar({ paraleloGestionId } = {}) {
    return this.nivelacionRepository.obtenerParalelo(paraleloGestionId);
  }
}

export default ObtenerNivelacionParaleloUseCase;
