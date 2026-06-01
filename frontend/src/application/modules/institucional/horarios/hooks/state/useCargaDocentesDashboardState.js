import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useParams } from 'react-router-dom';
import { useAsignacionDocenteApi } from '../api/useAsignacionDocenteApi.js';

export function useCargaDocentesDashboardState() {
  const { gestionId: gestionIdParam } = useParams();
  const gestionId = Number(gestionIdParam);
  const {
    fetchCargaGestion,
    fetchCargaDocente,
    updateDocenteColor,
    fetchColoresSugeridos,
  } = useAsignacionDocenteApi();

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [drawerDocente, setDrawerDocente] = useState(null);
  const [drawerCarga, setDrawerCarga] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [colorPicker, setColorPicker] = useState({
    open: false,
    docenteId: null,
    docenteNombre: '',
  });

  const loadDashboard = useCallback(async () => {
    if (!Number.isFinite(gestionId) || gestionId < 1) {
      setError('Gestión inválida');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetchCargaGestion(gestionId);
    if (!res.success) {
      setError(typeof res.error === 'string' ? res.error : 'No se pudo cargar el dashboard');
      setPayload(null);
    } else {
      setPayload(res.data?.carga_docentes ?? null);
    }
    setLoading(false);
  }, [fetchCargaGestion, gestionId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totales = payload?.totales ?? {};
  const docentes = useMemo(() => payload?.docentes ?? [], [payload]);

  const openDrawer = useCallback(
    async (row) => {
      if (!row?.docente_id) return;
      setDrawerDocente(row);
      setDrawerLoading(true);
      setDrawerCarga(null);
      const res = await fetchCargaDocente(row.docente_id, gestionId);
      if (res.success) {
        setDrawerCarga(res.data?.carga_gestion ?? null);
      } else {
        message.error(typeof res.error === 'string' ? res.error : 'No se pudo cargar el detalle');
      }
      setDrawerLoading(false);
    },
    [fetchCargaDocente, gestionId]
  );

  const closeDrawer = useCallback(() => {
    setDrawerDocente(null);
    setDrawerCarga(null);
  }, []);

  const openColorPicker = useCallback((docenteId, docenteNombre) => {
    setColorPicker({ open: true, docenteId, docenteNombre: docenteNombre ?? '' });
  }, []);

  const closeColorPicker = useCallback(() => {
    setColorPicker({ open: false, docenteId: null, docenteNombre: '' });
  }, []);

  const onColorSaved = useCallback(async () => {
    closeColorPicker();
    await loadDashboard();
    if (drawerDocente?.docente_id) {
      await openDrawer(drawerDocente);
    }
  }, [closeColorPicker, loadDashboard, drawerDocente, openDrawer]);

  return {
    gestionId,
    totales,
    docentes,
    loading,
    error,
    reload: loadDashboard,
    drawerDocente,
    drawerCarga,
    drawerLoading,
    openDrawer,
    closeDrawer,
    colorPicker,
    openColorPicker,
    closeColorPicker,
    onColorSaved,
    updateDocenteColor,
    fetchColoresSugeridos,
  };
}
