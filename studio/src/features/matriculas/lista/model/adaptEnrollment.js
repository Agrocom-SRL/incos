/**
 * adaptEnrollment — traduce un record del API (vista 101) al view-model de la UI.
 * Función PURA: sin React, sin i18n (las etiquetas se traducen en el render por clave).
 * Devuelve claves estables que el componente mapea a texto/tono.
 */
import { buildFullName } from '@lib/text/buildFullName';
import { careerColor } from './careerColor';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/** tipoInscripcion → clave i18n (enrollments.type.*). */
function typeKey(tipo) {
  const t = String(tipo || '').toUpperCase();
  if (t === 'NUEVO') return 'new';
  if (t === 'TRASPASO') return 'transfer';
  if (t === 'TRANSITABILIDAD') return 'mobility';
  return 'returning';
}

/** historialPrevioEstado → { key i18n, tone píldora }. */
function recordState(estado) {
  const e = String(estado || '').toUpperCase();
  if (e === 'REGISTRADO') return { key: 'recorded', tone: 'ok' };
  if (e === 'PENDIENTE') return { key: 'pending', tone: 'warn' };
  return { key: 'notApplicable', tone: 'neutral' };
}

/** turno del paralelo → clave i18n (enrollments.shift.*). null si desconocido. */
function shiftKey(turno) {
  switch (String(turno || '').toUpperCase()) {
    case 'MAÑANA':
    case 'MANANA':
      return 'morning';
    case 'TARDE':
      return 'afternoon';
    case 'NOCHE':
      return 'evening';
    default:
      return null;
  }
}

/**
 * historialPrevioEstado → clave de historial de la UI (pendiente/completo/
 * observado/revision/no_aplica). Función PURA local (sin i18n).
 */
function historialKey(estado) {
  switch (String(estado || '').toUpperCase()) {
    case 'PENDIENTE':
      return 'pendiente';
    case 'REGISTRADO':
      return 'completo';
    case 'OBSERVADO':
      return 'observado';
    case 'REVISION':
      return 'revision';
    case 'NO_APLICA':
      return 'no_aplica';
    default:
      return 'completo';
  }
}

export function adaptEnrollment(record) {
  const est = record.estudiante ?? {};
  const carrera = record.carrera ?? {};
  const tKey = typeKey(record.tipoInscripcion);
  const rState = recordState(record.historialPrevioEstado);

  return {
    id: String(record.id ?? ''),
    codigo: est.codigoEstudiante ?? '—',
    ci: [est.ci, est.expedicion].filter(Boolean).join(' ') || '—',
    fullName: buildFullName(est.nombre, est.apellidoPaterno, est.apellidoMaterno),
    career: {
      id: String(carrera.id ?? ''),
      name: carrera.nombre ?? 'Sin carrera',
      code: carrera.codigo ?? '',
      color: careerColor(carrera),
    },
    typeKey: tKey,
    tipo: tKey, // alias semántico (la etiqueta se traduce en el render por clave)
    isReturning: tKey !== 'new',
    isAntiguo: tKey !== 'new',
    record: rState,
    historialKey: historialKey(record.historialPrevioEstado),
    gestionYear: record.gestion?.anio ?? '—',
    gestion: record.gestion?.anio != null ? String(record.gestion.anio) : '—',
    periodo: record.periodo?.numero ?? 1,
    semestre: record.periodo?.numero ?? 1,
    periodoNombre: record.periodo?.nombre ?? '',
    paralelo: record.paralelo?.nombre ?? '—',
    turnoKey: shiftKey(record.paralelo?.turno),
    materias: record.cantidadMaterias ?? 0,
    // Segundo dato del historial (académico): nº de materias del registro previo y,
    // para TRASPASO/TRANSITABILIDAD, el origen real (institución + año convalidado).
    historialPreviasCount: record.cantidadHistorialPrevio ?? 0,
    origen: record.origen
      ? {
          institucion: record.origen.institucion ?? '',
          carreraOrigen: record.origen.carreraOrigen ?? '',
          anioLabel: record.origen.anioLabel ?? '',
          estado: record.origen.estado ?? '',
        }
      : null,
    estadoPago: record.estadoPago ?? null,
    promedio: record.promedio ?? null,
    fecha: formatDate(record.fechaInscripcion),
  };
}

export function adaptEnrollments(rows = []) {
  return rows.map(adaptEnrollment).filter((r) => r.id);
}

export default adaptEnrollments;
