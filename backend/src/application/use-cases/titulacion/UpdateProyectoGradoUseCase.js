import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';

/** Campos editables del proyecto (estado vía T11; tutor vía T10). */
const CAMPOS_EDITABLES = [
  'modalidadId',
  'carreraId',
  'gestionId',
  'titulo',
  'descripcion',
  'objetivos',
  'alcance',
  'metodologia',
  'fechaPresentacionPerfil',
  'fechaInicioDesarrollo',
  'fechaPresentacionPredefensa',
  'fechaDefensa',
  'notaPerfil',
  'notaPredefensa',
  'notaDefensa',
  'notaFinal',
  'observaciones',
  'observacionesTutor',
  'observacionesComite',
];

/**
 * Use Case: UpdateProyectoGradoUseCase (T8)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Actualiza datos del proyecto de grado. NO cambia `estado` (transiciones vía
 * AprobarEtapaProyectoUseCase) ni `tutorId` (vía AsignarTutorProyectoUseCase).
 */
export class UpdateProyectoGradoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoRepository, logger }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<{proyectoGrado: Object}>}
   */
  async execute(id, body = {}, userId = null) {
    await getProyectoOrFail(this.proyectoGradoRepository, id);

    const data = {};
    for (const campo of CAMPOS_EDITABLES) {
      if (campo in body) {
        data[campo] = body[campo];
      }
    }

    const updated = await this.proyectoGradoRepository.update(id, data, userId);

    this.logger.info('[Tutorías] Proyecto de grado actualizado', {
      id,
      campos: Object.keys(data),
    });

    return { proyectoGrado: updated };
  }
}
