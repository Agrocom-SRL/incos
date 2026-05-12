import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useAcciones } from '@application/modules/shared/hooks/useAcciones';
import { extractErrorFromResult } from '@application/utils';
import { useCasesFactory } from '@container';
import { useAulasHorariosApi } from '../api/useAulasHorariosApi';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const normalizeTab = () => 'asignar';
const AULAS_FILTER_DEFAULTS = {
  carrera: 'all',
  periodo: 'all',
};

const weekdayToDia = (weekday) => {
  const map = {
    1: 'LUNES',
    2: 'MARTES',
    3: 'MIERCOLES',
    4: 'JUEVES',
    5: 'VIERNES',
    6: 'SABADO',
  };
  return map[weekday] || 'LUNES';
};

export const useGestionHorariosAulasState = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState(AULAS_FILTER_DEFAULTS);
    const tab = normalizeTab(searchParams.get('tab'));
    const diaInicial = DIAS.includes(searchParams.get('dia'))
      ? searchParams.get('dia')
      : weekdayToDia(new Date().getDay());
    const turnoInicial = ['TARDE', 'NOCHE', 'TODOS'].includes(searchParams.get('turno'))
      ? searchParams.get('turno')
      : 'TODOS';

    const { puedeEditar } = useAcciones('institucional.horario.armado');
    const { bloques, loading: bloquesLoading, fetch: fetchBloques } = useAulasHorariosApi();
    const [patchLoading, setPatchLoading] = useState(false);

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Horarios en aulas' },
        ],
        [],
    );

    const setQueryParam = useCallback(
      (key, value) => {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (value == null || value === '') next.delete(key);
            else next.set(key, value);
            return next;
          },
          { replace: true }
        );
      },
      [setSearchParams]
    );

    const setTab = useCallback((value) => setQueryParam('tab', normalizeTab(value)), [setQueryParam]);
    const setDiaActivo = useCallback((value) => setQueryParam('dia', DIAS.includes(value) ? value : diaInicial), [diaInicial, setQueryParam]);
    const setTurno = useCallback((value) => setQueryParam('turno', ['TARDE', 'NOCHE', 'TODOS'].includes(value) ? value : 'TODOS'), [setQueryParam]);
    const setTipoAula = useCallback((value) => setQueryParam('tipoAula', ['TODOS', 'LABORATORIO', 'AULA'].includes(value) ? value : 'TODOS'), [setQueryParam]);

    const diaActivo = DIAS.includes(searchParams.get('dia')) ? searchParams.get('dia') : diaInicial;
    const turno = ['TARDE', 'NOCHE', 'TODOS'].includes(searchParams.get('turno')) ? searchParams.get('turno') : turnoInicial;
    const tipoAula = 'TODOS';

    const paraleloFocoRaw = searchParams.get('paralelo');
    const paraleloFocoId = (() => {
        const n = Number(paraleloFocoRaw);
        return Number.isFinite(n) && n > 0 ? n : null;
    })();

    const toPeriodo = useCallback((row) => {
      return row?.periodo_nombre || row?.periodo || row?.gestion_nombre || row?.gestion || null;
    }, []);

    const onFilterChange = useCallback((key, value) => {
      setFilters((prev) => ({ ...prev, [key]: value || 'all' }));
    }, []);

    const clearFilters = useCallback(() => {
      setFilters(AULAS_FILTER_DEFAULTS);
    }, []);

    useEffect(() => {
      fetchBloques({
        dia: diaActivo,
        ...(turno !== 'TODOS' ? { turno } : {}),
      });
    }, [diaActivo, turno, fetchBloques]);

    const options = useMemo(() => {
      const carreras = [...new Set((bloques || []).map((b) => b.carrera_nombre).filter(Boolean))];
      const periodos = [...new Set((bloques || []).map((b) => toPeriodo(b)).filter(Boolean))];
      return { carreras, periodos, turnos: [] };
    }, [bloques, toPeriodo]);

    const bloquesFiltrados = useMemo(() => {
      return (bloques || []).filter((b) => {
        if (paraleloFocoId != null && Number(b.paralelo_id) !== paraleloFocoId) return false;
        if (filters.carrera !== 'all' && b.carrera_nombre !== filters.carrera) return false;
        if (filters.periodo !== 'all' && toPeriodo(b) !== filters.periodo) return false;
        return true;
      });
    }, [bloques, filters, toPeriodo, paraleloFocoId]);

    const aulas = useMemo(() => {
      const map = new Map();
      (bloques || []).forEach((b) => {
        if (!b.aula_id) return;
        if (!map.has(b.aula_id)) {
          map.set(b.aula_id, {
            id: b.aula_id,
            codigo: b.aula_codigo,
            nombre: b.aula_nombre,
            categoria: b.aula_categoria,
            capacidad: b.aula_capacidad,
          });
        }
      });
      return [...map.values()].sort((a, b) => String(a.codigo).localeCompare(String(b.codigo)));
    }, [bloques]);

    const onAsignarAula = useCallback(
      async (cursoHorarioId, aulaId) => {
        if (!puedeEditar) return;
        setPatchLoading(true);
        try {
          const result = await useCasesFactory.asignarAulaHorario().ejecutar(cursoHorarioId, aulaId);
          if (!result?.success) {
            throw new Error(extractErrorFromResult(result, 'Error al asignar aula'));
          }
          await fetchBloques({
            dia: diaActivo,
            ...(turno !== 'TODOS' ? { turno } : {}),
          });
        } finally {
          setPatchLoading(false);
        }
      },
      [puedeEditar, fetchBloques, diaActivo, turno]
    );

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    return {
        tab,
        setTab,
        diaActivo,
        turno,
        tipoAula,
        setDiaActivo,
        setTurno,
        setTipoAula,
        filters,
        options,
        onFilterChange,
        clearFilters,
        paraleloFocoId,
        bloques: bloques || [],
        bloquesFiltrados,
        aulas,
        bloquesLoading,
        onAsignarAula,
        patchLoading,
        puedeEditar,
        breadcrumbItems,
        handleVolver,
    };
};
