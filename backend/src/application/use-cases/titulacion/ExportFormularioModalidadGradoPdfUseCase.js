import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: ExportFormularioModalidadGradoPdfUseCase
 * Módulo: Titulación (TIT), Requisito 1 — extensión 2026-07-31
 *
 * Genera el PDF del FORMULARIO DE MODALIDAD DE GRADUACIÓN (FMDG-1) de un
 * proyecto ya creado: reutiliza `GetProyectoGradoByIdUseCase` (título,
 * objetivos, carrera, modalidad, integrantes) + `studentRepository.findById`
 * del titular (nombres/CI/expedición/celular, no expuestos por la vista de
 * listado). Documento "export": NO escribe en `dictamenes_proyecto` (patrón
 * de `ExportBitacoraMensualTutorPdfUseCase`).
 */
export class ExportFormularioModalidadGradoPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.getProyectoGradoByIdUseCase
   * @param {Object} params.studentRepository
   * @param {Object} params.managementRepository - Año de gestión para el PDF
   * @param {Object} params.formularioModalidadGradoPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    getProyectoGradoByIdUseCase,
    studentRepository,
    managementRepository,
    formularioModalidadGradoPdfGenerator,
    logger,
  }) {
    this.getProyectoGradoByIdUseCase = getProyectoGradoByIdUseCase;
    this.studentRepository = studentRepository;
    this.managementRepository = managementRepository;
    this.formularioModalidadGradoPdfGenerator = formularioModalidadGradoPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute(proyectoGradoId) {
    const proyecto = await this.getProyectoGradoByIdUseCase.execute(proyectoGradoId);

    const integrantes = Array.isArray(proyecto.integrantes) ? proyecto.integrantes : [];
    const titular = integrantes.find((i) => i.rol === 'TITULAR') ?? integrantes[0] ?? null;
    if (!titular?.estudianteId) {
      throw new ValidationError(
        'El proyecto no tiene un estudiante titular registrado; no es posible generar el formulario.'
      );
    }

    const estudianteEntity = await this.studentRepository.findById(titular.estudianteId);
    if (!estudianteEntity) {
      throw new NotFoundError(`estudiante con ID ${titular.estudianteId}`);
    }

    const gestionAnio = await this._resolverGestionAnio(proyecto.gestionId);

    const buffer = await this.formularioModalidadGradoPdfGenerator.generate({
      estudiante: {
        nombres: estudianteEntity.firstName ?? null,
        apellidoPaterno: estudianteEntity.lastName ?? null,
        apellidoMaterno: estudianteEntity.motherLastName ?? null,
        nombreCompleto: titular.estudianteNombre ?? titular.nombreCompleto ?? null,
        ci: estudianteEntity.ci ?? null,
        expedicion: estudianteEntity.expedition ?? null,
        celular: estudianteEntity.mobilePhone ?? null,
      },
      proyecto: {
        titulo: proyecto.titulo ?? null,
        objetivos: proyecto.objetivos ?? null,
        carreraNombre: proyecto.carreraNombre ?? null,
        modalidadNombre: proyecto.modalidadNombre ?? null,
        gestionAnio,
      },
    });

    this.logger.info('[Titulación] Formulario de modalidad de graduación (FMDG-1) exportado', {
      proyectoGradoId,
      estudianteId: titular.estudianteId,
    });

    const apellidos =
      [estudianteEntity.lastName, estudianteEntity.motherLastName]
        .filter(Boolean)
        .join('-')
        .toLowerCase()
        .replace(/\s+/g, '-') || 'estudiante';

    return {
      buffer,
      fileName: `formulario-modalidad-${apellidos}-${proyectoGradoId}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  /** @private */
  async _resolverGestionAnio(gestionId) {
    if (!gestionId) return null;
    const gestion = await this.managementRepository.findById(Number(gestionId));
    const plain = gestion?.toPlainObject?.() ?? gestion;
    return plain?.year ?? plain?.anio ?? null;
  }
}
