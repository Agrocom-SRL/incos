/**
 * Persiste el lote de la planilla (upsert de sesiones + marcas sparse).
 * Una celda que vuelve a PRESENTE se envía con estado explícito (el backend borra la fila).
 */
export class GuardarPlanillaAsistenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, { dias } = {}) {
    return this.asistenciaRepository.guardarPlanilla(asignacionId, { dias });
  }
}
