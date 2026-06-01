import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGestionesCatalogApi } from '@application/modules/shared/hooks';
import { useGestionConflictosHorariosApi } from '../api/useGestionConflictosHorariosApi';
import { mapGestionConflictosPayload } from '../../mappers/gestionConflictosMapper';

export function useGestionHorariosConflictosState() {
  const navigate = useNavigate();
  const { gestionId: gestionIdParam } = useParams();
  const gestionId = Number(gestionIdParam);

  const { gestiones, loading: gestionesLoading } = useGestionesCatalogApi();
  const { loading, error, data, fetchConflictos } = useGestionConflictosHorariosApi();

  const gestionCatalogo = useMemo(() => {
    const list = Array.isArray(gestiones) ? gestiones : [];
    if (Number.isFinite(gestionId) && gestionId > 0) {
      return list.find((g) => Number(g.id) === gestionId) ?? null;
    }
    return list.find((g) => g.vigente) ?? list[0] ?? null;
  }, [gestiones, gestionId]);

  const mapped = useMemo(() => mapGestionConflictosPayload(data), [data]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestión de horarios', href: '/institucional/horarios' },
      { title: 'Conflictos globales' },
    ],
    [],
  );

  const pageTitle = useMemo(() => {
    const nombre = gestionCatalogo?.nombre ?? gestionCatalogo?.codigo;
    return nombre ? `Conflictos de horario — ${nombre}` : 'Conflictos de horario';
  }, [gestionCatalogo]);

  useEffect(() => {
    if (!Number.isFinite(gestionId) || gestionId < 1) return;
    fetchConflictos(gestionId);
  }, [gestionId, fetchConflictos]);

  const handleVolver = useCallback(() => {
    navigate('/institucional/horarios');
  }, [navigate]);

  const buildArmadoHref = useCallback((row) => {
    const pid = Number(row?.paraleloId);
    if (!Number.isFinite(pid) || pid < 1) return null;
    return `/institucional/horarios/armado?paralelo=${pid}&tab=plan`;
  }, []);

  const reload = useCallback(() => {
    if (Number.isFinite(gestionId) && gestionId > 0) {
      return fetchConflictos(gestionId);
    }
    return Promise.resolve({ success: false });
  }, [gestionId, fetchConflictos]);

  const invalidGestion = !Number.isFinite(gestionId) || gestionId < 1;

  return {
    gestionId,
    invalidGestion,
    gestionCatalogo,
    gestionesLoading,
    breadcrumbItems,
    pageTitle,
    loading: gestionesLoading || loading,
    error,
    rows: mapped.rows,
    paralelosResumen: mapped.paralelos,
    totalConflictos: mapped.total,
    handleVolver,
    buildArmadoHref,
    reload,
  };
}
