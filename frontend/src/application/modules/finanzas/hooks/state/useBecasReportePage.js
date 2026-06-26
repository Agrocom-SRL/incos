/**
 * Hook de pantalla: planilla de control de becas por carrera (Finanzas, read-only).
 *
 * Espejo de `usePagosListPage`: consume el contexto del provider y devuelve props
 * listas para la página "dumb": breadcrumbs, columnas DINÁMICAS (derivadas de
 * `porcentajes`, no hardcodeadas), filas de la tabla, datos de la fila de totales,
 * datos del donut/distribución y el resumen general. No hace fetch.
 *
 * Toda la lógica de AGRUPACIÓN y DERIVACIÓN del árbol jerárquico (carrera →
 * periodo → paralelo) vive aquí (capa de estado), no en los componentes:
 *   - `distribucionTramosPorScope`: tramos de beca por scope (gestión / por
 *     carrera / por periodo cross-carrera) para los mini-donuts.
 *   - `coberturaPorNivelAgrupado`: cobertura por nivel AGRUPANDO cross-carrera
 *     (periodo por número, paralelo por nombre) para las barras.
 *   - `destacados`: hitos derivados (carrera con más becados, periodo de mayor
 *     cobertura, paralelo con más becados) para las mini-tarjetas del resumen.
 */

import { useMemo } from 'react';
import { useBecasReporteContext } from '@application-finanzas/hooks/context/useBecasReporteContext';
import {
  becaPorcentajeKey,
  becaPorcentajeLabel,
} from '@application-finanzas/mappers/becasReporteMapper';
import { resolveCarreraDashboardColor } from '@application-institucional/horarios/utils/carreraDashboardColor';
import { createBecasTableColumns } from '@finanzas/reportes/config/becasTableColumns';

/** Cobertura (% becados sobre matriculados), entero seguro ante divisor 0. */
const calcularCobertura = (conBeca, matriculados) =>
  matriculados > 0 ? (Number(conBeca) || 0) / matriculados * 100 : 0;

/** Normaliza un nombre (sin acentos, minúsculas, sin espacios extra) para agrupar. */
const normalizarNombre = (nombre) =>
  String(nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Construye los tramos de beca de un nodo a partir de su `becasPorPorcentaje`
 * y el total con beca, para los mini-donuts (un segmento por tramo presente).
 */
const construirTramos = (becasPorPorcentaje = {}, totalConBeca = 0, porcentajes = []) =>
  porcentajes.map((porcentaje) => {
    const key = becaPorcentajeKey(porcentaje);
    const beneficiados = Number(becasPorPorcentaje?.[key]) || 0;
    return {
      porcentaje,
      etiqueta: becaPorcentajeLabel(porcentaje),
      beneficiados,
      porcentajeDelTotalConBeca:
        totalConBeca > 0 ? (beneficiados / totalConBeca) * 100 : 0,
    };
  });

/** Recolecta recursivamente todos los nodos de un nivel dado del árbol. */
const recolectarPorNivel = (nodos, nivel, acc = []) => {
  nodos.forEach((nodo) => {
    if (nodo.nivel === nivel) acc.push(nodo);
    if (Array.isArray(nodo.children) && nodo.children.length > 0) {
      recolectarPorNivel(nodo.children, nivel, acc);
    }
  });
  return acc;
};

/**
 * Agrupa nodos de un nivel CROSS-CARRERA por la clave que devuelve `getKey`,
 * sumando matriculados/becados y recalculando cobertura del grupo.
 *
 * `getCarrera` (opcional) sirve al nivel PARALELO: como agrupamos los paralelos
 * por nombre cruzando carreras (todos los "A" juntos), recolectamos además la
 * lista de carreras DISTINTAS que componen cada grupo —con su color
 * institucional— para mostrarla como sub-descripción de la barra. Para
 * carrera/periodo se omite (no aplica) y la entidad no trae `carreras`.
 *
 * @param {Object[]} nodos - nodos del mismo nivel (de todas las carreras).
 * @param {(nodo:Object)=>{key:string,label:string,orden:number}} getKey
 * @param {(nodo:Object)=>{carreraId:*,carreraNombre:*}} [getCarrera]
 * @returns {Object[]} entidades agrupadas, ordenadas por `orden`.
 */
const agruparCobertura = (nodos, getKey, getCarrera) => {
  const mapa = new Map();
  nodos.forEach((nodo) => {
    const { key, label, orden } = getKey(nodo);
    const prev =
      mapa.get(key) || {
        id: key,
        label,
        orden,
        totalMatriculados: 0,
        totalConBeca: 0,
        carreras: new Map(),
      };
    prev.totalMatriculados += Number(nodo.totalMatriculados) || 0;
    prev.totalConBeca += Number(nodo.totalConBeca) || 0;
    if (getCarrera) {
      const { carreraId, carreraNombre } = getCarrera(nodo) || {};
      if (carreraId != null && !prev.carreras.has(carreraId)) {
        prev.carreras.set(carreraId, {
          carreraId,
          carreraNombre,
          color: resolveCarreraDashboardColor({ carreraId, carreraNombre }),
        });
      }
    }
    mapa.set(key, prev);
  });
  return [...mapa.values()]
    .sort((a, b) => a.orden - b.orden)
    .map((g) => {
      const entidad = {
        id: g.id,
        label: g.label,
        totalMatriculados: g.totalMatriculados,
        totalConBeca: g.totalConBeca,
        porcentajeCobertura: calcularCobertura(g.totalConBeca, g.totalMatriculados),
      };
      if (getCarrera) {
        entidad.carreras = [...g.carreras.values()].sort((a, b) =>
          String(a.carreraNombre || '').localeCompare(String(b.carreraNombre || ''), 'es'),
        );
      }
      return entidad;
    });
};

/** Elemento de `arr` que maximiza `selector` (con valor > 0); null si vacío. */
const maximoPor = (arr, selector) =>
  arr.reduce((mejor, item) => {
    const v = selector(item);
    if (v <= 0) return mejor;
    return mejor === null || v > selector(mejor) ? item : mejor;
  }, null);

export const useBecasReportePage = () => {
  const { reporte, loading, error, gestionId, refetch } = useBecasReporteContext();

  const porcentajes = useMemo(() => reporte?.porcentajes ?? [], [reporte]);

  const tableColumns = useMemo(
    () => createBecasTableColumns(porcentajes),
    [porcentajes],
  );

  const filas = useMemo(() => reporte?.filas ?? [], [reporte]);

  const distribucion = useMemo(() => reporte?.distribucion ?? [], [reporte]);

  /** Nodos de nivel carrera (raíz del árbol) con su color institucional resuelto. */
  const carreras = useMemo(
    () =>
      filas
        .filter((nodo) => nodo.nivel === 'carrera')
        .map((nodo) => ({
          ...nodo,
          color: resolveCarreraDashboardColor({
            carreraId: nodo.carreraId,
            carreraNombre: nodo.carreraNombre,
          }),
        })),
    [filas],
  );

  /**
   * Tramos de beca por SCOPE para los mini-donuts de "Distribución por tipo":
   *   - gestion: la distribución global (toda la gestión) ya mapeada.
   *   - carrera: un set de tramos por carrera (con su color institucional).
   *   - periodo: tramos AGRUPANDO las carreras por número de periodo (cross-carrera).
   */
  const distribucionTramosPorScope = useMemo(() => {
    const porCarrera = carreras.map((nodo) => ({
      id: nodo.id,
      label: nodo.label || nodo.carreraNombre,
      color: nodo.color,
      totalConBeca: nodo.totalConBeca || 0,
      porcentajeCobertura: nodo.porcentajeCobertura || 0,
      tramos: construirTramos(nodo.becasPorPorcentaje, nodo.totalConBeca, porcentajes),
    }));

    // Periodos agrupados cross-carrera por número (suma de becas por tramo).
    const periodos = recolectarPorNivel(filas, 'periodo');
    const mapa = new Map();
    periodos.forEach((nodo) => {
      const numero = nodo.periodoNumero ?? nodo.label;
      const key = String(numero);
      const prev =
        mapa.get(key) || {
          id: `periodo-${key}`,
          orden: Number(numero) || 0,
          label: nodo.periodoNombre || nodo.label || `Periodo ${numero}`,
          totalConBeca: 0,
          becas: {},
        };
      prev.totalConBeca += Number(nodo.totalConBeca) || 0;
      porcentajes.forEach((porcentaje) => {
        const k = becaPorcentajeKey(porcentaje);
        prev.becas[k] = (prev.becas[k] || 0) + (Number(nodo.becasPorPorcentaje?.[k]) || 0);
      });
      mapa.set(key, prev);
    });
    const porPeriodo = [...mapa.values()]
      .sort((a, b) => a.orden - b.orden)
      .map((g) => ({
        id: g.id,
        label: g.label,
        totalConBeca: g.totalConBeca,
        tramos: construirTramos(g.becas, g.totalConBeca, porcentajes),
      }));

    return { gestion: distribucion, carrera: porCarrera, periodo: porPeriodo };
  }, [carreras, filas, distribucion, porcentajes]);

  /**
   * Cobertura por nivel AGRUPADA cross-carrera para las barras horizontales:
   *   - carrera: una entidad por carrera (con su color institucional).
   *   - periodo: agrupa por número de periodo cruzando carreras ("Periodo 1" = 3).
   *   - paralelo: agrupa por nombre de paralelo normalizado cruzando carreras.
   * Cada entidad recalcula matriculados/conBeca/cobertura sumando sus componentes.
   */
  const coberturaPorNivelAgrupado = useMemo(() => {
    const porCarrera = carreras.map((nodo) => ({
      id: nodo.id,
      label: nodo.label || nodo.carreraNombre,
      color: nodo.color,
      totalMatriculados: nodo.totalMatriculados || 0,
      totalConBeca: nodo.totalConBeca || 0,
      porcentajeCobertura: calcularCobertura(nodo.totalConBeca, nodo.totalMatriculados),
    }));

    const porPeriodo = agruparCobertura(
      recolectarPorNivel(filas, 'periodo'),
      (nodo) => {
        const numero = nodo.periodoNumero ?? nodo.label;
        return {
          key: String(numero),
          label: nodo.periodoNombre || nodo.label || `Periodo ${numero}`,
          orden: Number(numero) || 0,
        };
      },
    );

    const porParalelo = agruparCobertura(
      recolectarPorNivel(filas, 'paralelo'),
      (nodo) => {
        const nombre = nodo.paraleloNombre || nodo.label || 'Sin paralelo';
        const key = normalizarNombre(nombre);
        return { key, label: nombre, orden: key.charCodeAt(0) || 0 };
      },
      // Sub-descripción: carreras que componen cada paralelo agrupado.
      (nodo) => ({ carreraId: nodo.carreraId, carreraNombre: nodo.carreraNombre }),
    );

    return { carrera: porCarrera, periodo: porPeriodo, paralelo: porParalelo };
  }, [carreras, filas]);

  /**
   * Hitos derivados para las mini-tarjetas del resumen: carrera con más becados
   * (con su color), periodo de mayor cobertura y paralelo (agrupado) con más
   * becados. Devuelven null si no hay datos representativos.
   */
  const destacados = useMemo(() => {
    const { carrera, periodo, paralelo } = coberturaPorNivelAgrupado;

    const carreraTop = maximoPor(carrera, (c) => c.totalConBeca);
    const periodoTop = maximoPor(periodo, (p) => p.porcentajeCobertura);
    const paraleloTop = maximoPor(paralelo, (p) => p.totalConBeca);

    return {
      carreraTopBecados: carreraTop
        ? { label: carreraTop.label, valor: carreraTop.totalConBeca, color: carreraTop.color }
        : null,
      periodoMayorCobertura: periodoTop
        ? { label: periodoTop.label, valor: periodoTop.porcentajeCobertura }
        : null,
      paraleloTopBecados: paraleloTop
        ? { label: paraleloTop.label, valor: paraleloTop.totalConBeca }
        : null,
    };
  }, [coberturaPorNivelAgrupado]);

  /**
   * Ids de TODOS los nodos con hijos (carreras + periodos): permite "expandir
   * todo" sin recalcular en el componente. Las hojas (paralelos) no entran.
   */
  const expandableRowKeys = useMemo(() => {
    const keys = [];
    const recorrer = (nodos) => {
      nodos.forEach((nodo) => {
        if (Array.isArray(nodo.children) && nodo.children.length > 0) {
          keys.push(nodo.id);
          recorrer(nodo.children);
        }
      });
    };
    recorrer(filas);
    return keys;
  }, [filas]);

  const totales = useMemo(() => reporte?.totales ?? null, [reporte]);

  const resumen = useMemo(() => reporte?.resumen ?? null, [reporte]);

  const catalogo = useMemo(() => reporte?.catalogo ?? [], [reporte]);

  const catalogoResumen = useMemo(() => reporte?.catalogoResumen ?? null, [reporte]);

  const gestion = useMemo(() => reporte?.gestion ?? null, [reporte]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Reportes de pagos' },
      { title: 'Becas' },
    ],
    [],
  );

  const isEmpty = !loading && !error && filas.length === 0;

  return {
    loading,
    error,
    isEmpty,
    breadcrumbItems,
    gestion,
    gestionId,
    refetch,
    porcentajes,
    tableColumns,
    filas,
    expandableRowKeys,
    totales,
    distribucion,
    distribucionTramosPorScope,
    coberturaPorNivelAgrupado,
    destacados,
    resumen,
    catalogo,
    catalogoResumen,
  };
};

export default useBecasReportePage;
