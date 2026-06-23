import { ESTADOS_LICENCIAS_VALUES } from '../../../../domain/constants/licencias.constants.js';
import { toLicenciaDTO } from './licenciaDTO.js';

/**
 * Lista licencias estudiantiles con el nombre del estudiante resuelto.
 * Permiso: academico.asistencia.licencia.ver · LISTAR.
 */
export class ListarLicenciasUseCase {
  constructor({ licenseRepository, logger }) {
    this.licenseRepository = licenseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {string} [params.estado] - Filtro por estado de licencia.
   * @returns {Promise<{licencias: Object[]}>}
   */
  async execute({ estado } = {}) {
    const states =
      estado && ESTADOS_LICENCIAS_VALUES.includes(estado) ? [estado] : undefined;

    const rows = await this.licenseRepository.findAllWithStudentName({ states });
    const licencias = rows.map(toLicenciaDTO);

    this.logger?.info('[Licencias] Listado', { total: licencias.length, estado: estado ?? 'TODOS' });
    return { licencias };
  }
}

export default ListarLicenciasUseCase;
