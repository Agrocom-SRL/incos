/**
 * useEnrollmentsList — lógica de pantalla del listado de inscripciones.
 *
 * Responsabilidad ÚNICA: orquestar datos (fetch+adapt), derivar KPIs/carreras,
 * aplicar filtros y paginar. NO renderiza. La page consume este hook (DIP).
 */
import { useEffect, useMemo, useState } from 'react';
import { fetchEnrollments } from './enrollments.api';
import { adaptEnrollments } from './adaptEnrollment';

export function useEnrollmentsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [careerFilter, setCareerFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [historyFilter, setHistoryFilter] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedCareerForExport, setSelectedCareerForExport] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchEnrollments()
      .then((res) => {
        if (!alive) return;
        setRows(adaptEnrollments(res.data));
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(e?.message || 'Error');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const total = rows.length;
    const returning = rows.filter((r) => r.isReturning).length;
    const news = total - returning;
    const pending = rows.filter((r) => r.record.tone === 'warn').length;
    return { total, returning, news, pending };
  }, [rows]);

  const careers = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      const prev = map.get(r.career.id);
      if (prev) prev.count += 1;
      else map.set(r.career.id, { id: r.career.id, name: r.career.name, color: r.career.color, count: 1 });
    });
    return Array.from(map.values());
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (careerFilter && r.career.id !== careerFilter) return false;
      if (tipoFilter === 'antiguos' && !r.isAntiguo) return false;
      if (tipoFilter === 'nuevos' && r.isAntiguo) return false;
      if (historyFilter && r.historialKey !== historyFilter) return false;
      if (!q) return true;
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.codigo.toLowerCase().includes(q) ||
        r.career.name.toLowerCase().includes(q)
      );
    });
  }, [rows, search, careerFilter, tipoFilter, historyFilter]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const hasFilters = Boolean(search || careerFilter || tipoFilter !== 'todos' || historyFilter);
  const clearFilters = () => {
    setSearch('');
    setCareerFilter(null);
    setTipoFilter('todos');
    setHistoryFilter(null);
    setPage(1);
  };

  // Acciones masivas (mock: no-op / console hasta integrar backend).
  const onBulkNotify = () => console.info('[bulk] notify', selectedRowKeys);
  const onBulkExport = () => console.info('[bulk] export', selectedRowKeys);
  const onBulkDelete = () => console.info('[bulk] delete', selectedRowKeys);

  // Exportación por carrera (placeholder hasta integrar backend).
  const careerSelectOptions = useMemo(
    () => careers.map((c) => ({ value: c.id, label: c.name, color: c.color })),
    [careers],
  );
  const onExport = () => console.info('[export] career', selectedCareerForExport);

  return {
    loading,
    error,
    kpis,
    careers,
    filtered,
    paged,
    search,
    setSearch: (v) => {
      setSearch(v);
      setPage(1);
    },
    careerFilter,
    setCareerFilter: (v) => {
      setCareerFilter(v);
      setPage(1);
    },
    page,
    setPage,
    pageSize,
    setPageSize,
    hasFilters,
    clearFilters,
    selectedRowKeys,
    setSelectedRowKeys,
    onBulkNotify,
    onBulkExport,
    onBulkDelete,
    tipoFilter,
    setTipoFilter: (v) => {
      setTipoFilter(v);
      setPage(1);
    },
    historyFilter,
    setHistoryFilter: (v) => {
      setHistoryFilter(v);
      setPage(1);
    },
    viewMode,
    setViewMode,
    selectedCareerForExport,
    setSelectedCareerForExport,
    careerSelectOptions,
    onExport,
  };
}

export default useEnrollmentsList;
