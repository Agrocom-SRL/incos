import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ActaDefensaMapper } from '../../mappers/titulacion/index.js';

/**
 * Use Case: ExportActaDefensaPdfUseCase
 * Módulo: Titulación (TIT), extensión 2026-08-01 (acta de defensa de grado)
 *
 * Patrón FMDG-1 (`ExportFormularioModalidadGradoPdfUseCase`): compone el
 * proyecto (`GetProyectoGradoByIdUseCase`), el estudiante titular del acta
 * (`studentRepository`), la carrera (nivel desde `grantedTitle`) y la
 * gestión → `actaDefensaPdfGenerator.generate(...)`. Documento "export"
 * (Buffer): el acta ya está persistida en su propia tabla, el PDF es
 * reproducible en cualquier momento — NO escribe en uploads ni en
 * `dictamenes_proyecto`.
 */
export class ExportActaDefensaPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.actaDefensaRepository
   * @param {Object} params.getProyectoGradoByIdUseCase
   * @param {Object} params.studentRepository
   * @param {Object} params.careerRepository
   * @param {Object} params.managementRepository
   * @param {Object} params.actaDefensaPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    actaDefensaRepository,
    getProyectoGradoByIdUseCase,
    studentRepository,
    careerRepository,
    managementRepository,
    actaDefensaPdfGenerator,
    logger,
  }) {
    this.actaDefensaRepository = actaDefensaRepository;
    this.getProyectoGradoByIdUseCase = getProyectoGradoByIdUseCase;
    this.studentRepository = studentRepository;
    this.careerRepository = careerRepository;
    this.managementRepository = managementRepository;
    this.actaDefensaPdfGenerator = actaDefensaPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {number} actaId
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute(proyectoGradoId, actaId) {
    const acta = await this.actaDefensaRepository.findByIdWithTribunal(actaId);
    if (!acta || Number(acta.proyectoGradoId) !== Number(proyectoGradoId)) {
      throw new NotFoundError(`acta de defensa con ID ${actaId} del proyecto ${proyectoGradoId}`);
    }

    const proyecto = await this.getProyectoGradoByIdUseCase.execute(proyectoGradoId);

    const estudianteEntity = await this.studentRepository.findById(acta.estudianteId);
    if (!estudianteEntity) {
      throw new NotFoundError(`estudiante con ID ${acta.estudianteId}`);
    }

    const [nivel, gestionAnio] = await Promise.all([
      this._resolverNivel(proyecto.carreraId),
      this._resolverGestionAnio(acta.gestionId ?? proyecto.gestionId),
    ]);

    const actaPresentacion = ActaDefensaMapper.toDetail(acta);

    const buffer = await this.actaDefensaPdfGenerator.generate({
      acta: actaPresentacion,
      estudiante: {
        nombreCompleto: this._buildNombreInstitucional(estudianteEntity),
        ci: estudianteEntity.ci ?? null,
        expedicion: estudianteEntity.expedition ?? null,
      },
      proyecto: {
        titulo: proyecto.titulo ?? null,
        carreraNombre: proyecto.carreraNombre ?? null,
        modalidadNombre: proyecto.modalidadNombre ?? null,
        gestionAnio,
      },
      nivel,
    });

    this.logger.info('[Titulación] PDF de acta de defensa exportado', {
      proyectoGradoId,
      actaId,
      estudianteId: acta.estudianteId,
    });

    const apellidos = this._buildSlugApellidos(estudianteEntity);

    return {
      buffer,
      fileName: `acta-defensa-${apellidos}-${actaPresentacion.numeroActaFormateado}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  /** @private Nombre institucional (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES). */
  _buildNombreInstitucional(estudiante) {
    return [estudiante.lastName, estudiante.motherLastName, estudiante.firstName]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  /** @private */
  _buildSlugApellidos(estudiante) {
    return (
      [estudiante.lastName, estudiante.motherLastName]
        .filter(Boolean)
        .join('-')
        .toLowerCase()
        .replace(/\s+/g, '-') || 'estudiante'
    );
  }

  /**
   * @private NIVEL de la cabecera del acta, derivado de `carreras.tituloOtorgado`
   * (§1.4 del plan: "CARRERA: … · NIVEL: TECNICO SUPERIOR"). Fallback a la
   * constante institucional si la carrera no tiene título registrado.
   */
  async _resolverNivel(carreraId) {
    const FALLBACK = 'TÉCNICO SUPERIOR';
    if (!carreraId) return FALLBACK;
    const carrera = await this.careerRepository.findById(Number(carreraId));
    const titulo = carrera?.grantedTitle ?? null;
    if (!titulo) return FALLBACK;
    if (/t[ée]cnico\s+superior/i.test(titulo)) return 'TÉCNICO SUPERIOR';
    if (/t[ée]cnico\s+medio/i.test(titulo)) return 'TÉCNICO MEDIO';
    return titulo.toUpperCase();
  }

  /** @private */
  async _resolverGestionAnio(gestionId) {
    if (!gestionId) return null;
    const gestion = await this.managementRepository.findById(Number(gestionId));
    const plain = gestion?.toPlainObject?.() ?? gestion;
    return plain?.year ?? plain?.anio ?? null;
  }
}
