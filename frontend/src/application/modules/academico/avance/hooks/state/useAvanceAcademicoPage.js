/**
 * Estado de pantalla — pestaña «Avance» de /academico/avance.
 *
 * Carga UNA vez el listado completo desde GET /v1/avance-academico (dataKey
 * `avance` + `resumen` + `alcance`) y filtra EN CLIENTE por carrera y texto:
 * el universo es acotado (instituto de 3 carreras) y así las opciones del
 * Select no se degradan al filtrar. La exportación sí delega el filtro de
 * carrera al servidor (mismo `carreraId`) para que pantalla y Excel coincidan.
 *
 * Alcance self: si el backend responde `alcance: 'PROPIO'` (usuario con
 * vínculo de ESTUDIANTE) la página degrada a la vista "Mi avance" con la
 * única fila recibida. Toda la orquestación vive aquí; la página solo compone
 * (incos-frontend-module §2).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';

/** Normaliza texto para búsqueda insensible a mayúsculas/acentos. */
const normalizar = (texto) =>
  String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const useAvanceAcademicoPage = ({ enabled = true } = {}) => {
  const [filas, setFilas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [alcance, setAlcance] = useState('GLOBAL');
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // Filtros de la tabla (solo cliente; ver cabecera del archivo).
  const [carreraId, setCarreraId] = useState(null);
  const [searchText, setSearchText] = useState('');

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerAvanceAcademico();
      const result = await uc.ejecutar({});
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el avance académico');
      }
      const data = result.data ?? {};
      setFilas(Array.isArray(data.avance) ? data.avance : []);
      setResumen(data.resumen ?? null);
      setAlcance(data.alcance ?? 'GLOBAL');
    } catch (err) {
      setError(err?.message || String(err));
      setFilas([]);
      setResumen(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // `enabled` evita el fetch cuando el usuario no tiene la pestaña Avance
  // (p. ej. SEC_ACADEMICA en el contenedor de Seguimiento académico) — mismo
  // patrón que useDesercionPage.
  useEffect(() => {
    if (enabled) cargar();
  }, [enabled, cargar]);

  /** Opciones del Select de carrera, derivadas del propio listado (sin fetch extra). */
  const carreraOptions = useMemo(() => {
    const porId = new Map();
    filas.forEach((fila) => {
      if (fila.carreraId != null && !porId.has(fila.carreraId)) {
        porId.set(fila.carreraId, {
          value: fila.carreraId,
          label: fila.carreraNombre || fila.carreraCodigo || `Carrera ${fila.carreraId}`,
          colorHex: fila.carreraColorHex ?? null,
        });
      }
    });
    return Array.from(porId.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }),
    );
  }, [filas]);

  const filasFiltradas = useMemo(() => {
    const q = normalizar(searchText.trim());
    return filas.filter((fila) => {
      if (carreraId != null && fila.carreraId !== carreraId) return false;
      if (!q) return true;
      return (
        normalizar(fila.nombreCompleto).includes(q) ||
        normalizar(fila.codigo).includes(q) ||
        normalizar(fila.carreraNombre).includes(q) ||
        normalizar(fila.planNombre).includes(q)
      );
    });
  }, [filas, carreraId, searchText]);

  /** Fila propia cuando el servidor acota el alcance (vista "Mi avance"). */
  const filaPropia = alcance === 'PROPIO' ? (filas[0] ?? null) : null;

  return {
    filas: filasFiltradas,
    totalSinFiltrar: filas.length,
    resumen,
    alcance,
    filaPropia,
    isLoading,
    error,
    refetch: cargar,
    carreraId,
    setCarreraId,
    carreraOptions,
    searchText,
    setSearchText,
  };
};

export default useAvanceAcademicoPage;
