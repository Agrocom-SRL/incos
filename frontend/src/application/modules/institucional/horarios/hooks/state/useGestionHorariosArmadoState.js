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
import { mapParaleloGestionContextModel } from '@application-institucional/common/utils/mapParaleloGestionContextModel';
import {
    armadoSearchParamsEqual,
    syncArmadoSearchParams,
} from '@application-institucional/horarios/utils/syncArmadoSearchParams';
import { buildBulkAsignacionHorarioItems } from '@application-institucional/horarios/utils/buildBulkAsignacionHorarioItems';
import {
    buildHorarioSlotIndexFromGrilla,
    resolveHorarioIdForBloque,
} from '@application-institucional/horarios/utils/buildHorarioSlotIndex';
import {
    appendBlockToCourse,
    findBlockAtSlot,
    findCourseAndBlock,
    moveBlockToSlot,
    swapOrMoveBlockToSlot,
} from '@application-institucional/horarios/utils/planSemanalBlockOps';
import {
    extractGrillaHorarioMeta,
    grillaHorarioToCourseSchedules,
    missingSubjectsFromGrillaCobertura,
} from '@application-institucional/horarios/mappers/grillaHorarioMapper';
import {
    isParaleloGestionHorarioEditable,
    mensajeParaleloGestionNoEditable,
} from '@application-institucional/horarios/utils/paraleloGestionHorarioEditable';
import {
    generarBloquesAutomaticosCurso,
} from '@application-institucional/horarios/utils/generarBloquesAutomaticosCurso';

function pickParaleloId(row) {
    return Number(row?.paraleloId ?? row?.paralelo_id ?? row?.parallelId);
}

function pickParaleloGestionEstado(row) {
    return row?.estado ?? row?.state ?? null;
}

export const useGestionHorariosArmadoState = (notification) => {
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

    const [pgDirectMeta, setPgDirectMeta] = useState(null);
    const [pgDirectLoading, setPgDirectLoading] = useState(false);
    const [pgDirectError, setPgDirectError] = useState(null);

    const resolver = useParaleloGestionVigenteResolver(validPgId ? null : validParaleloId, {
        gestionVigenteId,
    });

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
    const paraleloGestionEstado = metaFromPg?.estado ?? null;
    const horarioEditable = isParaleloGestionHorarioEditable(paraleloGestionEstado);
    const turnoEfectivo = (metaFromPg?.turno || grillaMeta?.turno || '').trim();
    const paraleloNombre =
        metaFromPg?.nombre ||
        (paraleloGestionId ? `Paralelo en gestión #${paraleloGestionId}` : null);

    const contextMeta = pgDirectMeta ?? resolver.meta;

    const paraleloGestionDetalle = useMemo(() => {
        if (!paraleloGestionId || !contextMeta) return null;
        return mapParaleloGestionContextModel({
            ...contextMeta,
            id: paraleloGestionId,
            paraleloNombre:
                metaFromPg?.nombre ?? contextMeta?.nombre ?? contextMeta?.paraleloNombre ?? null,
            turno: turnoEfectivo || contextMeta?.turno || null,
            paraleloDescripcion: contextMeta?.descripcion ?? contextMeta?.paraleloDescripcion ?? null,
        });
    }, [paraleloGestionId, contextMeta, metaFromPg?.nombre, turnoEfectivo]);

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
                estado: pickParaleloGestionEstado(det),
                paraleloMaestroId: Number.isFinite(pid) && pid > 0 ? pid : null,
                carreraNombre: det.carreraNombre ?? det.carrera_nombre ?? null,
                carreraCodigo: det.carreraCodigo ?? det.carrera_codigo ?? null,
                carreraImagenRuta: det.carreraImagenRuta ?? det.carrera_imagen_ruta ?? null,
                periodoNombre: det.periodoNombre ?? det.periodo_nombre ?? null,
                periodoNumero: det.periodoNumero ?? det.periodo_numero ?? null,
                cupoMinimo: det.cupoMinimo ?? det.cupo_minimo ?? null,
                cupoMaximo: det.cupoMaximo ?? det.cupo_maximo ?? null,
                aulaId: det.aulaId ?? det.aula_id ?? null,
                aulaCodigo: det.aulaCodigo ?? det.aula_codigo ?? null,
                aulaNombre: det.aulaNombre ?? det.aula_nombre ?? null,
                planNombre: det.planNombre ?? det.plan_nombre ?? null,
                descripcion: det.paraleloDescripcion ?? det.paralelo_descripcion ?? null,
            });
            setPgDirectLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [validPgId, fetchParaleloGestionDetalle]);

    /** URL canónica: `?pg=` + `tab`; sin `paralelo` maestro (enlace legacy `?paralelo=` se resuelve y reemplaza). */
    useEffect(() => {
        if (!paraleloGestionId) return;
        if (resolver.loading || pgDirectLoading) return;

        const tabKey = normalizeArmadoTab(searchParams.get('tab'));
        setSearchParams(
            (prev) => {
                const next = syncArmadoSearchParams(prev, {
                    paraleloGestionId,
                    tab: tabKey,
                });
                return armadoSearchParamsEqual(prev, next) ? prev : next;
            },
            { replace: true },
        );
    }, [paraleloGestionId, tab, resolver.loading, pgDirectLoading, setSearchParams]);

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
        if (!paraleloGestionId) return 'Plan semanal del paralelo';
        const base = paraleloNombre
            ? `Plan semanal — ${paraleloNombre}`
            : `Plan semanal — Paralelo en gestión #${paraleloGestionId}`;
        return turnoEfectivo ? `${base} · Turno ${turnoEfectivo}` : base;
    }, [paraleloGestionId, paraleloNombre, turnoEfectivo]);

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
        if (!persistLoading && (bulkSaved || legacyPersistResult) && paraleloGestionId) {
            fetchGrillaHorario(paraleloGestionId);
            if (bulkSaved) setBulkSaved(false);
        }
    }, [persistLoading, bulkSaved, legacyPersistResult, paraleloGestionId, fetchGrillaHorario]);

    const setTab = useCallback(
        (key) => {
            if (!paraleloGestionId) return;
            setSearchParams(
                (prev) => syncArmadoSearchParams(prev, { paraleloGestionId, tab: key }),
                { replace: true },
            );
        },
        [setSearchParams, paraleloGestionId],
    );

    const onRequestPersist = useCallback(async () => {
        if (!horarioEditable) {
            notification.warning({
                title: 'Plan no editable',
                description: mensajeParaleloGestionNoEditable(paraleloGestionEstado),
            });
            return;
        }

        if (!paraleloGestionId) return;

        const { items, incomplete } = buildBulkAsignacionHorarioItems(
            serverSchedules,
            draftSchedules,
            horarioSlotIndex,
        );

        if (!items.length) {
            notification.info({
                title: 'Sin cambios',
                description: 'No hay cambios pendientes para guardar.',
            });
            return;
        }

        if (incomplete) {
            notification.warning({
                title: 'Plan incompleto',
                description:
                    'Algunos bloques no tienen docente o franja válida. Revisá la asignación docente y el turno del paralelo antes de guardar.',
            });
            setBulkSaved(false);
            return;
        }

        const bulkRes = await ejecutarBulk(items);
        if (bulkRes.success) {
            notification.success({
                title: 'Plan guardado',
                description: 'Bloques del plan guardados correctamente.',
            });
            setBulkSaved(true);
            return;
        }

        setBulkSaved(false);
        notification.error({
            title: 'Error al guardar',
            description: bulkRes.error || 'No se pudieron guardar los bloques del plan.',
        });
    }, [
        notification,
        horarioEditable,
        paraleloGestionEstado,
        paraleloGestionId,
        serverSchedules,
        draftSchedules,
        horarioSlotIndex,
        ejecutarBulk,
    ]);

    const validatePlacement = useCallback(
        async ({
            cursoId,
            cursoHorarioId,
            targetDia,
            targetSlotMinutes,
            sourceDia,
            sourceSlotMinutes,
            bloquePreview,
        }) => {
            const { course: occupantCourse, block: occupantBlock } = findBlockAtSlot(
                draftSchedules,
                targetDia,
                targetSlotMinutes,
                cursoHorarioId,
            );
            const esIntercambioParalelo =
                occupantBlock &&
                occupantCourse &&
                Number(occupantCourse.cursoId) !== Number(cursoId) &&
                sourceDia &&
                Number.isFinite(Number(sourceSlotMinutes));

            const preview = bloquePreview
                ? appendBlockToCourse(draftSchedules, cursoId, bloquePreview)
                : esIntercambioParalelo
                  ? swapOrMoveBlockToSlot(draftSchedules, {
                        cursoId,
                        cursoHorarioId,
                        targetDia,
                        targetSlotMinutes,
                        sourceDia,
                        sourceSlotMinutes,
                    })
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

            if (esIntercambioParalelo) {
                return { ok: true, swap: true };
            }

            const horarioId = resolveHorarioIdForBloque(block, horarioSlotIndex);
            const asignacionDocenteId = Number(
                course.asignacionDocenteId ?? block.asignacionDocenteId,
            );

            if (!Number.isFinite(asignacionDocenteId) || asignacionDocenteId < 1) {
                return {
                    ok: false,
                    message:
                        'Asigná un docente a esta materia en Institucional → Oferta académica antes de colocar bloques en el plan.',
                };
            }

            if (!horarioId) {
                return {
                    ok: false,
                    message:
                        'No se encontró el horario del catálogo para esa franja. Verificá el turno del paralelo (NOCHE/TARDE) y la hora elegida.',
                };
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

            const conflictoParalelo = res.conflictos?.find((c) => c?.tipo === 'PARALELO');
            const msg =
                conflictoParalelo?.mensaje
                    ? `${conflictoParalelo.mensaje} Elegí otra franja libre o mové el bloque en la grilla.`
                    : res.conflictos?.map((c) => c.mensaje).filter(Boolean).join(' ') ||
                      res.error ||
                      'El bloque genera un conflicto de horario';
            return { ok: false, message: msg };
        },
        [draftSchedules, horarioSlotIndex, validarConflicto],
    );

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    const generarBloquesCurso = useCallback(
        (cursoId, horasPlanOverride = null) => {
            if (!horarioEditable) {
                notification.warning({
                    title: 'Plan no editable',
                    description: mensajeParaleloGestionNoEditable(paraleloGestionEstado),
                });
                return { ok: false };
            }

            const det = paraleloGestionDetalle;
            const result = generarBloquesAutomaticosCurso({
                schedules: draftSchedules,
                cursoId,
                turnoLabel: turnoEfectivo || null,
                horarioSlotIndex,
                horasPlanOverride,
                aulaMeta: {
                    aulaId: det?.aulaId ?? null,
                    aulaNombre: det?.aulaNombre ?? null,
                    aulaCodigo: det?.aulaCodigo ?? null,
                    paraleloNombre: paraleloNombre ?? null,
                },
            });

            if (result.placed > 0) {
                setDraftSchedules(result.schedules);
                if (result.faltante > 0) {
                    notification.warning({
                        title: 'Horario parcial',
                        description:
                            result.message ||
                            `Se generaron ${result.placed} bloque(s); aún faltan franjas libres para cubrir toda la carga.`,
                    });
                } else {
                    notification.success({
                        title: 'Horario generado',
                        description: `Se generaron ${result.placed} bloque(s) de 45 min. Revisá el plan y guardá los cambios.`,
                    });
                }
                setTab('plan');
                return { ok: true, ...result };
            }

            notification.warning({
                title: 'No se pudo generar',
                description: result.message || 'No se pudieron generar bloques para esta materia.',
            });
            return { ok: false, ...result };
        },
        [
            notification,
            horarioEditable,
            paraleloGestionEstado,
            draftSchedules,
            turnoEfectivo,
            horarioSlotIndex,
            paraleloGestionDetalle,
            paraleloNombre,
            setDraftSchedules,
            setTab,
        ],
    );

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

    const hasParaleloSelected = Boolean(paraleloGestionId || validParaleloId);

    return {
        paraleloGestionId,
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
        paraleloGestionDetalle,
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
        hasParaleloSelected,
        horarioSlotIndex,
        grillaHorario,
        paraleloGestionEstado,
        horarioEditable,
        generarBloquesCurso,
    };
};
