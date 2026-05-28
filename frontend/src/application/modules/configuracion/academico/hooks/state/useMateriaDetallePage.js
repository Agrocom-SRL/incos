/**
 * Detalle de materia — página completa.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapMateriaDetail } from '@application-configuracion/academico/mappers';
import {
  MATERIAS_LIST_PATH,
  materiaEditarPath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';
import {
  TIPO_MATERIA_LABEL,
  TIPO_MATERIA_TAG_COLOR,
} from '@application-configuracion/academico/config/materiaFormConstants';

export const useMateriaDetallePage = () => {
  const { id } = useParams();
  const materiaId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(materiaId) || materiaId < 1;

  const returnListPath = resolveReturnListPath(location, MATERIAS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [materia, setMateria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (isInvalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.obtenerMateriaPorId().ejecutar(materiaId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la materia');
      }
      setMateria(mapMateriaDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar la materia');
      setMateria(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, materiaId]);

  useEffect(() => {
    load();
  }, [load]);

  const tipoLabel = useMemo(
    () => TIPO_MATERIA_LABEL[materia?.tipo] ?? materia?.tipo,
    [materia?.tipo],
  );
  const tipoTagColor = useMemo(
    () => TIPO_MATERIA_TAG_COLOR[materia?.tipo] ?? 'default',
    [materia?.tipo],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
      { title: 'Materias', href: returnListPath },
      { title: materia?.nombre || 'Detalle de materia' },
    ],
    [materia?.nombre, returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(
      returnListPath,
      menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined,
    );
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!materia?.id) return;
    navigate(materiaEditarPath(materia.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [materia?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    materia,
    loading,
    error,
    isInvalidId,
    tipoLabel,
    tipoTagColor,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch: load,
  };
};
