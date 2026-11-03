import { NotFoundError } from '../../../domain/errors/AppError.js';
import { InscripcionCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { ESTADOS_INSCRIPCION_CAPACITACION } from '../../../domain/constants/capacitacion.constants.js';

/** Inscripciones vigentes (ocupan cupo): PENDIENTE (pago parcial) e INSCRITO. */
const ESTADOS_VIGENTES = [
  ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
  ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
];

/** Límite práctico de filas por curso (ningún curso de capacitación se acerca a esto). */
const LIMITE_FILAS = 10000;

/**
 * Exporta el Listado de Inscritos de un curso de capacitación a Excel (.xlsx;
 * hoja GENERAL + una hoja por grupo): cabecera con datos del curso (título, costo, horario,
 * fechas) + institucional, y una fila por participante VIGENTE (PENDIENTE o
 * INSCRITO — se excluyen RETIRADO/ANULADO, ya no forman parte del curso) con
 * cédula, nombre completo, correo, celular, grupo, monto total, total pagado, saldo pendiente, estado de pago de matrícula y
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
    // Mapper de presentación: calcula saldos por concepto (las filas crudas no traen `saldo`).
    const participantes = InscripcionCapacitacionMapper.rowsToPresentation(rows)
      .filter((row) => ESTADOS_VIGENTES.includes(row.estado))
      .map((row) => ({
        ciCompleto: [row.participanteCi, row.participanteExpedicion].filter(Boolean).join(' '),
        nombreCompleto: row.participanteNombreCompleto,
        correo: row.participanteEmail ?? null,
        celular: row.participanteCelular ?? null,
        grupo: row.grupoNombre ?? null,
        estado: row.estado,
        pagoCursoExterno: row.pagoCursoExterno,
        // Matrícula: snapshot de la inscripción (cada grupo puede tener su propia matrícula).
        montoMatricula: row.montoMatricula,
        // Curso con entidad certificadora: el aporte NO se cobra en el sistema (lo acredita el
        // documento de respaldo), por eso no suma al monto total ni al pagado.
        montoTotal: row.montoMatricula + (row.pagoCursoExterno ? 0 : row.montoObligatorio),
        totalPagado: row.totalPagadoMatricula + (row.pagoCursoExterno ? 0 : row.totalPagadoCurso),
        saldo: row.saldo,
        estadoPagoMatricula: row.estadoPagoMatricula ?? null,
        estadoPagoCurso: row.pagoCursoExterno
          ? row.requisitoAcreditaPagoCurso?.entregado
            ? 'RESPALDO ENTREGADO'
            : 'RESPALDO PENDIENTE'
          : (row.estadoPagoCurso ?? null),
        requisitosPendientes: row.requisitosPendientes,
        fechaInscripcion: row.fechaInscripcion,
      }));

    const datos = {
      curso: {
        titulo: cursoRow.titulo,
        costo: cursoRow.costo,
        costoMatricula: cursoRow.costo_matricula,
        entidadCertificadora: cursoRow.entidad_certificadora ?? null,
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
