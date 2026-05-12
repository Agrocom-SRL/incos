import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useParaleloScheduleApi, usePersistParaleloScheduleApi } from '@application-academico/paralelos/hooks';
import {
    extractParaleloScheduleMeta,
    paraleloScheduleToCourseSchedules,
} from '@application-institucional/horarios';
import { normalizeArmadoTab } from '@application-institucional/horarios/utils/normalizeArmadoTab';

export const useGestionHorariosArmadoState = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const paraleloId = searchParams.get('paralelo');
    const tab = normalizeArmadoTab(searchParams.get('tab'));

    const { schedule, loading, error, fetch } = useParaleloScheduleApi();
    const {
        result: persistResult,
        loading: persistLoading,
        error: persistError,
        fetch: persist,
    } = usePersistParaleloScheduleApi();

    const paraleloApiMeta = useMemo(() => extractParaleloScheduleMeta(schedule), [schedule]);
    const turnoEfectivo = (paraleloApiMeta?.turno || '').trim();
    const paraleloNombre =
        paraleloApiMeta?.nombre || (paraleloId ? `Paralelo #${paraleloId}` : null);

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Plan semanal' },
        ],
        [],
    );

    const pageTitle = useMemo(() => {
        if (!paraleloId) return 'Plan semanal del paralelo';
        const nombre = paraleloApiMeta?.nombre;
        const base = nombre ? `Plan semanal — ${nombre}` : `Plan semanal — Paralelo #${paraleloId}`;
        return turnoEfectivo ? `${base} · Turno ${turnoEfectivo}` : base;
    }, [paraleloId, paraleloApiMeta?.nombre, turnoEfectivo]);

    const meta = useMemo(
        () => ({
            turno: turnoEfectivo || null,
            paraleloNombre,
        }),
        [turnoEfectivo, paraleloNombre],
    );

    const serverSchedules = useMemo(() => paraleloScheduleToCourseSchedules(schedule, meta), [schedule, meta]);
    const missingSubjects = useMemo(() => {
        if (!schedule || Array.isArray(schedule)) return [];
        return Array.isArray(schedule.missingSubjects) ? schedule.missingSubjects : [];
    }, [schedule]);

    const [draftSchedules, setDraftSchedules] = useState([]);

    useEffect(() => {
        /* Sincronizar borrador con el plan del servidor cuando cambia la respuesta (p. ej. tras persistir). */
        // eslint-disable-next-line react-hooks/set-state-in-effect -- estado local de edición debe rehidratar desde API
        setDraftSchedules((prev) => {
            try {
                if (JSON.stringify(prev) === JSON.stringify(serverSchedules)) return prev;
            } catch {
                /* comparación no bloqueante */
            }
            return serverSchedules;
        });
    }, [serverSchedules]);

    useEffect(() => {
        if (paraleloId) {
            fetch(Number(paraleloId));
        }
    }, [paraleloId, fetch]);

    useEffect(() => {
        if (!searchParams.get('turno')) return;
        setSearchParams(
            (prev) => {
                const n = new URLSearchParams(prev);
                n.delete('turno');
                return n;
            },
            { replace: true },
        );
    }, [setSearchParams, searchParams]);

    useEffect(() => {
        if (!persistLoading && persistResult && paraleloId) {
            fetch(Number(paraleloId));
        }
    }, [persistLoading, persistResult, paraleloId, fetch]);

    const setTab = useCallback(
        (key) => {
            setSearchParams(
                (prev) => {
                    const n = new URLSearchParams(prev);
                    n.set('tab', key);
                    if (paraleloId) n.set('paralelo', paraleloId);
                    n.delete('turno');
                    return n;
                },
                { replace: true },
            );
        },
        [setSearchParams, paraleloId],
    );

    const onRequestPersist = useCallback(() => {
        if (!paraleloId) return;
        persist(Number(paraleloId), draftSchedules);
    }, [paraleloId, persist, draftSchedules]);

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    return {
        paraleloId,
        tab,
        setTab,
        turnoEfectivo,
        breadcrumbItems,
        pageTitle,
        loading,
        error,
        persistResult,
        persistLoading,
        persistError,
        paraleloApiMeta,
        paraleloNombre,
        missingSubjects,
        draftSchedules,
        serverSchedules,
        setDraftSchedules,
        onRequestPersist,
        handleVolver,
        refetchSchedule: fetch,
    };
};
