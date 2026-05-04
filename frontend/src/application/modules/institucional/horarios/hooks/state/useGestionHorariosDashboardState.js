import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCapacidadTurnoApi, useGestionesCatalogApi, useParalelosEstadoApi } from '@application/modules/shared/hooks';
import { BOARD_COLUMNS, FILTER_DEFAULTS, STATUS_LABELS } from '@application-institucional/horarios/config/dashboardConstants';

export const useGestionHorariosDashboardState = () => {
    const navigate = useNavigate();
    const { gestiones } = useGestionesCatalogApi();
    const { paralelos: paralelosEstado, loading: estadoLoading, error: estadoError } = useParalelosEstadoApi();
    const { capacidad: capacidadTurno } = useCapacidadTurnoApi();
    const [filters, setFilters] = useState(FILTER_DEFAULTS);
    const [viewMode, setViewMode] = useState('board');

    const currentGestion = useMemo(() => {
        return String(gestiones?.[0]?.nombre || gestiones?.[0]?.gestion || 'Actual');
    }, [gestiones]);

    const paralelosDashboard = useMemo(() => {
        return (paralelosEstado || []).map((row) => ({
            id: row.paralelo_id,
            paralelo: row.paralelo_nombre,
            carrera: row.carrera_nombre || 'Carrera no definida',
            periodo: row.periodo_nombre,
            turno: row.turno,
            estado: row.estado,
            cursosAsignados: row.cursos_con_horario,
            cursosTotales: row.asignaturas_requeridas,
            bloquesAsignados: (row.cursos_con_horario || 0) * 3,
            bloquesRequeridos: (row.asignaturas_requeridas || 0) * 3,
        }));
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
        if (paralelo.estado === 'incompleto') return `${base}&tab=cursos`;
        if (paralelo.estado === 'sin_horario') return `${base}&tab=plan`;
        if (paralelo.estado === 'conflicto') return `${base}&tab=plan`;
        if (paralelo.estado === 'completo') return `${base}&tab=vista`;
        return `${base}&tab=plan`;
    }, []);

    const onOpenArmado = useCallback((paralelo) => navigate(getParaleloAction(paralelo)), [getParaleloAction, navigate]);
    const onViewConflicts = useCallback(() => navigate('/institucional/horarios/conflictos'), [navigate]);
    const onPublish = useCallback(() => navigate('/institucional/horarios/publicacion'), [navigate]);

    const turnosCapacityReal = useMemo(() => {
        const map = {};
        (capacidadTurno || []).forEach((row) => {
            map[row.turno] = {
                porcentaje: row.porcentaje_ocupacion,
                aulasEnUso: row.aulas_en_uso,
                totalAulas: row.total_aulas,
            };
        });
        return map;
    }, [capacidadTurno]);

    const progresoGestion = useMemo(() => {
        const total = kpis.total || 1;
        return [
            { key: 'completo', label: 'Completos', value: kpis.completos, percent: Math.round((kpis.completos / total) * 100) },
            { key: 'conflicto', label: 'Con conflictos', value: kpis.conConflicto, percent: Math.round((kpis.conConflicto / total) * 100) },
            { key: 'sin_horario', label: 'Sin horario', value: kpis.sinHorario, percent: Math.round((kpis.sinHorario / total) * 100) },
            { key: 'incompleto', label: 'Incompletos', value: kpis.incompletos, percent: Math.round((kpis.incompletos / total) * 100) },
        ];
    }, [kpis]);

    const loading = estadoLoading;
    const error = estadoError || null;

    return {
        title: currentGestionLabel,
        filters,
        options,
        viewMode,
        kpis,
        filteredParallels,
        boardByStatus,
        setViewMode,
        onFilterChange,
        clearFilters,
        onOpenArmado,
        onViewConflicts,
        onPublish,
        hayAlertas: kpis.incompletos > 0 || kpis.conConflicto > 0,
        turnosCapacity: turnosCapacityReal,
        progresoGestion,
        getParaleloAction,
        loading,
        error,
    };
};
