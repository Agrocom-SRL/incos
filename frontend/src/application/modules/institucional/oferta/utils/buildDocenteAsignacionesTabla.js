import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';
import { buildFullName } from '@application/utils/formatters';

const horasMesDesdeSemana = (horasSem) => {
  const h = Number(horasSem);
  return Number.isFinite(h) && h > 0 ? h * 4 : 0;
};

/**
 * Modelo de tabla «Horario específico por docente» (gestión vigente).
 */
export function buildDocenteAsignacionesTabla({
  profile = {},
  docenteId = null,
  assignments = [],
  gestionLabel = null,
}) {
  const docenteNombre =
    profile.nombreCompleto?.toUpperCase?.() ||
    buildFullName(profile.nombres, profile.apellidoPaterno, profile.apellidoMaterno, '—').toUpperCase();
  const perfil = profile.tituloProfesional || profile.especialidad || '—';
  const numeroItem = profile.ciCompleto || profile.ci || (docenteId != null ? String(docenteId) : '—');

  const carreraOrder = [];
  const byCarrera = new Map();

  for (const a of assignments) {
    const carrera = a.carrera || 'Sin carrera';
    if (!byCarrera.has(carrera)) {
      byCarrera.set(carrera, []);
      carreraOrder.push(carrera);
    }
    const horasSemana = Number(a.cargaHorariaSemanal ?? a.horasPlanMateria) || 0;
    byCarrera.get(carrera).push({
      asignatura: a.materia || '—',
      codigo: a.siglaMateria || a.cursoCodigo || '—',
      carrera,
      carreraColorHex: sanitizeDocenteColorHex(a.carreraColorHex),
      anio: a.paralelo || a.periodoParalelo || '—',
      horasSemana,
      horasMes: horasMesDesdeSemana(horasSemana),
    });
  }

  const filas = [];
  const carreraGroups = [];

  for (const carrera of carreraOrder) {
    const items = byCarrera.get(carrera) || [];
    const startIdx = filas.length;
    for (const row of items) {
      filas.push(row);
    }
    carreraGroups.push({
      carrera,
      carreraColorHex: items[0]?.carreraColorHex ?? null,
      startIdx,
      rowSpan: items.length,
    });
  }

  const totales = filas.reduce(
    (acc, row) => ({
      horasSemana: acc.horasSemana + (row.horasSemana || 0),
      horasMes: acc.horasMes + (row.horasMes || 0),
    }),
    { horasSemana: 0, horasMes: 0 },
  );

  return {
    docenteNombre,
    perfil,
    numeroItem,
    gestionLabel,
    filas,
    carreraGroups,
    totales,
    rowCount: filas.length,
  };
}
