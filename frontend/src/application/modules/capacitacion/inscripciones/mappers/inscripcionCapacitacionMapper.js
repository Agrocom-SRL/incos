/**
 * Mapper: inscripciones de capacitación (API → DTO de UI, módulo CAP).
 *
 * El backend expone `estadoPago` (PARCIAL/CANCELADO, PERSISTIDO, no derivado)
 * y `saldo` (`montoObligatorio` snapshot − total pagado, calculado en
 * `InscripcionCapacitacionMapper` del backend) y arma
 * `participanteNombreCompleto` en orden canónico. Aquí se normaliza
 * defensivamente y se derivan etiquetas de UI.
 *
 * `pagoVencido` es un flag derivado EN EL FRONTEND (no confiar en
 * `compromisoEstado`): el backend marca el compromiso `INCUMPLIDO` de forma
 * perezosa al listar y, si ya quedó así antes de que el participante pagara,
 * se queda `INCUMPLIDO` para siempre aunque la deuda esté saldada. Por eso acá
 * se cruza SIEMPRE `estadoPago === 'PARCIAL'` (todavía debe, dato real) con la
 * fecha de compromiso vencida, sin mirar `compromisoEstado`.
 *
 * Curso EXTERNO (`pagoCursoExterno`, curso con entidad certificadora): el costo
 * del curso se deposita a la entidad y no se cobra en el instituto. Su estado
 * (`estadoPagoCurso`: CANCELADO = pagado a la entidad, PARCIAL = pendiente de
 * acreditar con depósito) lo da el requisito `acreditaPagoCurso`; el saldo del
 * curso es informativo y NO suma al «Saldo total» (solo matrícula).
 */

import dayjs from 'dayjs';
import { buildFullName, buildCompleteCI } from '@application/utils/formatters';
import { CONCEPTO_PAGO, formatConceptoPago } from '@application-capacitacion/utils/capacitacionCatalogos';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

const formatFecha = (value) => {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.format('DD/MM/YYYY') : null;
};

const formatFechaHora = (value) => {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : null;
};

const toBool = (value) => value === true || value === 1 || value === '1';

/** Requisito que acredita el depósito del curso externo ({requisitoId, descripcion, entregado}) o null. */
const mapRequisitoAcredita = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    requisitoId: raw.requisitoId ?? null,
    descripcion: cleanText(raw.descripcion),
    entregado: toBool(raw.entregado),
  };
};

/**
 * Mapea una fila del listado (o la base de la ficha).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapInscripcionCapacitacion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const expedicion = cleanText(raw.participanteExpedicion)?.toUpperCase() ?? null;
  const fechaInicioLabel = formatFecha(raw.capacitacionFechaInicio);
  const fechaFinLabel = formatFecha(raw.capacitacionFechaFin);
  const pagoCursoExterno = toBool(raw.pagoCursoExterno);
  const saldoCurso = toNumber(raw.saldoCurso ?? raw.saldo);
  const saldoMatricula = toNumber(raw.saldoMatricula);

  return {
    id: raw.id,
    fechaInscripcion: raw.fechaInscripcion ?? null,
    fechaInscripcionLabel: formatFecha(raw.fechaInscripcion),
    estado: raw.estado ?? null,
    activo: raw.activo !== false && raw.activo !== 0,
    // Participante
    participanteId: raw.participanteId ?? null,
    participanteCi: cleanText(raw.participanteCi),
    participanteExpedicion: expedicion,
    participanteCiCompleto: raw.participanteCi
      ? buildCompleteCI(raw.participanteCi, expedicion)
      : null,
    participanteNombreCompleto: buildFullName(
      raw.participanteNombres,
      raw.participanteApellidoPaterno,
      raw.participanteApellidoMaterno,
      raw.participanteNombreCompleto || 'Sin nombre',
    ),
    participanteNombres: cleanText(raw.participanteNombres),
    participanteApellidoPaterno: cleanText(raw.participanteApellidoPaterno),
    participanteApellidoMaterno: cleanText(raw.participanteApellidoMaterno),
    participanteCelular: cleanText(raw.participanteCelular),
    participanteEmail: cleanText(raw.participanteEmail),
    // Curso
    capacitacionId: raw.capacitacionId ?? null,
    capacitacionTitulo: cleanText(raw.capacitacionTitulo) || 'Sin curso',
    capacitacionEstado: raw.capacitacionEstado ?? null,
    capacitacionEntidadCertificadora: cleanText(raw.capacitacionEntidadCertificadora),
    capacitacionFechasLabel: fechaInicioLabel
      ? fechaFinLabel
        ? `${fechaInicioLabel} – ${fechaFinLabel}`
        : `Desde ${fechaInicioLabel}`
      : null,
    // Grupo elegido (tipo «paralelo») y la etiqueta de sus horarios.
    capacitacionGrupoId: raw.capacitacionGrupoId ?? null,
    grupoNombre: cleanText(raw.grupoNombre),
    grupoHorariosEtiqueta: cleanText(raw.grupoHorariosEtiqueta ?? raw.grupoHorarios),
    // Pago (persistido/calculado por el backend). Dos conceptos independientes:
    // CURSO (`montoObligatorio`, entidad certificadora) y MATRICULA (instituto).
    costo: toNumber(raw.costo),
    montoObligatorio: toNumber(raw.montoObligatorio),
    montoMatricula: toNumber(raw.montoMatricula),
    montoTotal: toNumber(raw.montoObligatorio) + toNumber(raw.montoMatricula),
    // Lo que cobra el instituto: matrícula (+ curso solo si NO es externo).
    montoCobrable:
      toNumber(raw.montoMatricula) + (pagoCursoExterno ? 0 : toNumber(raw.montoObligatorio)),
    totalPagado: toNumber(raw.totalPagado),
    saldo: toNumber(raw.saldo),
    saldoCurso,
    saldoMatricula,
    saldoTotal: saldoMatricula + (pagoCursoExterno ? 0 : saldoCurso),
    pagoCursoExterno,
    requisitoAcreditaPagoCurso: mapRequisitoAcredita(raw.requisitoAcreditaPagoCurso),
    estadoPago: raw.estadoPago ?? null,
    estadoPagoCurso: raw.estadoPagoCurso ?? null,
    estadoPagoMatricula: raw.estadoPagoMatricula ?? null,
    pagosCount: toNumber(raw.pagosCount),
    // Compromiso de pago (solo existe si la inscripción quedó con saldo parcial)
    compromisoId: raw.compromisoId ?? null,
    fechaCompromiso: raw.fechaCompromiso ?? null,
    fechaCompromisoLabel: formatFecha(raw.fechaCompromiso),
    compromisoEstado: raw.compromisoEstado ?? null,
    compromisoObservacion: cleanText(raw.compromisoObservacion),
    // Derivado en cliente: aún debe (estadoPago PARCIAL) Y ya venció la fecha
    // comprometida. No se basa en `compromisoEstado` (ver nota del mapper).
    pagoVencido:
      raw.estadoPago === 'PARCIAL' && !!raw.fechaCompromiso && dayjs(raw.fechaCompromiso).isBefore(dayjs(), 'day'),
    createdAt: raw.createdAt ?? null,
  };
};

/** Mapea el array del listado (dataKey `inscripcionesCapacitacion`). */
export const mapInscripcionesCapacitacionList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapInscripcionCapacitacion).filter(Boolean) : [];

/**
 * Mapea un pago del historial de la ficha.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapPagoCapacitacion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    monto: toNumber(raw.monto),
    fechaPago: raw.fechaPago ?? null,
    fechaPagoLabel: formatFecha(raw.fechaPago),
    numeroRecibo: cleanText(raw.numeroRecibo),
    observaciones: cleanText(raw.observaciones),
    concepto: raw.concepto ?? null,
    conceptoLabel: raw.concepto ? formatConceptoPago(raw.concepto) : null,
    tieneComprobante: raw.tieneComprobante === true || raw.tieneComprobante === 1,
    comprobanteNombre: cleanText(raw.comprobanteNombre),
    // Un pago anulado se conserva como historial: no cuenta en totales ni se puede tocar.
    anulado: toBool(raw.anulado),
    motivoAnulacion: cleanText(raw.motivoAnulacion),
    fechaAnulacion: raw.fechaAnulacion ?? null,
    fechaAnulacionLabel: formatFechaHora(raw.fechaAnulacion),
    metodoPagoId: raw.metodoPagoId ?? null,
    metodoPagoNombre: cleanText(raw.metodoPagoNombre),
    cuentaPagoId: raw.cuentaPagoId ?? null,
    cuentaLabel:
      [cleanText(raw.cuentaPagoTitular), cleanText(raw.cuentaPagoNumero)]
        .filter(Boolean)
        .join(' · ') || null,
    createdAt: raw.createdAt ?? null,
  };
};

/**
 * Mapea un requisito del checklist de la inscripción.
 * @param {Object} raw - { requisitoId, descripcion, obligatorio, entregado, fechaEntrega, observacion }
 * @returns {Object|null}
 */
export const mapRequisitoInscripcion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const requisitoId = raw.requisitoId ?? raw.id ?? null;
  if (requisitoId == null) return null;
  return {
    requisitoId,
    descripcion: cleanText(raw.descripcion) || 'Requisito',
    obligatorio: raw.obligatorio !== false && raw.obligatorio !== 0,
    // Requisito que prueba el depósito del costo del curso a la entidad certificadora.
    acreditaPagoCurso: toBool(raw.acreditaPagoCurso),
    entregado: raw.entregado === true || raw.entregado === 1,
    fechaEntrega: raw.fechaEntrega ?? null,
    observacion: cleanText(raw.observacion),
  };
};

/**
 * Mapea la ficha completa (dataKey `inscripcionCapacitacion`): base + pagos[]
 * + requisitos[] (checklist).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapInscripcionCapacitacionDetail = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const base = mapInscripcionCapacitacion(raw);
  if (!base) return null;
  return {
    ...base,
    pagos: Array.isArray(raw.pagos) ? raw.pagos.map(mapPagoCapacitacion).filter(Boolean) : [],
    requisitos: Array.isArray(raw.requisitos)
      ? raw.requisitos.map(mapRequisitoInscripcion).filter(Boolean)
      : [],
  };
};

/**
 * Valores del formulario de pago → campos del backend
 * (`registerPagoCapacitacionValidator` / objeto anidado `pagoInicial`).
 * `concepto` (MATRICULA | CURSO) es obligatorio: sin él el backend rechaza el pago.
 * @param {Object} values - { concepto, monto, fechaPago, metodoPagoId, cuentaPagoId?, observaciones? }
 * @returns {Object}
 */
export const mapFormValuesToPagoPayload = (values = {}) => ({
  concepto: values.concepto,
  monto: Number(values.monto),
  metodoPagoId: Number(values.metodoPagoId),
  cuentaPagoId: values.cuentaPagoId != null ? Number(values.cuentaPagoId) : null,
  fechaPago: values.fechaPago ? dayjs(values.fechaPago).format('YYYY-MM-DD') : undefined,
  observaciones: (values.observaciones || '').trim() || null,
});

/**
 * Archivo de comprobante desde el valor del `Upload` de AntD (fileList) o un
 * File directo. `undefined` si no hay archivo (el comprobante es opcional).
 */
export const extractComprobanteFile = (value) => {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.originFileObj ?? first ?? undefined;
};

/**
 * Arma el cuerpo de `POST /:id/pagos`: JSON plano sin comprobante, o
 * `FormData` (campos + `comprobante`) cuando hay archivo. Los campos nulos/
 * indefinidos no se envían en multipart.
 * @param {Object} payload - salida de `mapFormValuesToPagoPayload`
 * @param {File} [comprobante]
 * @returns {Object|FormData}
 */
export const buildPagoRequestBody = (payload, comprobante) => {
  if (!comprobante) return payload;
  const formData = new FormData();
  Object.entries(payload).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null) formData.append(clave, String(valor));
  });
  formData.append('comprobante', comprobante);
  return formData;
};

/**
 * Pago inicial OPCIONAL del wizard de inscripción → `pagoInicial` (mismos
 * campos que un pago; el comprobante se adjunta después desde la ficha).
 * @param {Object} values
 * @returns {Object}
 */
export const mapFormValuesToPagoInicialPayload = (values = {}) => mapFormValuesToPagoPayload(values);

/**
 * Checklist de la ficha → `requisitos[]` de `PUT /:id/requisitos`: envía el
 * estado completo (entregado sí/no por requisito). `fechaEntrega` solo viaja
 * si el requisito está entregado y ya tenía fecha.
 * @param {Array} requisitos - requisitos mapeados (con `entregado` editado)
 * @returns {Array}
 */
export const mapRequisitosToPayload = (requisitos = []) =>
  requisitos.map((r) => ({
    requisitoId: r.requisitoId,
    entregado: r.entregado === true,
    ...(r.entregado && r.fechaEntrega ? { fechaEntrega: r.fechaEntrega } : {}),
    ...(r.observacion ? { observacion: r.observacion } : {}),
  }));

/** Pagos vigentes (no anulados) de una ficha mapeada. */
export const pagosVigentes = (inscripcion) => (inscripcion?.pagos ?? []).filter((p) => !p.anulado);

/** Concepto → clave del saldo/monto en la inscripción mapeada. */
export const saldoPorConcepto = (inscripcion, concepto) =>
  concepto === CONCEPTO_PAGO.MATRICULA ? inscripcion?.saldoMatricula ?? 0 : inscripcion?.saldoCurso ?? 0;

/**
 * Cuerpo de `POST /inscripciones-capacitacion` (`createInscripcionCapacitacionValidator`).
 *
 * - participante EXISTENTE → `participanteId`; NUEVO → objeto `participante`.
 * - `capacitacionGrupoId`, `requisitosEntregados` y `pagoInicial` son opcionales
 *   y solo se incluyen cuando traen dato (inscribir con pendientes es válido).
 * - El curso viaja como `capacitacionId` (nombre del validator actual) y también
 *   como `cursoId` (nombre del contrato de la extensión): el backend ignora el que no use.
 * @param {Object} params
 * @returns {Object}
 */
export const buildInscripcionPayload = ({
  cursoId,
  participanteId = null,
  participanteNuevo = null,
  capacitacionGrupoId = null,
  requisitosEntregados = [],
  pagoInicial = null,
}) => {
  const payload = { capacitacionId: Number(cursoId), cursoId: Number(cursoId) };
  if (participanteId != null) payload.participanteId = Number(participanteId);
  else if (participanteNuevo) payload.participante = participanteNuevo;
  if (capacitacionGrupoId != null) payload.capacitacionGrupoId = Number(capacitacionGrupoId);
  if (Array.isArray(requisitosEntregados) && requisitosEntregados.length > 0) {
    payload.requisitosEntregados = requisitosEntregados.map(Number);
  }
  if (pagoInicial) payload.pagoInicial = pagoInicial;
  return payload;
};
