import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGestionesCatalogApi, useParalelosEstadoApi } from '@application/modules/shared/hooks';
import { useHorariosPendientesSidebarApi } from '../api/useHorariosPendientesSidebarApi';
import {
    BOARD_COLUMNS,
    BOARD_COLUMN_LABELS,
    FILTER_DEFAULTS,
} from '@application-institucional/horarios/config/dashboardConstants';
import { resolveHorariosBoardBucket } from '@application-institucional/horarios/utils/horariosBoardBucket';
import { buildHorariosDashboardAlertLineas } from '@application-institucional/horarios/utils/buildHorariosDashboardAlertLineas';

export const useGestionHorariosDashboardState = () => {
    const navigate = useNavigate();
    const { gestiones } = useGestionesCatalogApi();
    const { paralelosEstadoDashboard, loading: estadoLoading, error: estadoError } = useParalelosEstadoApi();
    const paralelosEstado = paralelosEstadoDashboard?.paralelos ?? [];
    const {
        data: pendientesSidebarRaw,
        loading: pendientesSidebarLoading,
        error: pendientesSidebarError,
    } = useHorariosPendientesSidebarApi();
    const [filters, setFilters] = useState(FILTER_DEFAULTS);
    const [viewMode, setViewMode] = useState('table');

    const gestionVigente = useMemo(() => {
        const list = Array.isArray(gestiones) ? gestiones : [];
        return list.find((g) => g.vigente) ?? list[0] ?? null;
    }, [gestiones]);

    const gestionVigenteId =
        gestionVigente?.id != null && Number.isFinite(Number(gestionVigente.id))
            ? Number(gestionVigente.id)
            : null;

    const currentGestion = useMemo(() => {
        return String(
            gestionVigente?.nombre || gestionVigente?.gestion || gestiones?.[0]?.nombre || 'Actual',
        );
    }, [gestionVigente, gestiones]);

    const paralelosDashboard = useMemo(() => {
        return (paralelosEstado || []).map((row) => {
            const cursosTotales = row.asignaturas_requeridas ?? 0;
            const cursosCreados = row.cursos_creados ?? 0;
            const cursosConHorario = row.cursos_con_horario ?? 0;
            const pgId =
                row.paralelo_gestion_id != null ? Number(row.paralelo_gestion_id) : null;
            const ofertasCoberturaIncompleta = row.ofertas_cobertura_incompleta ?? 0;
            const mapped = {
                id: row.paralelo_id,
                paraleloGestionId:
                    Number.isFinite(pgId) && pgId > 0 ? pgId : null,
                paralelo: row.paralelo_nombre,
                paraleloGestionEstado: row.paralelo_gestion_estado ?? null,
                paraleloAulaId: row.paralelo_aula_id != null ? Number(row.paralelo_aula_id) : null,
                carrera: row.carrera_nombre || 'Carrera no definida',
                carreraId: row.carrera_id != null ? Number(row.carrera_id) : null,
                carreraColorHex: row.carrera_color_hex ?? null,
                periodo: row.periodo_nombre,
                turno: row.turno,
                cursosAsignados: cursosConHorario,
                cursosTotales,
                cursosCreados,
                ofertasCoberturaIncompleta,
                cursosSinDocente: row.cursos_sin_docente ?? 0,
                cursosSinBloquesHorario: Math.max(0, ofertasCoberturaIncompleta, cursosCreados - cursosConHorario),
                bloquesSinAula: row.bloques_sin_aula ?? 0,
                conflictosSolapeMismoBloque: row.conflictos_solape_mismo_bloque ?? 0,
                conflictosAula: row.conflictos_aula ?? 0,
                conflictoDocenteHorario: Number(row.conflicto_docente_horario) === 1,
            };
            return {
                ...mapped,
                boardBucket: row.board_bucket ?? row.tablero_grupo ?? resolveHorariosBoardBucket(mapped),
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
        const sinDocentes = filteredParallels.filter((item) => resolveHorariosBoardBucket(item) === 'sin_docentes')
            .length;
        const sinAulas = filteredParallels.filter((item) => resolveHorariosBoardBucket(item) === 'sin_aulas').length;
        const sinHorarios = filteredParallels.filter((item) => resolveHorariosBoardBucket(item) === 'sin_horarios')
            .length;
        const completos = filteredParallels.filter((item) => resolveHorariosBoardBucket(item) === 'completo').length;
        return { total, sinDocentes, sinAulas, sinHorarios, completos };
    }, [filteredParallels]);

    /** Tablero si hay trabajo pendiente; tabla si todos los paralelos visibles están completos. */
    useEffect(() => {
        if (estadoLoading) return;
        const requiereAtencion =
            kpis.sinDocentes > 0 || kpis.sinAulas > 0 || kpis.sinHorarios > 0;
        setViewMode(requiereAtencion ? 'board' : 'table');
    }, [estadoLoading, kpis.sinDocentes, kpis.sinAulas, kpis.sinHorarios]);

    const boardByStatus = useMemo(() => {
        return BOARD_COLUMNS.map((bucketKey) => ({
            key: bucketKey,
            title: BOARD_COLUMN_LABELS[bucketKey],
            items: filteredParallels.filter((item) => resolveHorariosBoardBucket(item) === bucketKey),
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

    const buildArmadoUrl = useCallback((paralelo, extraQuery = '') => {
        const q = new URLSearchParams();
        if (paralelo.id) q.set('paralelo', String(paralelo.id));
        if (paralelo.paraleloGestionId) q.set('pg', String(paralelo.paraleloGestionId));
        const base = `/institucional/horarios/armado?${q.toString()}`;
        return extraQuery ? `${base}&${extraQuery.replace(/^&/, '')}` : base;
    }, []);

    const getParaleloAction = useCallback((paralelo) => {
        const baseArmado = buildArmadoUrl(paralelo);
        const bucket = paralelo.boardBucket ?? resolveHorariosBoardBucket(paralelo);
        if (bucket === 'completo') return `${baseArmado}&tab=vista`;
        if (bucket === 'sin_docentes') return `${baseArmado}&tab=cursos`;
        if (bucket === 'sin_aulas') {
            return '/institucional/horarios/aulas';
        }
        if (bucket === 'sin_horarios') {
            const planIncompleto =
                (paralelo.cursosTotales ?? 0) > 0 &&
                (paralelo.cursosCreados ?? 0) < (paralelo.cursosTotales ?? 0);
            return planIncompleto ? `${baseArmado}&tab=gestion` : `${baseArmado}&tab=plan`;
        }
        return `${baseArmado}&tab=plan`;
    }, [buildArmadoUrl]);

    const onOpenArmado = useCallback((paralelo) => navigate(getParaleloAction(paralelo)), [getParaleloAction, navigate]);

    const onVerHorariosAulas = useCallback(() => navigate('/institucional/horarios/aulas'), [navigate]);
    const onPublish = useCallback(() => navigate('/institucional/horarios/publicacion'), [navigate]);

    const pendientesSidebar = useMemo(() => {
        if (!pendientesSidebarRaw || typeof pendientesSidebarRaw !== 'object') {
            return {
                bloquesSinAulaPorParalelo: [],
                cursosSinDocentePorParalelo: [],
                docentesConConflictosOperativos: [],
            };
        }
        return {
            bloquesSinAulaPorParalelo: pendientesSidebarRaw.bloquesSinAulaPorParalelo || [],
            cursosSinDocentePorParalelo: pendientesSidebarRaw.cursosSinDocentePorParalelo || [],
            docentesConConflictosOperativos: pendientesSidebarRaw.docentesConConflictosOperativos || [],
        };
    }, [pendientesSidebarRaw]);

    const docentesConConflictosCount = useMemo(() => {
        const list = pendientesSidebar.docentesConConflictosOperativos || [];
        return list.filter((d) => d?.docenteId != null).length;
    }, [pendientesSidebar]);

    const alertLineas = useMemo(
        () =>
            buildHorariosDashboardAlertLineas(filteredParallels, {
                docentesConConflictos: docentesConConflictosCount,
            }),
        [filteredParallels, docentesConConflictosCount],
    );

    const hayAlertas =
        kpis.sinDocentes > 0 ||
        kpis.sinAulas > 0 ||
        kpis.sinHorarios > 0 ||
        docentesConConflictosCount > 0;

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
        gestionVigenteId,
        hayAlertas,
        alertLineas,
        pendientesSidebar,
        getParaleloAction,
        loading,
        error,
    };
};
