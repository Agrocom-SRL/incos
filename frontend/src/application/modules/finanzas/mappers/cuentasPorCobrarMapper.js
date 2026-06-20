/**
 * Mapper: respuesta del reporte de cuentas por cobrar → DTO de UI estable
 * (módulo Finanzas · reporte read-only).
 *
 * El backend entrega el objeto bajo `data.cuentasPorCobrar` (dataFieldName ==
 * dataKey 'cuentasPorCobrar'). La estructura es jerárquica:
 *   carreras[] → paralelos[] → estudiantes[].
 * Este mapper normaliza esa estructura a una forma estable para la pantalla,
 * tolerando nulos y coaccionando montos/porcentajes a número. Los estados
 * (AL_DIA | VENCIDA | PROXIMA | SIN_COMPROMISO) se conservan tal cual: el
 * mapeo a token de color vive en la capa de presentación.
 */

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** `diasAtraso` distingue null (sin compromiso) de 0 (vence hoy / al día). */
const toNullableNumber = (value) => {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Estados válidos de cobranza; cualquier otro valor cae a SIN_COMPROMISO. */
const ESTADOS_VALIDOS = ['AL_DIA', 'VENCIDA', 'PROXIMA', 'SIN_COMPROMISO'];

const normalizarEstado = (estado) => {
  const value = typeof estado === 'string' ? estado.toUpperCase() : '';
  return ESTADOS_VALIDOS.includes(value) ? value : 'SIN_COMPROMISO';
};

const mapEstudiante = (estudiante) => {
  if (!estudiante) return null;
  return {
    estudianteId: estudiante.estudianteId ?? null,
    pagoAporteId: estudiante.pagoAporteId ?? null,
    carnet: estudiante.carnet ?? null,
    codigoEstudiante: estudiante.codigoEstudiante ?? null,
    // El nombre llega ya formateado por el backend (orden APELLIDOS NOMBRES); se usa tal cual.
    nombreCompleto: estudiante.nombreCompleto ?? 'Sin nombre',
    montoTotal: toNumber(estudiante.montoTotal),
    totalPagado: toNumber(estudiante.totalPagado),
    fechaUltimoPago: estudiante.fechaUltimoPago ?? null,
    saldoPendiente: toNumber(estudiante.saldoPendiente),
    porcentajeSaldo: toNumber(estudiante.porcentajeSaldo),
    fechaCompromiso: estudiante.fechaCompromiso ?? null,
    diasAtraso: toNullableNumber(estudiante.diasAtraso),
    estado: normalizarEstado(estudiante.estado),
    observacion: estudiante.observacion ?? null,
  };
};

const mapParalelo = (paralelo) => {
  if (!paralelo) return null;
  return {
    paraleloId: paralelo.paraleloId ?? null,
    paralelo: paralelo.paralelo ?? '—',
    turno: paralelo.turno ?? null,
    totalMatriculados: toNumber(paralelo.totalMatriculados),
    montoMaximoTotal: toNumber(paralelo.montoMaximoTotal),
    estudiantes: Array.isArray(paralelo.estudiantes)
      ? paralelo.estudiantes.map(mapEstudiante).filter(Boolean)
      : [],
  };
};

const mapCarrera = (carrera) => {
  if (!carrera) return null;
  return {
    carreraId: carrera.carreraId ?? null,
    carreraNombre: carrera.carreraNombre ?? 'Sin nombre',
    carreraCodigo: carrera.carreraCodigo ?? null,
    totalMatriculados: toNumber(carrera.totalMatriculados),
    montoMaximoTotal: toNumber(carrera.montoMaximoTotal),
    totalCancelado: toNumber(carrera.totalCancelado),
    totalPendiente: toNumber(carrera.totalPendiente),
    porcentajePendiente: toNumber(carrera.porcentajePendiente),
    paralelos: Array.isArray(carrera.paralelos)
      ? carrera.paralelos.map(mapParalelo).filter(Boolean)
      : [],
  };
};

/**
 * @param {Object|null} planilla - `data.cuentasPorCobrar` crudo del backend.
 * @returns {Object|null} DTO de UI o null si no hay datos.
 */
export const mapCuentasPorCobrar = (planilla) => {
  if (!planilla) return null;

  const gestionRaw = planilla.gestion || {};
  const resumenRaw = planilla.resumen || {};

  return {
    gestion: {
      id: gestionRaw.id ?? null,
      nombre: gestionRaw.nombre ?? null,
      anio: gestionRaw.anio ?? null,
    },
    montoMaximoPorEstudiante: toNumber(planilla.montoMaximoPorEstudiante),
    carreras: Array.isArray(planilla.carreras)
      ? planilla.carreras.map(mapCarrera).filter(Boolean)
      : [],
    resumen: {
      totalMatriculados: toNumber(resumenRaw.totalMatriculados),
      montoMaximoTotal: toNumber(resumenRaw.montoMaximoTotal),
      totalCancelado: toNumber(resumenRaw.totalCancelado),
      totalPendientePorCobrar: toNumber(resumenRaw.totalPendientePorCobrar),
      porcentajePendiente: toNumber(resumenRaw.porcentajePendiente),
    },
  };
};

export default mapCuentasPorCobrar;
