import { buildFullName } from '@application/utils';
import { resolveCareerColor } from './careerColors';
import { HISTORY_STATES, mapHistorialEstado } from './historyStates';

function formatFecha(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
  } catch {
    // ignore
  }
  return String(value);
}

/**
 * Adapta una fila del API (vista resumen inscripción) al shape de la UI v2.
 * @param {Object} record
 * @returns {Object}
 */
export function adaptInscripcionToMatriculado(record) {
  const student = record.estudiante || record.student || record.enrollment?.student;
  const carrera = record.carrera || record.enrollment?.carrera;
  const gestion = record.gestion || record.enrollment?.gestion;
  const periodo = record.periodo || record.enrollment?.periodo;

  const tipoRaw = String(record.tipoInscripcion ?? record.enrollment?.tipoInscripcion ?? '').toUpperCase();
  const tipo =
    tipoRaw === 'NUEVO'
      ? 'NUEVO'
      : tipoRaw === 'ANTIGUO'
        ? 'ANTIGUO'
        : tipoRaw === 'TRASPASO'
          ? 'TRASPASO'
          : tipoRaw === 'TRANSITABILIDAD'
            ? 'TRANSITABILIDAD'
            : tipoRaw || 'ANTIGUO';
  const isAntiguo = tipo !== 'NUEVO';

  const historialKey = mapHistorialEstado(record.historialPrevioEstado);
  const historyState = HISTORY_STATES[historialKey] || HISTORY_STATES.completo;

  // §4b: en colecciones el orden es APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
  // Si el API ya entrega `nombreCompleto` se respeta (contrato); si no, se
  // construye con el helper central (no concatenar nombres primero a mano).
  const nombreCompleto =
    student?.nombreCompleto ||
    buildFullName(student?.nombre, student?.apellidoPaterno, student?.apellidoMaterno, 'Sin nombre');

  const careerColor = resolveCareerColor(carrera);

  return {
    id: String(record.id ?? record.enrollment?.id ?? ''),
    codigo: student?.codigoEstudiante ?? record.codigo ?? '',
    ci: [student?.ci, student?.expedicion].filter(Boolean).join(' ') || '—',
    nombre: nombreCompleto,
    fullName: nombreCompleto.toUpperCase(),
    career: {
      id: String(carrera?.id ?? ''),
      name: carrera?.nombre || 'Sin carrera',
      codigo: carrera?.codigo,
      color: careerColor,
    },
    tipo,
    isAntiguo,
    historial: historialKey,
    historyState,
    gestion: gestion?.anio ?? gestion?.nombre ?? '—',
    fechaMatricula: formatFecha(record.fechaInscripcion ?? record.enrollment?.fechaInscripcion),
    materias: record.cantidadMaterias ?? 0,
    semestre: periodo?.numero ?? record.periodoNumero ?? 1,
    promedio: null,
    estadoPago: tipoRaw === 'NUEVO' ? 'Inicial' : 'Al día',
    paralelo: record.paralelo?.nombre,
    periodoNombre: periodo?.nombre,
    _raw: record,
  };
}

/**
 * @param {Object[]} rows
 */
export function adaptInscripcionesList(rows = []) {
  return rows.map(adaptInscripcionToMatriculado).filter((r) => r.id);
}
