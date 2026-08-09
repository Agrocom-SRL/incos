/**
 * Estado de pantalla — B3 `/academico/nivelaciones/aprobar`: bandeja PLANA de
 * nivelaciones PROGRAMADA/EN_CURSO, cruzando todos los paralelos
 * (`GET /nivelaciones/pendientes`) + Drawer de resultado/decisión
 * administrativa (`ResultadoNivelacionDrawer`).
 *
 * Toda la orquestación vive aquí; la página solo compone (incos-frontend-module §2).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useCasesFactory } from '@container';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs';
import { useRegistrarResultadoNivelacion, useRegistrarDecisionAdministrativa } from './api';

/** Normaliza para comparar sin acentos ni mayúsculas. */
const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const useNivelacionesPendientes = () => {
  const { notification } = App.useApp();

  const [nivelaciones, setNivelaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);

  const { registrarResultado, loading: guardandoResultado } = useRegistrarResultadoNivelacion();
  const { registrarDecision, loading: guardandoDecision } = useRegistrarDecisionAdministrativa();

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.listarNivelacionesPendientes();
      const result = await uc.ejecutar();
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la bandeja de nivelaciones');
      }
      setNivelaciones(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err?.message || String(err));
      setNivelaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial (mismo patrón que useCentralizadorParalelo: fetch en el hook, no en la página).
  useEffect(() => {
    cargar();
  }, [cargar]);

  const nivelacionesFiltradas = useMemo(() => {
    const termino = normalizar(searchText);
    if (!termino) return nivelaciones;
    return nivelaciones.filter((n) =>
      [n.codigoEstudiante, n.nombreCompleto, n.asignaturaSigla, n.asignaturaNombre, n.stateType]
        .map(normalizar)
        .some((campo) => campo.includes(termino)),
    );
  }, [nivelaciones, searchText]);

  const handleSearchChange = useCallback((event) => setSearchText(event.target.value), []);

  const abrirDrawer = useCallback((fila) => setFilaSeleccionada(fila), []);
  const cerrarDrawer = useCallback(() => setFilaSeleccionada(null), []);

  const handleGuardarResultado = useCallback(
    async (levelingId, payload) => {
      const result = await registrarResultado(levelingId, payload);
      if (result.success) {
        notification.success({ title: 'Resultado registrado' });
        await cargar();
        cerrarDrawer();
      } else {
        notification.error({
          title: 'No se pudo registrar el resultado',
          description: result.error,
        });
      }
      return result;
    },
    [registrarResultado, cargar, cerrarDrawer, notification],
  );

  const handleRegistrarDecision = useCallback(
    async (payload) => {
      const result = await registrarDecision(payload);
      if (result.success) {
        notification.success({ title: 'Decisión administrativa registrada' });
        await cargar();
        cerrarDrawer();
      } else {
        notification.error({
          title: 'No se pudo registrar la decisión administrativa',
          description: result.error,
        });
      }
      return result;
    },
    [registrarDecision, cargar, cerrarDrawer, notification],
  );

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-NIV-APROBAR', 'ACA-NIV'),
    [],
  );

  return {
    nivelaciones: nivelacionesFiltradas,
    loading,
    error,
    refetch: cargar,
    searchText,
    handleSearchChange,
    filaSeleccionada,
    abrirDrawer,
    cerrarDrawer,
    handleGuardarResultado,
    guardandoResultado,
    handleRegistrarDecision,
    guardandoDecision,
    breadcrumbItems,
  };
};

export default useNivelacionesPendientes;
