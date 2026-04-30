import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useCarrerasCatalogApi,
    useGestionesCatalogApi,
    useParalelosCatalogApi,
} from '@application/modules/shared/hooks';

const FILTER_DEFAULTS = {
    gestion: 'all',
    carrera: 'all',
    periodo: 'all',
    turno: 'all',
    estado: 'all',
};

const STATUS_LABELS = {
    pendiente: 'Pendiente',
    armado: 'En armado',
    conflictos: 'Con conflictos',
    listo: 'Listo para publicar',
};

export const useGestionHorariosDashboardState = () => {
    const navigate = useNavigate();
    const { carreras } = useCarrerasCatalogApi();
    const { gestiones } = useGestionesCatalogApi();
    const { paralelos, loading: paralelosLoading, error: paralelosError } = useParalelosCatalogApi();
    const [filters, setFilters] = useState(FILTER_DEFAULTS);
    const [viewMode, setViewMode] = useState('board');

    const paralelosDashboard = useMemo(() => {
        const statusOrder = ['pendiente', 'armado', 'conflictos', 'listo'];
        const carrerasById = new Map((carreras || []).map((item) => [Number(item.id), item.nombre]));
        return (paralelos || []).map((item, index) => {
            const paraleloId = Number(item.id ?? index + 1);
            const bloquesRequeridos = 24;
            const bloquesAsignados = Math.min(((paraleloId % 6) + 1) * 3, bloquesRequeridos);
            const conflictos = paraleloId % 3 === 0 ? 2 : paraleloId % 2;
            return {
                id: `PAR-${paraleloId}`,
                paralelo: item.nombre || item.codigo || `Paralelo ${paraleloId}`,
                carrera: carrerasById.get(Number(item.carreraId)) || 'Carrera no definida',
                periodo: String(item.periodoNumero || item.periodoId || 1),
                turno: item.turno || 'No definido',
                estado: statusOrder[paraleloId % statusOrder.length],
                materiasOfertadas: Math.max(1, bloquesAsignados / 3),
                materiasPlan: 8,
                bloquesAsignados,
                bloquesRequeridos,
                conflictos,
            };
        });
    }, [carreras, paralelos]);

    const onFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

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
        const pendientes = filteredParallels.filter((item) => item.estado === 'pendiente').length;
        const conflictos = filteredParallels.reduce((acc, item) => acc + item.conflictos, 0);
        const publicados = filteredParallels.filter((item) => item.estado === 'listo').length;
        return { total, pendientes, conflictos, publicados };
    }, [filteredParallels]);

    const boardByStatus = useMemo(() => {
        return ['pendiente', 'armado', 'conflictos', 'listo'].map((statusKey) => ({
            key: statusKey,
            title: STATUS_LABELS[statusKey],
            items: filteredParallels.filter((item) => item.estado === statusKey),
        }));
    }, [filteredParallels]);

    const options = useMemo(() => {
        const gestionesOptions = (gestiones || []).map((item) => String(item.nombre || item.gestion || item.id));
        const carrerasOptions = [...new Set((carreras || []).map((item) => item.nombre).filter(Boolean))];
        const periodosOptions = [...new Set(paralelosDashboard.map((item) => item.periodo).filter(Boolean))];
        const turnosOptions = [...new Set(paralelosDashboard.map((item) => item.turno).filter(Boolean))];
        return {
            gestiones: gestionesOptions,
            carreras: carrerasOptions,
            periodos: periodosOptions,
            turnos: turnosOptions,
        };
    }, [carreras, gestiones, paralelosDashboard]);

    const currentGestion = useMemo(() => {
        if (filters.gestion !== 'all') return filters.gestion;
        return options.gestiones[0] || 'Actual';
    }, [filters.gestion, options.gestiones]);

    const onOpenArmado = () => navigate('/institucional/horarios/armado');
    const onGenerate = () => navigate('/institucional/horarios/generar');
    const onViewConflicts = () => navigate('/institucional/horarios/conflictos');
    const onPublish = () => navigate('/institucional/horarios/publicacion');

    return {
        title: `Gestion de Horarios - Gestion ${currentGestion}`,
        subtitle: `Paralelos ${kpis.total} | Pendientes ${kpis.pendientes} | Conflictos ${kpis.conflictos} | Publicados ${kpis.publicados}`,
        filters,
        options,
        viewMode,
        kpis,
        filteredParallels,
        boardByStatus,
        setViewMode,
        onFilterChange,
        onOpenArmado,
        onGenerate,
        onViewConflicts,
        onPublish,
        loading: paralelosLoading,
        error: paralelosError,
    };
};
