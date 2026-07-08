import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import {
  PARALELOS_LIST_PATH,
  paraleloEditarPath,
} from '@application-configuracion/recursos/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/recursos/config/navigation';
import { useCarrerasApi } from '@application-configuracion/academico/hooks/api/useCarrerasApi';
import { useParaleloInstanciasGestionApi } from '../api/useParaleloInstanciasGestionApi';

export const useParaleloDetallePage = () => {
  const { id } = useParams();
  const paraleloId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { carreras = [] } = useCarrerasApi();
  const {
    instancias: instanciasGestion,
    loading: instanciasLoading,
    fetchByParaleloId: fetchInstanciasGestion,
    reset: resetInstanciasGestion,
  } = useParaleloInstanciasGestionApi();

  const returnListPath = resolveReturnListPath(location, PARALELOS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [paralelo, setParalelo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isInvalidId = !Number.isFinite(paraleloId) || paraleloId < 1;

  const refetch = useCallback(async () => {
    if (isInvalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.obtenerParaleloPorId().ejecutar(paraleloId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el paralelo');
      }
      setParalelo(result.data?.paralelo ?? null);
    } catch (e) {
      setError(e?.message || 'Error al cargar el paralelo');
      setParalelo(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, paraleloId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isInvalidId) {
      resetInstanciasGestion();
      return;
    }
    fetchInstanciasGestion(paraleloId);
  }, [isInvalidId, paraleloId, fetchInstanciasGestion, resetInstanciasGestion]);

  const carrera = useMemo(() => {
    const cid = paralelo?.carreraId ?? paralelo?.carrera_id;
    if (cid == null) return null;
    return carreras.find((c) => Number(c.id) === Number(cid)) ?? null;
  }, [carreras, paralelo]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Recursos académicos', href: returnListPath },
      { title: 'Paralelos', href: returnListPath },
      { title: 'Detalle de paralelo' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(
      returnListPath,
      menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined,
    );
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    navigate(paraleloEditarPath(paraleloId), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [navigate, paraleloId, returnListPath, menuSidebarKey]);

  return {
    paralelo,
    carrera,
    instanciasGestion,
    instanciasLoading,
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  };
};
