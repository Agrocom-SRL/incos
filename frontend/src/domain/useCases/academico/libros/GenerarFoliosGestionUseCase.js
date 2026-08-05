/**
 * Genera los folios de TODOS los paralelos de una gestión, en el orden
 * canónico de carrera (POST /libros/gestiones/:gestionId/folios).
 * Idempotente: los paralelos con folios vigentes se omiten y quedan
 * reportados en el resumen.
 */

export class GenerarFoliosGestionUseCase {
  /**
   * @param {import('@infrastructure/repositories/LibroRegistroRepository.js').default} libroRegistroRepository
   */
  constructor(libroRegistroRepository) {
    this.libroRegistroRepository = libroRegistroRepository;
  }

  /**
   * @param {number} gestionId
   * @param {{ fechaRegistro?: string }} [payload]
   */
  async ejecutar(gestionId, payload = {}) {
    return this.libroRegistroRepository.generarFoliosGestion(gestionId, payload);
  }
}

export default GenerarFoliosGestionUseCase;
