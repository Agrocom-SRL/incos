import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import {
  PARALELOS_LIST_PATH,
  paraleloEditarPath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';
import { useCarrerasApi } from '../api/useCarrerasApi';

export const useParaleloDetallePage = () => {
  const { id } = useParams();
  const paraleloId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { carreras = [] } = useCarrerasApi();

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

  const carrera = useMemo(() => {
    if (!paralelo?.carreraId) return null;
    return carreras.find((c) => c.id === paralelo.carreraId) ?? null;
  }, [carreras, paralelo]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
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
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  };
};
