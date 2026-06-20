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
      if (!q) return true;
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.codigo.toLowerCase().includes(q) ||
        r.career.name.toLowerCase().includes(q)
      );
    });
  }, [rows, search, careerFilter]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const hasFilters = Boolean(search || careerFilter);
  const clearFilters = () => {
    setSearch('');
    setCareerFilter(null);
    setPage(1);
  };

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
  };
}

export default useEnrollmentsList;
