/**
 * Helper de dominio: estados de una inscripción a capacitación (módulo CAP).
 *
 * Matrícula (se paga al instituto) y costo del curso (se deposita a la entidad
 * certificadora) se saldan por separado: cada concepto tiene su propio estado
 * de pago y el estado global solo es CANCELADO si ambos lo están. La
 * inscripción pasa a INSCRITO únicamente con ambos conceptos cancelados Y
 * todos los requisitos obligatorios entregados; en otro caso queda PENDIENTE.
 *
 * Curso con entidad certificadora (costo del curso EXTERNO): ese costo se
 * deposita a otra entidad y NO se registra como pago en el sistema. Su estado
 * depende solo del requisito que acredita el depósito (`acredita_pago_curso`):
 * entregado → curso CANCELADO (pagado a la entidad) y saldo 0; no entregado →
 * PARCIAL (pendiente) con el monto del curso como pendiente de acreditar. El
 * estado de pago GLOBAL y el paso a INSCRITO dependen solo de la matrícula
 * (más los requisitos obligatorios), nunca del pago externo.
 *
 * Fuente única de verdad: `RegisterPago`, `CreateInscripcion` y
 * `UpdateRequisitosInscripcion` usan `recalcularEstadoInscripcion`; nunca se
 * reimplementa esta regla en otro lugar.
 */

import {
  ESTADOS_INSCRIPCION_CAPACITACION,
  ESTADOS_PAGO_INSCRITO_CAPACITACION,
  ESTADOS_COMPROMISO_CAPACITACION,
  CONCEPTOS_PAGO_CAPACITACION,
} from '../../../../domain/constants/capacitacion.constants.js';

/** Estados que el recálculo automático nunca modifica (decisión manual/terminal). */
export const ESTADOS_INSCRIPCION_NO_RECALCULABLES = [
  ESTADOS_INSCRIPCION_CAPACITACION.RETIRADO,
  ESTADOS_INSCRIPCION_CAPACITACION.ANULADO,
];

/** Importe a centavos enteros (evita errores de coma flotante al comparar montos). */
export const aCentavos = (valor) => Math.round((Number(valor) || 0) * 100);

/** Centavos a importe con 2 decimales. */
export const deCentavos = (centavos) => centavos / 100;

/**
 * Calcula los estados derivados de una inscripción.
 *
 * @param {Object} params
 * @param {number} params.montoCurso - Snapshot `monto_obligatorio` (costo del curso)
 * @param {number} params.montoMatricula - Snapshot `monto_matricula`
 * @param {number} params.pagadoCurso - Suma de pagos concepto CURSO
 * @param {number} params.pagadoMatricula - Suma de pagos concepto MATRICULA
 * @param {number} params.requisitosPendientes - Requisitos obligatorios sin entregar
 * @param {string} params.estadoActual - Estado vigente de la inscripción
 * @param {boolean} [params.pagoCursoExterno=false] - El curso tiene entidad certificadora
 * @param {boolean} [params.cursoAcreditado=false] - Entregó el requisito que acredita el depósito
 * @returns {{estadoPagoCurso: string, estadoPagoMatricula: string, estadoPago: string,
 *   estado: string, pagoCursoExterno: boolean, saldoCurso: number, saldoMatricula: number}}
 */
export function calcularEstadosInscripcion({
  montoCurso,
  montoMatricula,
  pagadoCurso,
  pagadoMatricula,
  requisitosPendientes,
  estadoActual,
  pagoCursoExterno = false,
  cursoAcreditado = false,
}) {
  const montoCursoC = aCentavos(montoCurso);
  const saldoCursoC = pagoCursoExterno
    ? (cursoAcreditado ? 0 : montoCursoC)
    : Math.max(0, montoCursoC - aCentavos(pagadoCurso));
  const saldoMatriculaC = Math.max(0, aCentavos(montoMatricula) - aCentavos(pagadoMatricula));

  const estadoPagoCurso =
    saldoCursoC === 0
      ? ESTADOS_PAGO_INSCRITO_CAPACITACION.CANCELADO
      : ESTADOS_PAGO_INSCRITO_CAPACITACION.PARCIAL;
  const estadoPagoMatricula =
    saldoMatriculaC === 0
      ? ESTADOS_PAGO_INSCRITO_CAPACITACION.CANCELADO
      : ESTADOS_PAGO_INSCRITO_CAPACITACION.PARCIAL;
  // Con costo externo el curso no es un cobro del sistema: el global mira solo la matrícula
  const estadoPago =
    saldoMatriculaC === 0 && (pagoCursoExterno || saldoCursoC === 0)
      ? ESTADOS_PAGO_INSCRITO_CAPACITACION.CANCELADO
      : ESTADOS_PAGO_INSCRITO_CAPACITACION.PARCIAL;

  let estado = estadoActual;
  if (!ESTADOS_INSCRIPCION_NO_RECALCULABLES.includes(estadoActual)) {
    estado =
      estadoPago === ESTADOS_PAGO_INSCRITO_CAPACITACION.CANCELADO && Number(requisitosPendientes) === 0
        ? ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO
        : ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE;
  }

  return {
    estadoPagoCurso,
    estadoPagoMatricula,
    estadoPago,
    estado,
    pagoCursoExterno,
    saldoCurso: deCentavos(saldoCursoC),
    saldoMatricula: deCentavos(saldoMatriculaC),
  };
}

/**
 * Recalcula y persiste los estados de una inscripción a partir de los pagos
 * por concepto y del checklist de requisitos; cierra el compromiso VIGENTE
 * cuando ya no queda saldo. Se ejecuta dentro de la transacción del caller.
 *
 * @param {Object} params
 * @param {Object} params.inscripcion - Entidad de la inscripción (con snapshots de monto y estado)
 * @param {Object} params.pagoCapacitacionRepository
 * @param {Object} params.capacitacionInscritoRequisitoRepository
 * @param {Object} params.inscripcionCapacitacionRepository
 * @param {Object} params.capacitacionCompromisoRepository
 * @param {number|null} params.userId
 * @param {Object} [params.transaction]
 * @returns {Promise<Object>} Estados calculados + totales pagados por concepto
 */
export async function recalcularEstadoInscripcion({
  inscripcion,
  pagoCapacitacionRepository,
  capacitacionInscritoRequisitoRepository,
  inscripcionCapacitacionRepository,
  capacitacionCompromisoRepository,
  userId = null,
  transaction,
}) {
  const totales = await pagoCapacitacionRepository.sumMontosPorConcepto(inscripcion.id, {
    transaction,
  });
  const pagadoCurso = Number(totales[CONCEPTOS_PAGO_CAPACITACION.CURSO] ?? 0);
  const pagadoMatricula = Number(totales[CONCEPTOS_PAGO_CAPACITACION.MATRICULA] ?? 0);

  const requisitosPendientes =
    await capacitacionInscritoRequisitoRepository.contarObligatoriosPendientes(
      inscripcion.id,
      inscripcion.capacitacionId,
      { transaction }
    );

  const cursoExterno = await capacitacionInscritoRequisitoRepository.resolverPagoCursoExterno(
    inscripcion.id,
    inscripcion.capacitacionId,
    { transaction }
  );

  const calculo = calcularEstadosInscripcion({
    pagoCursoExterno: cursoExterno.pagoCursoExterno,
    cursoAcreditado: cursoExterno.acreditado,
    montoCurso: inscripcion.montoObligatorio,
    montoMatricula: inscripcion.montoMatricula,
    pagadoCurso,
    pagadoMatricula,
    requisitosPendientes,
    estadoActual: inscripcion.estado,
  });

  const cambios = {};
  if (calculo.estado !== inscripcion.estado) cambios.estado = calculo.estado;
  if (calculo.estadoPago !== inscripcion.estadoPago) cambios.estadoPago = calculo.estadoPago;
  if (calculo.estadoPagoCurso !== inscripcion.estadoPagoCurso) {
    cambios.estadoPagoCurso = calculo.estadoPagoCurso;
  }
  if (calculo.estadoPagoMatricula !== inscripcion.estadoPagoMatricula) {
    cambios.estadoPagoMatricula = calculo.estadoPagoMatricula;
  }
  if (Object.keys(cambios).length > 0) {
    await inscripcionCapacitacionRepository.update(inscripcion.id, cambios, userId, { transaction });
  }

  let compromisoCerrado = false;
  if (calculo.estadoPago === ESTADOS_PAGO_INSCRITO_CAPACITACION.CANCELADO) {
    const vigente = await capacitacionCompromisoRepository.findVigenteByInscripcionId(
      inscripcion.id,
      { transaction }
    );
    if (vigente) {
      await capacitacionCompromisoRepository.update(
        vigente.id,
        { estado: ESTADOS_COMPROMISO_CAPACITACION.CUMPLIDO },
        userId,
        { transaction }
      );
      compromisoCerrado = true;
    }
  }

  return {
    ...calculo,
    pagadoCurso,
    pagadoMatricula,
    requisitosPendientes,
    cambios,
    compromisoCerrado,
  };
}

/**
 * Recalcula los estados de TODAS las inscripciones del curso (no eliminadas).
 * Se usa cuando cambia la configuración que condiciona el costo del curso
 * (entidad certificadora o requisito que acredita el depósito): los estados
 * persistidos no pueden quedar desfasados. Corre en la transacción del caller.
 *
 * @param {Object} params
 * @param {number} params.capacitacionId
 * @param {Object} params.inscripcionCapacitacionRepository
 * @param {Object} params.pagoCapacitacionRepository
 * @param {Object} params.capacitacionInscritoRequisitoRepository
 * @param {Object} params.capacitacionCompromisoRepository
 * @param {number|null} params.userId
 * @param {Object} [params.transaction]
 * @returns {Promise<number>} Cantidad de inscripciones recalculadas
 */
export async function recalcularInscripcionesDeCurso({
  capacitacionId,
  inscripcionCapacitacionRepository,
  pagoCapacitacionRepository,
  capacitacionInscritoRequisitoRepository,
  capacitacionCompromisoRepository,
  userId = null,
  transaction,
}) {
  const { inscripcionesCapacitacion = [] } = await inscripcionCapacitacionRepository.findAll(
    { capacitacionId },
    null,
    null
  );
  for (const inscripcion of inscripcionesCapacitacion) {
    // eslint-disable-next-line no-await-in-loop
    await recalcularEstadoInscripcion({
      inscripcion,
      pagoCapacitacionRepository,
      capacitacionInscritoRequisitoRepository,
      inscripcionCapacitacionRepository,
      capacitacionCompromisoRepository,
      userId,
      transaction,
    });
  }
  return inscripcionesCapacitacion.length;
}
