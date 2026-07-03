/**
 * Mis estudiantes (docente) — roster por curso para `MisEstudiantesDocentePage`
 * (rama DOCENTE del ítem de menú Matrículas).
 *
 * Consume `GET /docentes/mis-estudiantes` (identidad resuelta en servidor: solo
 * los cursos del docente autenticado en la gestión vigente). Expone las filas ya
 * normalizadas para `CarreraTabsListView` + búsqueda en cliente (una fila por
 * estudiante+curso: es un roster por curso, NO se colapsa por estudiante).
 * SOLO LECTURA. Tolerante a fallos: si la fuente falla se devuelven filas vacías
 * + `error` para avisar sin romper la página.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import DocenteRepository from '@infrastructure/repositories/DocenteRepository.js';
import { buildFullName } from '@application/utils/formatters';

/** Normaliza una fila del roster (campos pueden venir null del backend). */
export const mapMisEstudianteRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  const estudianteId = row.estudianteId ?? null;
  const ofertaCursoId = row.ofertaCursoId ?? null;
  return {
    // `id` = estudianteId para que TableActions navegue a la ficha (`/estudiantes/:id`).
    id: estudianteId,
    estudianteId,
    ofertaCursoId,
    asignacionDocenteId: row.asignacionDocenteId ?? null,
    codigoEstudiante: row.codigoEstudiante || null,
    ci: row.ci || null,
    expedicion: row.expedicion || null,
    genero: row.genero || null,
    // Orden canónico APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (incos-ui-system §4b).
    nombreCompleto: buildFullName(row.nombres, row.apellidoPaterno, row.apellidoMaterno),
    estadoMatricula: row.estadoMatricula || null,
    tipoInscripcion: row.tipoInscripcion || null,
    materiaSigla: row.materiaSigla || null,
    materiaNombre: row.materiaNombre || null,
    carreraNombre: row.carreraNombre || null,
    carreraCodigo: row.carreraCodigo || null,
    // Color de negocio (hex de seeders): se sanitiza en presentación al pintarlo.
    carreraColorHex: row.carreraColorHex || null,
    periodoNombre: row.periodoNombre || null,
    paraleloNombre: row.paraleloNombre || null,
    paraleloTurno: row.paraleloTurno || null,
    // Clave de fila estable (un estudiante puede repetirse entre cursos).
    rowKey: `${estudianteId ?? 'e'}-${ofertaCursoId ?? 'c'}`,
  };
};

/** Texto plano de búsqueda de una fila (nombre, código, CI, materia, paralelo). */
const buildSearchText = (row) =>
  [
    row.nombreCompleto,
    row.codigoEstudiante,
    row.ci,
    row.materiaSigla,
    row.materiaNombre,
    row.carreraNombre,
    row.paraleloNombre,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const useMisEstudiantesDocente = (enabled = true) => {
  const [rows, setRows] = useState([]);
  const [gestion, setGestion] = useState({ anio: null, nombre: null });
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');

  const cargar = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    const res = await DocenteRepository.obtenerMisEstudiantes();

    if (res?.success && res.data) {
      const d = res.data;
      setRows(
        Array.isArray(d.estudiantes) ? d.estudiantes.map(mapMisEstudianteRow).filter(Boolean) : [],
      );
      setGestion({ anio: d.gestion?.anio ?? null, nombre: d.gestion?.nombre || null });
    } else {
      setRows([]);
      setGestion({ anio: null, nombre: null });
      if (res?.error) {
        setError(typeof res.error === 'string' ? res.error : res.error?.message);
      }
    }

    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    (async () => {
      if (!cancelled) {
        await cargar();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cargar, enabled]);

  // Búsqueda en cliente (TableListView pinta el input; el filtrado vive aquí).
  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => buildSearchText(row).includes(q));
  }, [rows, searchText]);

  return {
    estudiantes: filteredRows,
    totalEstudiantes: rows.length,
    gestion,
    loading,
    error,
    searchText,
    setSearchText,
    refetch: cargar,
  };
};

export default useMisEstudiantesDocente;
