import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGestionesCatalogApi } from '@application-shared/hooks';
import { useHorariosPublicacionPlanesApi } from '../api/useHorariosPublicacionPlanesApi';
import { usePublicarParaleloGestionApi } from '../api/usePublicarParaleloGestionApi';
import { usePublicarTodosHorariosGestionApi } from '../api/usePublicarTodosHorariosGestionApi';
import { mapHorariosPublicacionPlanesPayload } from '../../mappers/horariosPublicacionPlanesMapper';
const FILTER_DEFAULTS = {
    carrera: 'all',
    periodo: 'all',
    turno: 'all',
};

/**
 * Orquestación pantalla /institucional/horarios/publicacion (hooks/state).
 */
export function useGestionHorariosPublicacionState() {
    const navigate = useNavigate();
    const { gestiones, loading: gestionesLoading } = useGestionesCatalogApi();
    const { data: publicacionPayload, loading, error, fetch } = useHorariosPublicacionPlanesApi();
    const publicarParalelo = usePublicarParaleloGestionApi();
    const publicarTodos = usePublicarTodosHorariosGestionApi();

    const [filters, setFilters] = useState(FILTER_DEFAULTS);
    const [publicandoPgId, setPublicandoPgId] = useState(null);

    const gestionVigente = useMemo(() => {
        const list = Array.isArray(gestiones) ? gestiones : [];
        return list.find((g) => g.vigente) ?? list[0] ?? null;
    }, [gestiones]);

    const gestionVigenteId = gestionVigente?.id != null ? Number(gestionVigente.id) : null;

    const planes = useMemo(() => {
        const raw = publicacionPayload?.planes ?? publicacionPayload;
        return mapHorariosPublicacionPlanesPayload({ planes: Array.isArray(raw) ? raw : [] });
    }, [publicacionPayload]);

    const filterOptions = useMemo(() => {
        const carreras = new Set();
        const periodos = new Set();
        const turnos = new Set();
        for (const plan of planes) {
            const p = plan?.paralelo ?? {};
            if (p.carreraNombre) carreras.add(p.carreraNombre);
            if (p.periodoNombre) periodos.add(p.periodoNombre);
            if (p.turno) turnos.add(p.turno);
        }
        return {
            carreras: [...carreras].sort((a, b) => String(a).localeCompare(String(b))),
            periodos: [...periodos].sort((a, b) => String(a).localeCompare(String(b))),
            turnos: [...turnos].sort((a, b) => String(a).localeCompare(String(b))),
        };
    }, [planes]);

    const filteredPlanes = useMemo(() => {
        return planes.filter((plan) => {
            const p = plan?.paralelo ?? {};
            if (filters.carrera !== 'all' && p.carreraNombre !== filters.carrera) return false;
            if (filters.periodo !== 'all' && p.periodoNombre !== filters.periodo) return false;
            if (filters.turno !== 'all' && p.turno !== filters.turno) return false;
            return true;
        });
    }, [planes, filters]);

    const reloadPlanes = useCallback(() => fetch({ params: {} }), [fetch]);

    useEffect(() => {
        reloadPlanes();
    }, [reloadPlanes]);

    const onFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(FILTER_DEFAULTS);
    }, []);

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    const handlePublicarParalelo = useCallback(
        async (paraleloGestionId) => {
            const pgId = Number(paraleloGestionId);
            if (!Number.isFinite(pgId) || pgId < 1) return { success: false };
            setPublicandoPgId(pgId);
            const res = await publicarParalelo.publicar(pgId);
            setPublicandoPgId(null);
            if (res.success) {
                await reloadPlanes();
            }
            return res;
        },
        [publicarParalelo, reloadPlanes],
    );

    const handlePublicarTodos = useCallback(async () => {
        if (!gestionVigenteId) {
            return { success: false, error: 'No hay gestión vigente configurada' };
        }
        const res = await publicarTodos.publicarTodos(gestionVigenteId);
        if (res.success) {
            await reloadPlanes();
        }
        return res;
    }, [gestionVigenteId, publicarTodos, reloadPlanes]);

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Publicación de horarios' },
        ],
        [],
    );

    const resumenPublicacion = useMemo(() => {
        let ofertado = 0;
        let publicado = 0;
        let otros = 0;
        for (const plan of filteredPlanes) {
            const est = String(plan?.paralelo?.paraleloGestionEstado || '').toUpperCase();
            if (est === 'OFERTADO') ofertado += 1;
            else if (est === 'PUBLICADO') publicado += 1;
            else otros += 1;
        }
        return { ofertado, publicado, otros, total: filteredPlanes.length };
    }, [filteredPlanes]);

    return {
        filters,
        options: filterOptions,
        onFilterChange,
        clearFilters,
        planes: filteredPlanes,
        loading: loading || gestionesLoading,
        error,
        breadcrumbItems,
        handleVolver,
        gestionVigente,
        gestionVigenteId,
        resumenPublicacion,
        publicandoPgId,
        publicarParaleloLoading: publicarParalelo.loading,
        publicarTodosLoading: publicarTodos.loading,
        publicarTodosResultado: publicarTodos.resultado,
        handlePublicarParalelo,
        handlePublicarTodos,
    };
}
