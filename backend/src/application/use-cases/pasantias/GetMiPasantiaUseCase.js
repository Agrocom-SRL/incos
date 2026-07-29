import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';
import { ESTADOS_PASANTIA_VIGENTES } from '../../../domain/constants/pasantias.constants.js';
import { PasantiaMapper } from '../../mappers/pasantias/index.js';

/**
 * Use Case: GetMiPasantiaUseCase (P19)
 * Módulo: Pasantías (TUT · práctica laboral · portal del estudiante)
 *
 * "Mi pasantía": ficha compuesta del trámite del estudiante de la SESIÓN
 * (patrón TUT-MI-PROYECTO). El estudiante se resuelve SIEMPRE en servidor
 * desde req.usuario.id (resolveEstudianteIdForUsuario); NUNCA se acepta
 * estudianteId del cliente.
 *
 * Selección del trámite: el VIGENTE (SOLICITADA/EN_CURSO); si no hay, el más
 * reciente (para ver el resultado FINALIZADA/CONVALIDADA/RECHAZADA). Si el
 * estudiante no tiene ningún trámite devuelve { pasantia: null, informes: [],
 * seguimientos: [] } (el frontend muestra el estado vacío, nunca 500).
 */
export class GetMiPasantiaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaViewRepository - Vistas 167/168
   * @param {Object} params.pasantiaInformeRepository - CRUD pasantias_informes
   * @param {Object} params.pasantiaSeguimientoRepository - CRUD pasantias_seguimientos
   * @param {Object} params.studentRepository - Resolución estudiante por usuario
   * @param {Object} params.userRepository - Fallback referencia polimórfica
   * @param {ILogger} params.logger
   */
  constructor({
    pasantiaViewRepository,
    pasantiaInformeRepository,
    pasantiaSeguimientoRepository,
    studentRepository,
    userRepository,
    logger,
  }) {
    this.pasantiaViewRepository = pasantiaViewRepository;
    this.pasantiaInformeRepository = pasantiaInformeRepository;
    this.pasantiaSeguimientoRepository = pasantiaSeguimientoRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{pasantia: Object|null, informes: Array, seguimientos: Array, estudianteId: number}>}
   */
  async execute({ usuarioId } = {}) {
    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const { rows } = await this.pasantiaViewRepository.findListado({ estudianteId }, 1, 100);
    const elegido =
      rows.find((row) => ESTADOS_PASANTIA_VIGENTES.includes(row.estado)) ?? rows[0] ?? null;

    if (!elegido) {
      this.logger.info('[Pasantías] Mi pasantía: estudiante sin trámite', {
        usuarioId,
        estudianteId,
      });
      return { pasantia: null, informes: [], seguimientos: [], estudianteId };
    }

    const pasantiaId = elegido.pasantia_id;
    const detalleRow = await this.pasantiaViewRepository.findListadoById(pasantiaId);
    const pasantia = PasantiaMapper.detalleRowToPresentation(detalleRow ?? elegido);

    const [informes, seguimientos] = await Promise.all([
      this.pasantiaInformeRepository.findByPasantiaId(pasantiaId),
      this.pasantiaSeguimientoRepository.findByPasantiaId(pasantiaId),
    ]);

    this.logger.info('[Pasantías] Mi pasantía obtenida', {
      usuarioId,
      estudianteId,
      pasantiaId,
    });

    // Las rutas de archivo NO se exponen (descarga autenticada vía res.download).
    return {
      pasantia,
      informes: informes.map(({ rutaArchivo: _ruta, ...informe }) => informe),
      seguimientos: seguimientos.map(({ rutaArchivo: _ruta, ...seguimiento }) => seguimiento),
      estudianteId,
    };
  }
}
