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
    isReturning: tKey !== 'new',
    record: rState,
    gestionYear: record.gestion?.anio ?? '—',
    periodo: record.periodo?.numero ?? 1,
    paralelo: record.paralelo?.nombre ?? '—',
    materias: record.cantidadMaterias ?? 0,
    fecha: formatDate(record.fechaInscripcion),
  };
}

export function adaptEnrollments(rows = []) {
  return rows.map(adaptEnrollment).filter((r) => r.id);
}

export default adaptEnrollments;
