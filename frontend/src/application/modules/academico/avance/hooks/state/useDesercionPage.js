/**
 * Estado de pantalla — pestaña «Deserción» de /academico/avance.
 *
 * Carga UNA vez el universo completo desde GET /v1/desercion (dataKeys
 * `carreras` agregado carrera × gestión, `desertores` detalle, `resumen`
 * global) y filtra EN CLIENTE por gestión/carrera: las opciones de los
 * Selects se derivan del propio agregado (sin fetch de catálogos, que exigiría
 * permisos de otros módulos). El `resumen` visible se recalcula sobre el
 * subconjunto filtrado para que pantalla y filtros cuenten lo mismo; la
 * exportación delega los MISMOS filtros al servidor (paridad pantalla ↔ Excel).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const useDesercionPage = ({ enabled = true } = {}) => {
  const [carreras, setCarreras] = useState([]);
  const [desertores, setDesertores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros (solo cliente; ver cabecera del archivo).
  const [gestionId, setGestionId] = useState(null);
  const [carreraId, setCarreraId] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerDesercion();
      const result = await uc.ejecutar({});
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la deserción estudiantil');
      }
      const data = result.data ?? {};
      setCarreras(Array.isArray(data.carreras) ? data.carreras : []);
      setDesertores(Array.isArray(data.desertores) ? data.desertores : []);
    } catch (err) {
      setError(err?.message || String(err));
      setCarreras([]);
      setDesertores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // La pestaña se monta bajo PermisoGuard; `enabled` evita el fetch si la
  // página decide montar el hook antes de mostrar la pestaña.
  useEffect(() => {
    if (enabled) cargar();
  }, [enabled, cargar]);

  /** Opciones de gestión (año descendente) derivadas del agregado. */
  const gestionOptions = useMemo(() => {
    const porId = new Map();
    carreras.forEach((fila) => {
      if (fila.gestionId != null && !porId.has(fila.gestionId)) {
        porId.set(fila.gestionId, {
          value: fila.gestionId,
          label: fila.gestionNombre || String(fila.gestionAnio ?? fila.gestionId),
          anio: fila.gestionAnio ?? 0,
        });
      }
    });
    return Array.from(porId.values()).sort((a, b) => b.anio - a.anio);
  }, [carreras]);

  /** Opciones de carrera derivadas del agregado. */
  const carreraOptions = useMemo(() => {
    const porId = new Map();
    carreras.forEach((fila) => {
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
  }, [carreras]);

  const aplicaFiltros = useCallback(
    (fila) => {
      if (gestionId != null && fila.gestionId !== gestionId) return false;
      if (carreraId != null && fila.carreraId !== carreraId) return false;
      return true;
    },
    [gestionId, carreraId],
  );

  const carrerasFiltradas = useMemo(
    () => carreras.filter(aplicaFiltros),
    [carreras, aplicaFiltros],
  );

  const desertoresFiltrados = useMemo(
    () => desertores.filter(aplicaFiltros),
    [desertores, aplicaFiltros],
  );

  /**
   * Totales del subconjunto filtrado (misma regla del backend: suma del
   * agregado carrera × gestión; un estudiante pertenece a UNA carrera por
   * gestión, sin doble conteo).
   */
  const resumenFiltrado = useMemo(() => {
    const acc = carrerasFiltradas.reduce(
      (tot, fila) => {
        tot.totalMatriculasMateria += fila.totalMatriculasMateria ?? 0;
        tot.matriculasAbandono += fila.matriculasAbandono ?? 0;
        tot.matriculasRetiro += fila.matriculasRetiro ?? 0;
        tot.totalEstudiantes += fila.totalEstudiantes ?? 0;
        tot.estudiantesDesercion += fila.estudiantesDesercion ?? 0;
        return tot;
      },
      {
        totalMatriculasMateria: 0,
        matriculasAbandono: 0,
        matriculasRetiro: 0,
        totalEstudiantes: 0,
        estudiantesDesercion: 0,
        pctEstudiantesDesercion: null,
      },
    );
    acc.pctEstudiantesDesercion =
      acc.totalEstudiantes > 0
        ? round2((100 * acc.estudiantesDesercion) / acc.totalEstudiantes)
        : null;
    return acc;
  }, [carrerasFiltradas]);

  return {
    carreras: carrerasFiltradas,
    desertores: desertoresFiltrados,
    resumen: resumenFiltrado,
    isLoading,
    error,
    refetch: cargar,
    gestionId,
    setGestionId,
    gestionOptions,
    carreraId,
    setCarreraId,
    carreraOptions,
  };
};

export default useDesercionPage;
