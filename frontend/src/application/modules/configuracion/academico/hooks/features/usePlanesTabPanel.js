/**
 * Tab Planes — listado tipo tabla: una fila por carrera con su plan vigente
 * embebido (`record.planVigente`). Una carrera puede tener MÁS de un plan a
 * la vez (el vigente, para admisiones nuevas, y uno o más históricos que
 * siguen operando porque tienen estudiantes en curso — ver `activo` vs
 * `vigente` en `MarcarPlanEstudiosVigenteUseCase`/`CreateGestionPlanUseCase`):
 * por cada uno de esos planes adicionales se agrega una fila EXTRA para la
 * misma carrera con `planVigente` apuntando a ese plan, en vez de
 * amontonarlos en una sola celda. Igual que el resto de catálogos
 * (`estadosCivilesTableColumns`/`idiomasTableColumns` + `EstadoTogglePill`),
 * un plan con `activo=false` NO desaparece de la lista — sigue como fila,
 * solo atenuada (ver `planesRowClassName` en `planesTableColumns.jsx`); para
 * quitar filas está "Eliminar", no el toggle de estado. Mismo patrón de
 * búsqueda cliente que `useCarrerasList`/`useMateriasList` (`useTableData`).
 */

import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { useTableData } from '@molecules';
import { useCarrerasApi } from '../api/useCarrerasApi';
import { usePlanesEstudiosApi } from '../api/usePlanesEstudiosApi';
import { usePlanEstudiosDetalleApi } from '../api/usePlanEstudiosDetalleApi';

/**
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true] - Si `false`, no dispara el fetch de
 *   carreras/planes (ej. el tab de Planes no se renderiza por falta de permiso).
 */
export const usePlanesTabPanel = ({ enabled = true } = {}) => {
  const { message } = App.useApp();
  const { carreras = [], loading: loadingCarreras } = useCarrerasApi({ autoFetch: enabled });
  const {
    planes = [],
    loading: loadingPlanes,
    error,
    refetch,
  } = usePlanesEstudiosApi({ autoFetch: enabled, incluirInactivos: true });
  const { cambiarEstado } = usePlanEstudiosDetalleApi();

  const planCarreraId = (p) => p.carrera_id ?? p.carreraId;
  const esVigente = (p) => p.vigente === true || p.vigente === 1;

  /** Plan vigente por carrera + demás planes (activos o no) de esa carrera. */
  const { vigentePlanPorCarrera, otrosPlanesPorCarrera } = useMemo(() => {
    const vigenteMap = new Map();
    const otrosMap = new Map();
    for (const p of planes) {
      const carreraId = planCarreraId(p);
      if (esVigente(p)) {
        vigenteMap.set(carreraId, p);
      } else {
        const lista = otrosMap.get(carreraId) ?? [];
        lista.push(p);
        otrosMap.set(carreraId, lista);
      }
    }
    for (const lista of otrosMap.values()) {
      lista.sort((a, b) => b.id - a.id);
    }
    return { vigentePlanPorCarrera: vigenteMap, otrosPlanesPorCarrera: otrosMap };
  }, [planes]);

  const carrerasConPlan = useMemo(() => {
    const filas = [];
    for (const c of carreras) {
      filas.push({ ...c, planVigente: vigentePlanPorCarrera.get(c.id) ?? null });
      const otros = otrosPlanesPorCarrera.get(c.id) ?? [];
      for (const plan of otros) {
        filas.push({ ...c, id: `plan-${plan.id}`, planVigente: plan });
      }
    }
    return filas;
  }, [carreras, vigentePlanPorCarrera, otrosPlanesPorCarrera]);

  const getSearchFields = useMemo(
    () => (carrera) => [
      carrera.nombre,
      carrera.codigo,
      carrera.planVigente?.nombre_plan,
      carrera.planVigente?.resolucion_ministerial,
    ],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(carrerasConPlan, getSearchFields);

  /**
   * Activar/desactivar un plan (independiente de "Publicar como vigente").
   * Un plan desactivado deja de habilitarse en gestiones nuevas y de
   * ofrecerse en el formulario de paralelos, pero su fila sigue en este
   * listado (atenuada) — igual que el resto de catálogos, desaparecer una
   * fila es cosa de "Eliminar", no de este toggle.
   */
  const toggleEstadoPlan = useCallback(
    async (record, nuevoActivo) => {
      const plan = record.planVigente;
      if (!plan) return;
      const result = await cambiarEstado(plan.id, nuevoActivo);
      if (!result.success) {
        message.error(result.error || 'No se pudo cambiar el estado del plan de estudios');
        return;
      }
      const nombre = plan.nombre_plan ? ` «${plan.nombre_plan.toUpperCase()}»` : '';
      message.success(`Se ${nuevoActivo ? 'activó' : 'desactivó'} el plan de estudios${nombre}`);
      await refetch();
    },
    [cambiarEstado, refetch, message],
  );

  return {
    carreras: filteredData,
    loading: loadingCarreras || loadingPlanes,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstadoPlan,
  };
};
