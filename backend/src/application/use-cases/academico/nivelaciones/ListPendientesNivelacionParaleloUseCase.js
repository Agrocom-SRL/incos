/**
 * Conteo de "pendientes de nivelación" por paralelo — selector P1 nivel 1 de
 * Nivelaciones. El frontend reusa el MISMO dataset de paralelos que el
 * selector P1 del Centralizador (`useParalelosEstadoApi`, compartido) y
 * fusiona este conteo por `paraleloGestionId`; este use case NO reconstruye
 * el listado de paralelos, solo aporta el dato nuevo.
 */
const toNumber = (value) => Number(value ?? 0);

export class ListPendientesNivelacionParaleloUseCase {
  constructor({ nivelacionParaleloViewRepository, logger }) {
    if (!nivelacionParaleloViewRepository) {
      throw new Error('nivelacionParaleloViewRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.nivelacionParaleloViewRepository = nivelacionParaleloViewRepository;
    this.logger = logger;
  }

  /**
   * @returns {Promise<{paralelos: Array<{paraleloGestionId: number, totalEstudiantes: number, totalPendientes: number}>}>}
   */
  async execute() {
    const rows = await this.nivelacionParaleloViewRepository.contarPendientesPorParalelo();
    const safeRows = Array.isArray(rows) ? rows : [];

    const paralelos = safeRows.map((row) => ({
      paraleloGestionId: toNumber(row.paralelo_gestion_id),
      totalEstudiantes: toNumber(row.total_estudiantes),
      totalPendientes: toNumber(row.total_pendientes),
    }));

    this.logger.info('[Nivelaciones] Pendientes por paralelo', { paralelos: paralelos.length });

    return { paralelos };
  }
}

export default ListPendientesNivelacionParaleloUseCase;
