import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGestionesCatalogApi } from '@application/modules/shared/hooks';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';
import { usePersistParaleloScheduleApi } from '@application-academico/paralelos/hooks';
import { useBulkAsignacionHorariosApi } from '../api/useBulkAsignacionHorariosApi';
import { useValidarConflictoHorarioApi } from '../api/useValidarConflictoHorarioApi';
import { useParaleloGestionGrillaHorarioApi } from '../api/useParaleloGestionGrillaHorarioApi';
import { useParaleloGestionVigenteResolver } from '../useParaleloGestionVigenteResolver';
import { normalizeArmadoTab } from '@application-institucional/horarios/utils/normalizeArmadoTab';
import { buildBulkAsignacionHorarioItems } from '@application-institucional/horarios/utils/buildBulkAsignacionHorarioItems';
import {
    buildHorarioSlotIndexFromGrilla,
    resolveHorarioIdForBloque,
} from '@application-institucional/horarios/utils/buildHorarioSlotIndex';
import {
    appendBlockToCourse,
    findCourseAndBlock,
    moveBlockToSlot,
} from '@application-institucional/horarios/utils/planSemanalBlockOps';
import {
    extractGrillaHorarioMeta,
    grillaHorarioToCourseSchedules,
    missingSubjectsFromGrillaCobertura,
} from '@application-institucional/horarios/mappers/grillaHorarioMapper';

function pickParaleloId(row) {
    return Number(row?.paraleloId ?? row?.paralelo_id ?? row?.parallelId);
}

export const useGestionHorariosArmadoState = () => {
    const navigate = useNavigate();
    const { fetchParaleloGestionDetalle } = useOfertaAcademicaApi();
    const [searchParams, setSearchParams] = useSearchParams();
    const paraleloId = searchParams.get('paralelo');
    const pgParam = searchParams.get('pg');
    const tab = normalizeArmadoTab(searchParams.get('tab'));

    const numericParaleloId = paraleloId ? Number(paraleloId) : null;
    const validParaleloId =
        numericParaleloId != null && Number.isFinite(numericParaleloId) && numericParaleloId > 0
            ? numericParaleloId
            : null;

    const numericPgId = pgParam ? Number(pgParam) : null;
    const validPgId =
        numericPgId != null && Number.isFinite(numericPgId) && numericPgId > 0 ? numericPgId : null;

    const { gestiones } = useGestionesCatalogApi();
    const gestionVigente = useMemo(() => {
        const list = Array.isArray(gestiones) ? gestiones : [];
        return list.find((g) => g.vigente) ?? list[0] ?? null;
    }, [gestiones]);

    const gestionVigenteId = useMemo(() => {
        const id = gestionVigente?.id != null ? Number(gestionVigente.id) : null;
        return Number.isFinite(id) && id > 0 ? id : null;
    }, [gestionVigente]);

    const [selectorGestionId, setSelectorGestionId] = useState(null);
    const selectedGestionId = selectorGestionId ?? gestionVigenteId;

    const [pgDirectMeta, setPgDirectMeta] = useState(null);
    const [pgDirectLoading, setPgDirectLoading] = useState(false);
    const [pgDirectError, setPgDirectError] = useState(null);

    const resolver = useParaleloGestionVigenteResolver(validPgId ? null : validParaleloId);

    const paraleloGestionId = validPgId ?? resolver.paraleloGestionId;

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
    const { validar: validarConflicto } = useValidarConflictoHorarioApi();

    const [bulkSaved, setBulkSaved] = useState(false);
    const persistLoading = persistLegacyLoading || persistBulkLoading;
    const persistError = persistBulkError || persistLegacyError;
    const persistResult = bulkSaved ? { ok: true } : legacyPersistResult;

    const horarioSlotIndex = useMemo(
        () => buildHorarioSlotIndexFromGrilla(grillaHorario),
        [grillaHorario],
    );

    const grillaMeta = useMemo(() => extractGrillaHorarioMeta(grillaHorario), [grillaHorario]);

    const metaFromPg = pgDirectMeta ?? resolver.meta;
    const turnoEfectivo = (metaFromPg?.turno || grillaMeta?.turno || '').trim();
    const paraleloNombre =
        metaFromPg?.nombre || (paraleloId ? `Paralelo #${paraleloId}` : null);

    const paraleloApiMeta = useMemo(
        () =>
            validParaleloId || paraleloGestionId
                ? {
                      id: validParaleloId,
                      nombre: paraleloNombre,
                      turno: turnoEfectivo || null,
                      paraleloGestionId,
                  }
                : null,
        [validParaleloId, paraleloNombre, turnoEfectivo, paraleloGestionId],
    );

    useEffect(() => {
        if (!validPgId) {
            setPgDirectMeta(null);
            setPgDirectError(null);
            return;
        }

        let cancelled = false;
        setPgDirectLoading(true);
        setPgDirectError(null);

        (async () => {
            const detRes = await fetchParaleloGestionDetalle(validPgId);
            if (cancelled) return;
            if (!detRes.success) {
                setPgDirectError(detRes.error || 'No se pudo cargar el paralelo en gestión');
                setPgDirectMeta(null);
                setPgDirectLoading(false);
                return;
            }
            const det =
                detRes.data?.paralelo_gestion ?? detRes.data?.paraleloGestion ?? detRes.data ?? {};
            const pid = pickParaleloId(det);
            setPgDirectMeta({
                nombre: det.paraleloNombre ?? det.paralelo_nombre ?? null,
                turno: det.turno ?? null,
                paraleloMaestroId: Number.isFinite(pid) && pid > 0 ? pid : null,
            });
            setPgDirectLoading(false);

            if (pid && String(paraleloId) !== String(pid)) {
                setSearchParams(
                    (prev) => {
                        const n = new URLSearchParams(prev);
                        if (n.get('paralelo') === String(pid) && n.get('pg') === String(validPgId)) {
                            return prev;
                        }
                        n.set('paralelo', String(pid));
                        n.set('pg', String(validPgId));
                        return n;
                    },
                    { replace: true },
                );
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [validPgId, fetchParaleloGestionDetalle, paraleloId, setSearchParams]);

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
        if (!paraleloId && !paraleloGestionId) return 'Plan semanal del paralelo';
        const base = paraleloNombre
            ? `Plan semanal — ${paraleloNombre}`
            : `Plan semanal — Paralelo #${paraleloId || paraleloGestionId}`;
        return turnoEfectivo ? `${base} · Turno ${turnoEfectivo}` : base;
    }, [paraleloId, paraleloGestionId, paraleloNombre, turnoEfectivo]);

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
        if (paraleloGestionId) {
            fetchGrillaHorario(paraleloGestionId);
        }
    }, [paraleloGestionId, fetchGrillaHorario]);

    useEffect(() => {
        if (!searchParams.get('turno')) return;
        setSearchParams(
            (prev) => {
                if (!prev.get('turno')) return prev;
                const n = new URLSearchParams(prev);
                n.delete('turno');
                return n;
            },
            { replace: true },
        );
    }, [setSearchParams, searchParams]);

    useEffect(() => {
        if (!persistLoading && (bulkSaved || legacyPersistResult) && paraleloGestionId) {
            fetchGrillaHorario(paraleloGestionId);
            if (bulkSaved) setBulkSaved(false);
        }
    }, [persistLoading, bulkSaved, legacyPersistResult, paraleloGestionId, fetchGrillaHorario]);

    const setTab = useCallback(
        (key) => {
            setSearchParams(
                (prev) => {
                    const n = new URLSearchParams(prev);
                    n.set('tab', key);
                    if (paraleloId) n.set('paralelo', paraleloId);
                    if (validPgId) n.set('pg', String(validPgId));
                    n.delete('turno');
                    return n;
                },
                { replace: true },
            );
        },
        [setSearchParams, paraleloId, validPgId],
    );

    const onRequestPersist = useCallback(async () => {
        const pid =
            validParaleloId ??
            (pgDirectMeta?.paraleloMaestroId != null ? Number(pgDirectMeta.paraleloMaestroId) : null);
        if (!pid) return;

        const { items, incomplete } = buildBulkAsignacionHorarioItems(
            serverSchedules,
            draftSchedules,
            horarioSlotIndex,
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
        await persistLegacy(pid, draftSchedules);
    }, [
        validParaleloId,
        pgDirectMeta,
        grillaHorario,
        serverSchedules,
        draftSchedules,
        horarioSlotIndex,
        ejecutarBulk,
        persistLegacy,
    ]);

    const validatePlacement = useCallback(
        async ({ cursoId, cursoHorarioId, targetDia, targetSlotMinutes, bloquePreview }) => {
            const preview = bloquePreview
                ? appendBlockToCourse(draftSchedules, cursoId, bloquePreview)
                : moveBlockToSlot(draftSchedules, {
                      cursoId,
                      cursoHorarioId,
                      targetDia,
                      targetSlotMinutes,
                  });
            const { course, block } = findCourseAndBlock(preview, cursoId, cursoHorarioId);
            if (!course || !block) {
                return { ok: true };
            }

            const horarioId = resolveHorarioIdForBloque(block, horarioSlotIndex);
            const asignacionDocenteId = Number(
                course.asignacionDocenteId ?? block.asignacionDocenteId,
            );

            if (!Number.isFinite(asignacionDocenteId) || asignacionDocenteId < 1 || !horarioId) {
                return { ok: true };
            }

            const excludeRaw = block.cursoHorarioId;
            const excludeId =
                excludeRaw != null && !String(excludeRaw).startsWith('temp-')
                    ? Number(excludeRaw)
                    : null;

            const res = await validarConflicto({
                asignacion_docente_id: asignacionDocenteId,
                horario_id: horarioId,
                aula_id: block.aulaId ?? null,
                asignacion_horario_id: Number.isFinite(excludeId) ? excludeId : null,
            });

            if (res.valido) return { ok: true };

            const msg =
                res.conflictos?.map((c) => c.mensaje).filter(Boolean).join(' ') ||
                res.error ||
                'El bloque genera un conflicto de horario';
            return { ok: false, message: msg };
        },
        [draftSchedules, horarioSlotIndex, validarConflicto],
    );

    const handleSelectorGestionChange = useCallback(
        (gId) => {
            setSelectorGestionId(Number(gId));
            setSearchParams(
                (prev) => {
                    const n = new URLSearchParams(prev);
                    n.delete('pg');
                    n.delete('paralelo');
                    if (!n.get('tab')) n.set('tab', 'plan');
                    return n;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const handleSelectorParaleloChange = useCallback(
        (pgId, option) => {
            const pid = option?.paraleloId;
            setSearchParams(
                (prev) => {
                    const n = new URLSearchParams(prev);
                    n.set('pg', String(pgId));
                    if (pid) n.set('paralelo', String(pid));
                    if (!n.get('tab')) n.set('tab', 'plan');
                    n.delete('turno');
                    return n;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    const loading =
        pgDirectLoading ||
        (!validPgId && resolver.loading) ||
        (Boolean(paraleloGestionId) && grillaLoading);
    const error = pgDirectError || (!validPgId && resolver.error) || grillaError;

    const refetchSchedule = useCallback(() => {
        if (paraleloGestionId) {
            return fetchGrillaHorario(paraleloGestionId);
        }
        return Promise.resolve({ success: false, error: 'Sin paralelo en gestión' });
    }, [paraleloGestionId, fetchGrillaHorario]);

    const hasParaleloSelected = Boolean(validPgId || validParaleloId);

    return {
        paraleloId,
        paraleloGestionId,
        validPgId,
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
        validatePlacement,
        handleVolver,
        refetchSchedule,
        gestionVigenteId,
        selectedGestionId,
        handleSelectorGestionChange,
        handleSelectorParaleloChange,
        hasParaleloSelected,
    };
};
