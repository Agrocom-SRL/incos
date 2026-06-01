import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGestionesCatalogApi } from '@application/modules/shared/hooks';
import { usePersistParaleloScheduleApi } from '@application-academico/paralelos/hooks';
import { useBulkAsignacionHorariosApi } from '../api/useBulkAsignacionHorariosApi';
import { useParaleloGestionGrillaHorarioApi } from '../api/useParaleloGestionGrillaHorarioApi';
import { useParaleloGestionVigenteResolver } from '../useParaleloGestionVigenteResolver';
import { normalizeArmadoTab } from '@application-institucional/horarios/utils/normalizeArmadoTab';
import { buildBulkAsignacionHorarioItems } from '@application-institucional/horarios/utils/buildBulkAsignacionHorarioItems';
import { buildHorarioSlotIndexFromGrilla } from '@application-institucional/horarios/utils/buildHorarioSlotIndex';
import {
    extractGrillaHorarioMeta,
    grillaHorarioToCourseSchedules,
    missingSubjectsFromGrillaCobertura,
} from '@application-institucional/horarios/mappers/grillaHorarioMapper';

export const useGestionHorariosArmadoState = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const paraleloId = searchParams.get('paralelo');
    const tab = normalizeArmadoTab(searchParams.get('tab'));

    const numericParaleloId = paraleloId ? Number(paraleloId) : null;
    const validParaleloId =
        numericParaleloId != null && Number.isFinite(numericParaleloId) && numericParaleloId > 0
            ? numericParaleloId
            : null;

    const { gestiones } = useGestionesCatalogApi();
    const gestionVigenteId = useMemo(() => {
        const list = Array.isArray(gestiones) ? gestiones : [];
        const vigente = list.find((g) => g.vigente) ?? list[0];
        const id = vigente?.id != null ? Number(vigente.id) : null;
        return Number.isFinite(id) && id > 0 ? id : null;
    }, [gestiones]);

    const resolver = useParaleloGestionVigenteResolver(validParaleloId);
    const {
        grillaHorario,
        loading: grillaLoading,
        error: grillaError,
        fetchGrillaHorario,
    } = useParaleloGestionGrillaHorarioApi();

    const {
        result: legacyPersistResult,
        loading: persistLegacyLoading,
        error: persistLegacyError,
        fetch: persistLegacy,
    } = usePersistParaleloScheduleApi();
    const {
        loading: persistBulkLoading,
        error: persistBulkError,
        ejecutarBulk,
    } = useBulkAsignacionHorariosApi();

    const [bulkSaved, setBulkSaved] = useState(false);
    const persistLoading = persistLegacyLoading || persistBulkLoading;
    const persistError = persistBulkError || persistLegacyError;
    const persistResult = bulkSaved ? { ok: true } : legacyPersistResult;

    const grillaMeta = useMemo(() => extractGrillaHorarioMeta(grillaHorario), [grillaHorario]);

    const turnoEfectivo = (resolver.meta?.turno || grillaMeta?.turno || '').trim();
    const paraleloNombre =
        resolver.meta?.nombre || (paraleloId ? `Paralelo #${paraleloId}` : null);

    const paraleloApiMeta = useMemo(
        () =>
            validParaleloId
                ? {
                      id: validParaleloId,
                      nombre: paraleloNombre,
                      turno: turnoEfectivo || null,
                      paraleloGestionId: resolver.paraleloGestionId,
                  }
                : null,
        [validParaleloId, paraleloNombre, turnoEfectivo, resolver.paraleloGestionId],
    );

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
        const base = paraleloNombre
            ? `Plan semanal — ${paraleloNombre}`
            : `Plan semanal — Paralelo #${paraleloId}`;
        return turnoEfectivo ? `${base} · Turno ${turnoEfectivo}` : base;
    }, [paraleloId, paraleloNombre, turnoEfectivo]);

    const serverSchedules = useMemo(() => {
        if (!grillaHorario) return [];
        return grillaHorarioToCourseSchedules(grillaHorario, {
            turno: turnoEfectivo || null,
            paraleloNombre,
        });
    }, [grillaHorario, turnoEfectivo, paraleloNombre]);

    const missingSubjects = useMemo(
        () => missingSubjectsFromGrillaCobertura(grillaHorario),
        [grillaHorario],
    );

    const conflictosGrilla = grillaMeta?.conflictos ?? [];
    const coberturaGrilla = grillaMeta?.cobertura ?? null;

    const [draftSchedules, setDraftSchedules] = useState([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- borrador local rehidrata desde grilla
        setDraftSchedules((prev) => {
            try {
                if (JSON.stringify(prev) === JSON.stringify(serverSchedules)) return prev;
            } catch {
                /* noop */
            }
            return serverSchedules;
        });
    }, [serverSchedules]);

    useEffect(() => {
        if (resolver.paraleloGestionId) {
            fetchGrillaHorario(resolver.paraleloGestionId);
        }
    }, [resolver.paraleloGestionId, fetchGrillaHorario]);

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
        if (!persistLoading && (bulkSaved || legacyPersistResult) && resolver.paraleloGestionId) {
            fetchGrillaHorario(resolver.paraleloGestionId);
            if (bulkSaved) setBulkSaved(false);
        }
    }, [
        persistLoading,
        bulkSaved,
        legacyPersistResult,
        resolver.paraleloGestionId,
        fetchGrillaHorario,
    ]);

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

    const onRequestPersist = useCallback(async () => {
        if (!validParaleloId) return;

        const horarioIndex = buildHorarioSlotIndexFromGrilla(grillaHorario);
        const { items, incomplete } = buildBulkAsignacionHorarioItems(
            serverSchedules,
            draftSchedules,
            horarioIndex,
        );

        if (!items.length) return;

        if (!incomplete) {
            const bulkRes = await ejecutarBulk(items);
            if (bulkRes.success) {
                setBulkSaved(true);
                return;
            }
        }

        setBulkSaved(false);
        await persistLegacy(validParaleloId, draftSchedules);
    }, [
        validParaleloId,
        grillaHorario,
        serverSchedules,
        draftSchedules,
        ejecutarBulk,
        persistLegacy,
    ]);

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    const loading = resolver.loading || (Boolean(resolver.paraleloGestionId) && grillaLoading);
    const error = resolver.error || grillaError;

    const refetchSchedule = useCallback(() => {
        if (resolver.paraleloGestionId) {
            return fetchGrillaHorario(resolver.paraleloGestionId);
        }
        return Promise.resolve({ success: false, error: 'Sin paralelo en gestión' });
    }, [resolver.paraleloGestionId, fetchGrillaHorario]);

    return {
        paraleloId,
        paraleloGestionId: resolver.paraleloGestionId,
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
        conflictosGrilla,
        coberturaGrilla,
        draftSchedules,
        serverSchedules,
        setDraftSchedules,
        onRequestPersist,
        handleVolver,
        refetchSchedule,
        gestionVigenteId,
    };
};
