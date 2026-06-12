import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { construirRegistroPedagogicoExcelPayload } from '../../mappers/academico/registroPedagogicoExcelMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';

const sanitizarFilePart = (value) =>
  String(value ?? '')
    .replace(/[^\dA-Za-z._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40) || 'export';

/**
 * Exporta Registro Pedagógico Bimestral (.xlsx) para bimestre cerrado.
 */
export class ExportRegistroPedagogicoBimestreUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    evaluationConfigurationRepository,
    teacherRepository,
    userRepository,
    authRepository,
    registroPedagogicoExcelGenerator,
    logger
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.registroPedagogicoExcelGenerator = registroPedagogicoExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, asignacionId: number|string, bimestre: number|string }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ usuarioId, asignacionId, bimestre }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new NotFoundError('Bimestre');
    }

    const asignacionIdNum = Number(asignacionId);
    const { bimestreVigente, gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId: asignacionIdNum
    });

    const periodos =
      await this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(gestionId);
    const periodoMeta = (periodos ?? []).find((p) => Number(p.numero_orden) === bimestreNum);
    const estadoCalendario = periodoMeta?.estado_calendario ?? 'futuro';
    const cerrado = estadoCalendario === 'cerrado' || bimestreNum < bimestreVigente;

    if (!cerrado) {
      throw new ForbiddenError(
        'El registro pedagógico solo está disponible para bimestres cerrados.'
      );
    }

    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(
      gestionId,
      bimestreNum
    );
    if (!periodoId) {
      throw new NotFoundError('Periodo académico del bimestre');
    }

    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    const cursoRow =
      await this.calificacionCoordinacionRepository.obtenerCursoPorAsignacion(asignacionIdNum);
    if (!cursoRow) {
      throw new NotFoundError('Curso');
    }

    const docenteRow = await this.calificacionCoordinacionRepository.obtenerDocenteCalificaciones(
      Number(cursoRow.docente_id)
    );

    const [politica, [filasEvaluaciones, filasEstudiantes, filasNotas, filasResumen]] =
      await Promise.all([
        cargarCuotasPoliticaGestion({
          calificacionContextoRepository: this.calificacionContextoRepository,
          evaluationConfigurationRepository: this.evaluationConfigurationRepository,
          gestionId
        }),
        Promise.all([
          this.cuadernoRepository.listarEvaluaciones(asignacionIdNum, periodoId),
          this.cuadernoRepository.listarEstudiantesExportRegistroPedagogico(asignacionIdNum),
          this.cuadernoRepository.listarTodasNotasBimestreCuaderno(asignacionIdNum, bimestreNum),
          // Notas administrativas (habilitación teórica/práctica) del bimestre: se
          // sobreponen a la ponderación calculada de las actividades del docente.
          this.cuadernoRepository.listarEstudiantesResumenBimestre(asignacionIdNum, bimestreNum)
        ])
      ]);

    const payload = construirRegistroPedagogicoExcelPayload({
      bimestreNum,
      periodoId,
      asignacionId: asignacionIdNum,
      cursoRow,
      docenteRow,
      contexto: ctx,
      filasEvaluaciones,
      filasEstudiantes,
      filasNotas,
      filasResumen,
      politica
    });

    const buffer =
      await this.registroPedagogicoExcelGenerator.generarRegistroPedagogicoBimestre(payload);
    const safeCodigo = sanitizarFilePart(payload.codigo_asignatura);
    const safeBimestre = sanitizarFilePart(payload.bimestre);
    const safeGestion = sanitizarFilePart(payload.gestion);
    const fileName = `registro_pedagogico_${safeCodigo}_${safeBimestre}_${safeGestion}.xlsx`;

    this.logger.info('[Calificaciones] Registro pedagógico exportado', {
      asignacionId: asignacionIdNum,
      bimestre: bimestreNum,
      estudiantes: payload.estudiantes.length,
      fileName
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
}
