/**
 * Estado y filtros del listado de matrículas v2 (datos reales del API).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInscripcionesContext } from '@application-inscripciones/hooks';
import { useMatriculaListExport } from '@application-inscripciones/hooks/state/matricula-list/useMatriculaListExport';
import { useCarrerasApi } from '@application-configuracion/academico/carreras/hooks/useCarrerasApi';
import { useMessage } from '@application/utils';
import { adaptInscripcionesList } from '../utils/adaptMatriculado';
import { resolveCareerColor } from '../utils/careerColors';

const DEBOUNCE_MS = 300;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const useMatriculaListV2 = () => {
  const navigate = useNavigate();
  const showMessage = useMessage();
  const { inscripciones: rawRows = [], loading, error, refetch } = useInscripcionesContext();
  const { carreras: carrerasCatalog = [] } = useCarrerasApi();
  const exportState = useMatriculaListExport();

  const [search, setSearch] = useState('');
  const [careerFilter, setCareerFilter] = useState(null);
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [historyFilter, setHistoryFilter] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('table');

  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_MS);
  const matriculados = useMemo(() => adaptInscripcionesList(rawRows), [rawRows]);

  const careersForChips = useMemo(
    () =>
      (carrerasCatalog || []).map((c) => ({
        id: String(c.id),
        name: c.nombre,
        color: resolveCareerColor(c),
      })),
    [carrerasCatalog],
  );

  const careerCounts = useMemo(() => {
    const out = {};
    matriculados.forEach((s) => {
      const id = s.career.id;
      if (id) out[id] = (out[id] || 0) + 1;
    });
    return out;
  }, [matriculados]);

  const filtered = useMemo(() => {
    return matriculados.filter((s) => {
      if (careerFilter && s.career.id !== careerFilter) return false;
      if (tipoFilter === 'antiguos' && !s.isAntiguo) return false;
      if (tipoFilter === 'nuevos' && s.isAntiguo) return false;
      if (historyFilter && s.historial !== historyFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (
          !s.fullName.toLowerCase().includes(q) &&
          !String(s.codigo).includes(q) &&
          !String(s.ci).toLowerCase().includes(q) &&
          !s.career.name.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [matriculados, careerFilter, tipoFilter, historyFilter, debouncedSearch]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [careerFilter, tipoFilter, historyFilter, debouncedSearch, viewMode, pageSize]);

  const totalCount = matriculados.length;
  const antiguosCount = matriculados.filter((s) => s.isAntiguo).length;
  const nuevosCount = totalCount - antiguosCount;
  const pendientesCount = matriculados.filter((s) => s.historial === 'pendiente').length;
  const gestionLabel =
    matriculados[0]?.gestion && matriculados[0].gestion !== '—'
      ? `Gestión ${matriculados[0].gestion}`
      : 'Gestión actual';

  const handleNuevaInscripcion = useCallback(() => {
    navigate('/matricula/nueva');
  }, [navigate]);

  const handleEdit = useCallback(
    (student) => {
      const id = student?._raw?.id ?? student?.id;
      if (id) navigate(`/inscripciones/${id}/editar`);
    },
    [navigate],
  );

  const handleView = useCallback(
    (student) => {
      const id = student?._raw?.id ?? student?.id;
      if (id) navigate(`/inscripciones/${id}`);
    },
    [navigate],
  );

  const handleBulkNotify = useCallback(() => {
    showMessage('info', `Notificar a ${selectedRowKeys.length} matrícula(s) — próximamente`);
  }, [selectedRowKeys.length, showMessage]);

  const handleBulkExport = useCallback(() => {
    showMessage('info', `Exportar ${selectedRowKeys.length} matrícula(s) — próximamente`);
  }, [selectedRowKeys.length, showMessage]);

  const handleBulkDelete = useCallback(() => {
    showMessage('warning', `Eliminar ${selectedRowKeys.length} matrícula(s) — próximamente`);
  }, [selectedRowKeys.length, showMessage]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/dashboard' },
      { title: 'Matrícula' },
      { title: 'Inscripciones' },
    ],
    [],
  );

  return {
    loading,
    error,
    refetch,
    matriculados,
    filtered,
    paged,
    totalCount,
    antiguosCount,
    nuevosCount,
    pendientesCount,
    gestionLabel,
    careersForChips,
    careerCounts,
    search,
    setSearch,
    careerFilter,
    setCareerFilter,
    tipoFilter,
    setTipoFilter,
    historyFilter,
    setHistoryFilter,
    selectedRowKeys,
    setSelectedRowKeys,
    page,
    setPage,
    pageSize,
    setPageSize,
    viewMode,
    setViewMode,
    handleNuevaInscripcion,
    handleEdit,
    handleView,
    handleBulkNotify,
    handleBulkExport,
    handleBulkDelete,
    breadcrumbItems,
    ...exportState,
  };
};
