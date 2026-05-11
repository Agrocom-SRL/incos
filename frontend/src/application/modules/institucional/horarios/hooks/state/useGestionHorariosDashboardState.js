import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGestionesCatalogApi, useParalelosEstadoApi } from '@application/modules/shared/hooks';
import { useHorariosPendientesSidebarApi } from '../api/useHorariosPendientesSidebarApi';
import { BOARD_COLUMNS, FILTER_DEFAULTS, STATUS_LABELS } from '@application-institucional/horarios/config/dashboardConstants';

export const useGestionHorariosDashboardState = () => {
    const navigate = useNavigate();
    const { gestiones } = useGestionesCatalogApi();
    const { paralelos: paralelosEstado, loading: estadoLoading, error: estadoError } = useParalelosEstadoApi();
    const {
        data: pendientesSidebarRaw,
        loading: pendientesSidebarLoading,
        error: pendientesSidebarError,
    } = useHorariosPendientesSidebarApi();
    const [filters, setFilters] = useState(FILTER_DEFAULTS);
    const [viewMode, setViewMode] = useState('table');

    const currentGestion = useMemo(() => {
        return String(gestiones?.[0]?.nombre || gestiones?.[0]?.gestion || 'Actual');
    }, [gestiones]);

    const paralelosDashboard = useMemo(() => {
        return (paralelosEstado || []).map((row) => {
            const cursosTotales = row.asignaturas_requeridas ?? 0;
            const cursosCreados = row.cursos_creados ?? 0;
            const cursosConHorario = row.cursos_con_horario ?? 0;
            return {
                id: row.paralelo_id,
                paralelo: row.paralelo_nombre,
                carrera: row.carrera_nombre || 'Carrera no definida',
                carreraId: row.carrera_id != null ? Number(row.carrera_id) : null,
                carreraColorHex: row.carrera_color_hex ?? null,
                periodo: row.periodo_nombre,
                turno: row.turno,
                estado: row.estado,
                cursosAsignados: cursosConHorario,
                cursosTotales,
                cursosCreados,
                cursosSinDocente: row.cursos_sin_docente ?? 0,
                cursosSinBloquesHorario: Math.max(0, cursosCreados - cursosConHorario),
                bloquesSinAula: row.bloques_sin_aula ?? 0,
                conflictosSolapeMismoBloque: row.conflictos_solape_mismo_bloque ?? 0,
                conflictosAula: row.conflictos_aula ?? 0,
                conflictoDocenteHorario: Number(row.conflicto_docente_horario) === 1,
                bloquesAsignados: (cursosConHorario || 0) * 3,
                bloquesRequeridos: cursosTotales * 3,
            };
        });
    }, [paralelosEstado]);

    const onFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(FILTER_DEFAULTS);
    }, []);

    const filteredParallels = useMemo(() => {
        return paralelosDashboard.filter((row) => {
            if (filters.carrera !== 'all' && row.carrera !== filters.carrera) return false;
            if (filters.periodo !== 'all' && row.periodo !== filters.periodo) return false;
            if (filters.turno !== 'all' && row.turno !== filters.turno) return false;
            return true;
        });
    }, [filters, paralelosDashboard]);

    const kpis = useMemo(() => {
        const total = filteredParallels.length;
        const incompletos = filteredParallels.filter((item) => item.estado === 'incompleto').length;
        const sinHorario = filteredParallels.filter((item) => item.estado === 'sin_horario').length;
        const conConflicto = filteredParallels.filter((item) => item.estado === 'conflicto').length;
        const completos = filteredParallels.filter((item) => item.estado === 'completo').length;
        return { total, incompletos, sinHorario, conConflicto, completos };
    }, [filteredParallels]);

    /** Tablero si hay trabajo pendiente; tabla si todos los paralelos visibles están completos. */
    useEffect(() => {
        if (estadoLoading) return;
        const requiereAtencion =
            kpis.incompletos > 0 || kpis.conConflicto > 0 || kpis.sinHorario > 0;
        setViewMode(requiereAtencion ? 'board' : 'table');
    }, [estadoLoading, kpis.incompletos, kpis.conConflicto, kpis.sinHorario]);

    const boardByStatus = useMemo(() => {
        return BOARD_COLUMNS.map((statusKey) => ({
            key: statusKey,
            title: STATUS_LABELS[statusKey],
            items: filteredParallels.filter((item) => item.estado === statusKey),
        }));
    }, [filteredParallels]);

    const options = useMemo(() => {
        const carrerasOptions = [...new Set(paralelosDashboard.map((item) => item.carrera).filter(Boolean))];
        const periodosOptions = [...new Set(paralelosDashboard.map((item) => item.periodo).filter(Boolean))];
        const turnosOptions = [...new Set(paralelosDashboard.map((item) => item.turno).filter(Boolean))];
        return {
            carreras: carrerasOptions,
            periodos: periodosOptions,
            turnos: turnosOptions,
        };
    }, [paralelosDashboard]);

    /** Título: gestión académica vigente del catálogo (sin filtro; la vista es siempre de la gestión actual). */
    const currentGestionLabel = useMemo(() => {
        return String(gestiones?.[0]?.nombre || gestiones?.[0]?.gestion || currentGestion);
    }, [gestiones, currentGestion]);

    const getParaleloAction = useCallback((paralelo) => {
        const turno = encodeURIComponent(paralelo.turno || '');
        const base = `/institucional/horarios/armado?paralelo=${paralelo.id}&turno=${turno}`;
        if (paralelo.estado === 'incompleto') {
            const planCompleto =
                (paralelo.cursosCreados ?? 0) >= (paralelo.cursosTotales ?? 0) &&
                (paralelo.cursosTotales ?? 0) > 0;
            const soloDocentesPendientes =
                planCompleto && (paralelo.cursosSinDocente ?? 0) > 0;
            return soloDocentesPendientes ? `${base}&tab=cursos` : `${base}&tab=gestion`;
        }
        if (paralelo.estado === 'sin_horario') return `${base}&tab=plan`;
        if (paralelo.estado === 'conflicto') return `${base}&tab=conflicto`;
        if (paralelo.estado === 'completo') return `${base}&tab=vista`;
        return `${base}&tab=plan`;
    }, []);

    const onOpenArmado = useCallback((paralelo) => navigate(getParaleloAction(paralelo)), [getParaleloAction, navigate]);

    const onVerHorariosAulas = useCallback(() => navigate('/institucional/horarios/aulas'), [navigate]);
    const onPublish = useCallback(() => navigate('/institucional/horarios/publicacion'), [navigate]);

    const pendientesSidebar = useMemo(() => {
        if (!pendientesSidebarRaw || typeof pendientesSidebarRaw !== 'object') {
            return { bloquesSinAulaPorParalelo: [], cursosSinDocentePorParalelo: [] };
        }
        return {
            bloquesSinAulaPorParalelo: pendientesSidebarRaw.bloquesSinAulaPorParalelo || [],
            cursosSinDocentePorParalelo: pendientesSidebarRaw.cursosSinDocentePorParalelo || [],
        };
    }, [pendientesSidebarRaw]);

    const loading = estadoLoading || pendientesSidebarLoading;
    const error = estadoError || pendientesSidebarError || null;

    return {
        title: currentGestionLabel,
        filters,
        options,
        viewMode,
        kpis,
        filteredParallels,
        paralelosCatalog: paralelosDashboard,
        boardByStatus,
        setViewMode,
        onFilterChange,
        clearFilters,
        onOpenArmado,
        onVerHorariosAulas,
        onPublish,
        hayAlertas: kpis.incompletos > 0 || kpis.conConflicto > 0 || kpis.sinHorario > 0,
        pendientesSidebar,
        getParaleloAction,
        loading,
        error,
    };
};
