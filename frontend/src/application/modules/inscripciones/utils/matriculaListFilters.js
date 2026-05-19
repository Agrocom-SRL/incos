/**
 * Filtros del listado de matrículas (cliente, sobre datos de vista_base_matricula_resumen_inscripcion).
 */

export const MATRICULA_TIPOS_INSCRIPCION = ['NUEVO', 'ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD'];

export const MATRICULA_HISTORIAL_ESTADO_OPTIONS = [
  { value: 'PENDIENTE', label: 'Historial pendiente' },
  { value: 'REGISTRADO', label: 'Historial registrado' },
  { value: 'NO_APLICA', label: 'Sin historial previo' },
];

const emptyFilters = () => ({
  carreraId: null,
  paraleloId: null,
  periodoId: null,
  tipoInscripcion: null,
  historialPrevioEstado: null,
});

export function buildMatriculaListFilterOptions(rows = []) {
  const carreras = new Map();
  const paralelos = new Map();
  const periodos = new Map();

  rows.forEach((row) => {
    const carreraId = row.carrera?.id ?? row.carreraId;
    const carreraNombre = row.carrera?.nombre;
    if (carreraId != null) {
      carreras.set(carreraId, {
        id: carreraId,
        nombre: carreraNombre || `Carrera ${carreraId}`,
        codigo: row.carrera?.codigo,
      });
    }

    const paraleloId = row.paralelo?.id ?? row.paraleloId;
    if (paraleloId != null) {
      const turno = row.paralelo?.turno;
      const nombre = row.paralelo?.nombre || `Paralelo ${paraleloId}`;
      paralelos.set(paraleloId, {
        id: paraleloId,
        nombre: turno ? `${nombre} (${turno})` : nombre,
        carreraId,
      });
    }

    const periodoId = row.periodo?.id ?? row.periodoId;
    if (periodoId != null) {
      const numero = row.periodo?.numero ?? row.periodoNumero;
      const nombre = row.periodo?.nombre || `Periodo ${numero ?? periodoId}`;
      periodos.set(periodoId, {
        id: periodoId,
        nombre,
        numero,
      });
    }
  });

  const sortByNombre = (a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es');

  return {
    carreras: [...carreras.values()].sort(sortByNombre),
    paralelos: [...paralelos.values()].sort(sortByNombre),
    periodos: [...periodos.values()].sort((a, b) => {
      const na = a.numero ?? 0;
      const nb = b.numero ?? 0;
      if (na !== nb) return na - nb;
      return sortByNombre(a, b);
    }),
  };
}

export function applyMatriculaListFilters(rows = [], filters = {}) {
  return rows.filter((row) => {
    if (filters.carreraId != null) {
      const id = row.carrera?.id ?? row.carreraId;
      if (Number(id) !== Number(filters.carreraId)) return false;
    }
    if (filters.paraleloId != null) {
      const id = row.paralelo?.id ?? row.paraleloId;
      if (Number(id) !== Number(filters.paraleloId)) return false;
    }
    if (filters.periodoId != null) {
      const id = row.periodo?.id ?? row.periodoId;
      if (Number(id) !== Number(filters.periodoId)) return false;
    }
    if (filters.tipoInscripcion) {
      const tipo = String(row.tipoInscripcion ?? '').toUpperCase();
      if (tipo !== String(filters.tipoInscripcion).toUpperCase()) return false;
    }
    if (filters.historialPrevioEstado) {
      if (row.historialPrevioEstado !== filters.historialPrevioEstado) return false;
    }
    return true;
  });
}

export function hasActiveMatriculaListFilters(filters = {}) {
  return (
    filters.carreraId != null ||
    filters.paraleloId != null ||
    filters.periodoId != null ||
    filters.tipoInscripcion != null ||
    filters.historialPrevioEstado != null
  );
}

export { emptyFilters as emptyMatriculaListFilters };
