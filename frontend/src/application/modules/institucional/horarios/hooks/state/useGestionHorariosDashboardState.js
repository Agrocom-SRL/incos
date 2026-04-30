import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useAsignaturasSinCursoApi,
    useCapacidadTurnoApi,
    useGestionesCatalogApi,
    useParalelosEstadoApi,
} from '@application/modules/shared/hooks';
import { BOARD_COLUMNS, FILTER_DEFAULTS, STATUS_LABELS } from '@application-institucional/horarios/config/dashboardConstants';

export const useGestionHorariosDashboardState = () => {
    const navigate = useNavigate();
    const { gestiones } = useGestionesCatalogApi();
    const { paralelos: paralelosEstado, loading: estadoLoading, error: estadoError } = useParalelosEstadoApi();
    const { asignaturas: asignaturasSinCurso, loading: asigLoading } = useAsignaturasSinCursoApi();
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
            gestion: currentGestion,
            estado: row.estado,
            cursosAsignados: row.cursos_con_horario,
            cursosTotales: row.asignaturas_requeridas,
            materiasOfertadas: row.cursos_creados,
            materiasPlan: row.asignaturas_requeridas,
            bloquesAsignados: (row.cursos_con_horario || 0) * 3,
            bloquesRequeridos: (row.asignaturas_requeridas || 0) * 3,
            conflictos: row.conflictos_aula || 0,
        }));
    }, [currentGestion, paralelosEstado]);

    const onFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(FILTER_DEFAULTS);
    }, []);

    const filteredParallels = useMemo(() => {
        return paralelosDashboard.filter((row) => {
            if (filters.gestion !== 'all') {
                const gestionStr = String(filters.gestion);
                const rowGestion = String(row.gestion || filters.gestion);
                if (rowGestion !== gestionStr) return false;
            }
            if (filters.carrera !== 'all' && row.carrera !== filters.carrera) return false;
            if (filters.periodo !== 'all' && row.periodo !== filters.periodo) return false;
            if (filters.turno !== 'all' && row.turno !== filters.turno) return false;
            if (filters.estado !== 'all' && row.estado !== filters.estado) return false;
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
        const gestionesOptions = (gestiones || []).map((item) => String(item.nombre || item.gestion || item.id));
        const carrerasOptions = [...new Set(paralelosDashboard.map((item) => item.carrera).filter(Boolean))];
        const periodosOptions = [...new Set(paralelosDashboard.map((item) => item.periodo).filter(Boolean))];
        const turnosOptions = [...new Set(paralelosDashboard.map((item) => item.turno).filter(Boolean))];
        return {
            gestiones: gestionesOptions,
            carreras: carrerasOptions,
            periodos: periodosOptions,
            turnos: turnosOptions,
        };
    }, [gestiones, paralelosDashboard]);

    const currentGestionLabel = useMemo(() => {
        if (filters.gestion !== 'all') return filters.gestion;
        return options.gestiones[0] || currentGestion;
    }, [currentGestion, filters.gestion, options.gestiones]);

    const getParaleloAction = useCallback((paralelo) => {
        if (paralelo.estado === 'incompleto') return `/institucional/horarios/armado?paralelo=${paralelo.id}&tab=cursos`;
        if (paralelo.estado === 'sin_horario') return `/institucional/horarios/armado?paralelo=${paralelo.id}&tab=horarios`;
        if (paralelo.estado === 'conflicto') return `/institucional/horarios/conflictos?paralelo=${paralelo.id}`;
        return `/institucional/horarios/armado?paralelo=${paralelo.id}&tab=vista`;
    }, []);

    const onOpenArmado = useCallback((paralelo) => navigate(getParaleloAction(paralelo)), [getParaleloAction, navigate]);
    const onGenerate = useCallback(() => navigate('/institucional/horarios/generar'), [navigate]);
    const onViewConflicts = useCallback(() => navigate('/institucional/horarios/conflictos'), [navigate]);
    const onPublish = useCallback(() => navigate('/institucional/horarios/publicacion'), [navigate]);

    const cursosIncompletosAgrupados = useMemo(() => {
        const groups = new Map();
        (asignaturasSinCurso || []).forEach((row) => {
            const key = `${row.carrera_id}-${row.periodo_id}`;
            if (!groups.has(key)) {
                groups.set(key, {
                    carrera: row.carrera_nombre,
                    periodo: row.periodo_nombre,
                    faltantes: 0,
                    asignaturas: [],
                });
            }
            const group = groups.get(key);
            group.faltantes += 1;
            group.asignaturas.push({
                sigla: row.materia_sigla,
                nombre: row.materia_nombre,
                horas: row.horas_semanales,
            });
        });
        return Array.from(groups.values());
    }, [asignaturasSinCurso]);

    const turnosCapacityReal = useMemo(() => {
        const map = {};
        (capacidadTurno || []).forEach((row) => {
            map[row.turno] = {
                bloquesOcupados: row.bloques_ocupados,
                totalBloques: row.total_bloques_disponibles,
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

    const loading = estadoLoading || asigLoading;
    const error = estadoError || null;

    return {
        title: `Gestion de Horarios - Gestion ${currentGestionLabel}`,
        subtitle: `Paralelos ${kpis.total} | Incompletos ${kpis.incompletos} | Sin horario ${kpis.sinHorario} | Conflictos ${kpis.conConflicto} | Completos ${kpis.completos}`,
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
        onGenerate,
        onViewConflicts,
        onPublish,
        hayAlertas: kpis.incompletos > 0 || kpis.conConflicto > 0,
        cursosIncompletos: cursosIncompletosAgrupados,
        turnosCapacity: turnosCapacityReal,
        progresoGestion,
        getParaleloAction,
        loading,
        error,
    };
};
