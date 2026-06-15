/**
 * Detalle de materia — ficha con perfil y tabs (información + asignaturas en planes).
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
import { getMateriaTipoLabel } from '@application-configuracion/academico/config/materiaTipoPill';

const initialsFromMateria = (m) => {
  const src = (m?.sigla || m?.nombre || '?').trim();
  return src.slice(0, 2).toUpperCase();
};

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
    () => getMateriaTipoLabel(materia?.tipo),
    [materia?.tipo],
  );

  const avatarInitials = useMemo(() => initialsFromMateria(materia), [materia]);

  const asignaturas = materia?.asignaturas ?? [];

  const cargaHorariaResumen = useMemo(() => {
    const horas = asignaturas
      .map((u) => Number(u.horasSemanales))
      .filter((h) => Number.isFinite(h) && h > 0);
    if (!horas.length) return null;
    const unicas = [...new Set(horas)];
    if (unicas.length === 1) return `${unicas[0]} h/sem`;
    return `${Math.min(...horas)}–${Math.max(...horas)} h/sem`;
  }, [asignaturas]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
      { title: 'Materias' },
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
    avatarInitials,
    cargaHorariaResumen,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch: load,
  };
};
