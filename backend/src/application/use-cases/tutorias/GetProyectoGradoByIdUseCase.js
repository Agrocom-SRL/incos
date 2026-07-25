import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ProyectoGradoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: GetProyectoGradoByIdUseCase (T6)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Ficha del proyecto de grado: fila de la vista 160 + integrantes (159) +
 * datos completos de la raíz (proyectos_grado) + resúmenes de satélites.
 */
export class GetProyectoGradoByIdUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoListadoViewRepository - Vistas 159/160
   * @param {Object} params.proyectoGradoRepository - Raíz proyectos_grado
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoListadoViewRepository, proyectoGradoRepository, logger }) {
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @returns {Promise<Object>} Ficha del proyecto (presentación camelCase)
   */
  async execute(id) {
    const [row, entity] = await Promise.all([
      this.proyectoGradoListadoViewRepository.findListadoById(id),
      this.proyectoGradoRepository.findById(id),
    ]);

    if (!entity) {
      throw new NotFoundError(`proyecto de grado con ID ${id}`);
    }

    // Base: agregados de la vista 160 (si el proyecto aún no tiene integrantes
    // vigentes no aparece en la vista; se degrada a la entidad raíz).
    const presentation = row
      ? ProyectoGradoMapper.listadoRowToPresentation(row)
      : { id: entity.id, titulo: entity.titulo, estado: entity.estado };

    // Datos completos de la raíz (descripcion/objetivos/fechas/notas).
    Object.assign(presentation, {
      descripcion: entity.descripcion,
      objetivos: entity.objetivos,
      alcance: entity.alcance,
      metodologia: entity.metodologia,
      gestionId: entity.gestionId,
      carreraId: presentation.carreraId ?? entity.carreraId,
      modalidadId: presentation.modalidadId ?? entity.modalidadId,
      tutorId: presentation.tutorId ?? entity.tutorId,
      fechaPresentacionPerfil: entity.fechaPresentacionPerfil,
      fechaAprobacionPerfil: entity.fechaAprobacionPerfil,
      fechaInicioDesarrollo: entity.fechaInicioDesarrollo,
      fechaPresentacionPredefensa: entity.fechaPresentacionPredefensa,
      fechaAprobacionPredefensa: entity.fechaAprobacionPredefensa,
      fechaDefensa: entity.fechaDefensa,
      fechaAprobacion: entity.fechaAprobacion,
      notaPerfil: entity.notaPerfil,
      notaPredefensa: entity.notaPredefensa,
      notaDefensa: entity.notaDefensa,
      notaFinal: entity.notaFinal,
      observaciones: entity.observaciones,
      observacionesTutor: entity.observacionesTutor,
      observacionesComite: entity.observacionesComite,
      activo: entity.activo,
    });

    const integranteRows =
      await this.proyectoGradoListadoViewRepository.findIntegrantesByProyectoId(id);
    presentation.integrantes = ProyectoGradoMapper.integranteRowsToPresentation(integranteRows);

    this.logger.info('[Tutorías] Ficha de proyecto de grado obtenida', {
      id,
      integrantes: presentation.integrantes.length,
    });

    return presentation;
  }
}
