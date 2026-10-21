import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';

/** Inscripciones vigentes (ocupan cupo): PENDIENTE (pago parcial) e INSCRITO. */
const ESTADOS_VIGENTES = [
  ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
  ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
];

/** Límite práctico de filas por curso (ningún curso de capacitación se acerca a esto). */
const LIMITE_FILAS = 10000;

/**
 * Exporta el Listado de Inscritos de un curso de capacitación a Excel (.xlsx,
 * una hoja): cabecera con datos del curso (título, costo, horario,
 * fechas) + institucional, y una fila por participante VIGENTE (PENDIENTE o
 * INSCRITO — se excluyen RETIRADO/ANULADO, ya no forman parte del curso) con
 * cédula, nombre completo, correo, saldo pendiente, grupo, estado de pago de matrícula y
 * de curso, requisitos obligatorios pendientes y fecha de inscripción. La cabecera
 * incluye modalidad y costos del curso y de la matrícula.
 *
 * Reutiliza los mismos repositorios de lectura que alimentan las pantallas
 * (paridad pantalla↔Excel): `cursoCapacitacionFichaViewRepository` (vista 155,
 * ya trae los horarios formateados por grupo) e
 * `inscripcionCapacitacionRepository.findListadoRows` (mismo cálculo de saldo
 * contra `monto_obligatorio` que usa el listado y la ficha).
 */
export class ExportListadoInscritosCapacitacionExcelUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../domain/interfaces/repositories/ICursoCapacitacionFichaViewRepository.js').ICursoCapacitacionFichaViewRepository} params.cursoCapacitacionFichaViewRepository
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {import('../../../domain/interfaces/services/IListadoInscritosCapacitacionExcelGenerator.js').IListadoInscritosCapacitacionExcelGenerator} params.listadoInscritosCapacitacionExcelGenerator
   * @param {Object} params.logger
   */
  constructor({
    cursoCapacitacionFichaViewRepository,
    inscripcionCapacitacionRepository,
    listadoInscritosCapacitacionExcelGenerator,
    logger,
  }) {
    this.cursoCapacitacionFichaViewRepository = cursoCapacitacionFichaViewRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.listadoInscritosCapacitacionExcelGenerator = listadoInscritosCapacitacionExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.capacitacionId
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ capacitacionId }) {
    const cursoRow =
      await this.cursoCapacitacionFichaViewRepository.findListadoById(capacitacionId);
    if (!cursoRow) throw new NotFoundError('curso de capacitación');

    const { rows } = await this.inscripcionCapacitacionRepository.findListadoRows(
      { capacitacionId, includeInactive: false },
      1,
      LIMITE_FILAS
    );
    const participantes = rows
      .filter((row) => ESTADOS_VIGENTES.includes(row.estado))
      .map((row) => ({
        ciCompleto: [row.participante_ci, row.participante_expedicion].filter(Boolean).join(' '),
        nombreCompleto: [
          row.participante_apellido_paterno,
          row.participante_apellido_materno,
          row.participante_nombres,
        ]
          .filter(Boolean)
          .join(' '),
        correo: row.participante_email ?? null,
        grupo: row.grupo_nombre ?? null,
        saldo: Number(row.saldo) || 0,
        estadoPagoMatricula: row.estado_pago_matricula ?? null,
        estadoPagoCurso: row.estado_pago_curso ?? null,
        requisitosPendientes: Number(row.requisitos_pendientes) || 0,
        fechaInscripcion: row.fecha_inscripcion,
      }));

    const datos = {
      curso: {
        titulo: cursoRow.titulo,
        costo: cursoRow.costo,
        costoMatricula: cursoRow.costo_matricula,
        modalidad: cursoRow.modalidad,
        horariosDetalle: cursoRow.horarios_detalle,
        fechaInicio: cursoRow.fecha_inicio,
        fechaFin: cursoRow.fecha_fin,
      },
      participantes,
      fechaEmision: this._today(),
    };

    const buffer = await this.listadoInscritosCapacitacionExcelGenerator.generarListadoInscritos(
      datos
    );

    const safeTitulo = String(cursoRow.titulo ?? 'curso')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const fileName = `inscritos_${safeTitulo || 'curso'}_${capacitacionId}.xlsx`;

    this.logger?.info?.('[Capacitación] Excel listado de inscritos generado', {
      capacitacionId,
      participantes: participantes.length,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  /** Fecha de emisión = hoy del servidor (YYYY-MM-DD). @private */
  _today() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export default ExportListadoInscritosCapacitacionExcelUseCase;
