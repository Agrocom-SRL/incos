/**
 * Mis aportes — portal del estudiante (SOLO LECTURA).
 *
 * Carga los aportes del estudiante autenticado (resumen + lista) y, para el
 * aporte seleccionado, su detalle con los pagos realizados (`cuotas`). No registra,
 * edita ni anula nada; tampoco descarga recibos.
 *
 * Patrón: la página orquesta, este hook concentra el fetch y el estado (no hay
 * lógica de fetch en `pages/`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import PagoAporteRepository from '@infrastructure/repositories/PagoAporteRepository.js';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

export const useMisAportes = () => {
  const [aportes, setAportes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await PagoAporteRepository.obtenerMisAportes();
      if (!result?.success) {
        setAportes([]);
        setResumen(null);
        setError(result?.error || 'No se pudieron cargar tus aportes');
        return;
      }
      const lista = result.data?.aportes ?? [];
      setAportes(lista);
      setResumen(result.data?.resumen ?? null);
      // Seleccionar por defecto el primer aporte (normalmente el de la gestión vigente).
      setSelectedId((prev) => prev ?? lista[0]?.id ?? null);
    } catch (err) {
      setAportes([]);
      setResumen(null);
      setError(err?.message || 'No se pudieron cargar tus aportes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cargarDetalle = useCallback(async (cabeceraId) => {
    if (!cabeceraId && cabeceraId !== 0) {
      setDetalle(null);
      return;
    }
    setLoadingDetalle(true);
    setErrorDetalle(null);
    try {
      const result = await PagoAporteRepository.obtenerMiAporteDetalle(cabeceraId);
      if (!result?.success) {
        setDetalle(null);
        setErrorDetalle(result?.error || 'No se pudo cargar el detalle del aporte');
        return;
      }
      setDetalle(result.data ?? null);
    } catch (err) {
      setDetalle(null);
      setErrorDetalle(err?.message || 'No se pudo cargar el detalle del aporte');
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId != null) {
      cargarDetalle(selectedId);
    } else {
      setDetalle(null);
    }
  }, [selectedId, cargarDetalle]);

  const selectedAporte = useMemo(
    () => aportes.find((a) => a.id === selectedId) ?? null,
    [aportes, selectedId],
  );

  const cuotas = useMemo(
    () => (Array.isArray(detalle?.cuotas) ? detalle.cuotas : []),
    [detalle],
  );

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('MAT-APO-LISTA', 'MAT', 'Mis aportes'),
    [],
  );

  return {
    aportes,
    resumen,
    loading,
    error,
    selectedId,
    setSelectedId,
    selectedAporte,
    detalle,
    cuotas,
    loadingDetalle,
    errorDetalle,
    breadcrumbItems,
    refetch: cargar,
  };
};

export default useMisAportes;
