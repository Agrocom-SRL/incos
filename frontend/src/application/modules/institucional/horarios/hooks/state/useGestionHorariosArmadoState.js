import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useGestionesCatalogApi } from '@application-shared/hooks';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';
import { usePersistParaleloScheduleApi } from '@application-academico/paralelos/hooks';
import { useBulkAsignacionHorariosApi } from '../api/useBulkAsignacionHorariosApi';
import { useValidarConflictoHorarioApi } from '../api/useValidarConflictoHorarioApi';
import { useParaleloGestionGrillaHorarioApi } from '../api/useParaleloGestionGrillaHorarioApi';
import { usePublicarParaleloGestionApi } from '../api/usePublicarParaleloGestionApi';
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
    isParaleloGestionCoberturaReajustable,
    isParaleloGestionHorarioEditable,
    isParaleloGestionPlanSemanalEditable,
    mensajeParaleloGestionCoberturaNoReajustable,
    mensajeParaleloGestionNoEditable,
    mensajeParaleloGestionPlanNoEditable,
} from '@application-institucional/horarios/utils/paraleloGestionHorarioEditable';
import {
    generarBloquesAutomaticosCurso,
    reajustarCoberturaCurso,
} from '@application-institucional/horarios/utils/generarBloquesAutomaticosCurso';

function pickParaleloId(row) {
    return Number(row?.paraleloId ?? row?.paralelo_id ?? row?.parallelId);
}

function pickParaleloGestionEstado(row) {
    return row?.estado ?? row?.state ?? null;
}

export const useGestionHorariosArmadoState = (notification) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchParaleloGestionDetalleSilent, updateParaleloGestionEstado } =
        useOfertaAcademicaApi();
    const { publicar: publicarParaleloApi } = usePublicarParaleloGestionApi();
    const [publicandoParalelo, setPublicandoParalelo] = useState(false);
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
        fetch: _persistLegacy,
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
    const planSemanalEditable = isParaleloGestionPlanSemanalEditable(paraleloGestionEstado);
    const coberturaReajustable = isParaleloGestionCoberturaReajustable(paraleloGestionEstado);
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
            const detRes = await fetchParaleloGestionDetalleSilent(validPgId);
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
    }, [validPgId, fetchParaleloGestionDetalleSilent]);

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
        if (!planSemanalEditable) {
            notification.warning({
                title: 'Plan no editable',
                description: mensajeParaleloGestionPlanNoEditable(paraleloGestionEstado),
            });
            return;
        }

        if (!paraleloGestionId) return;

        let { items, incomplete } = buildBulkAsignacionHorarioItems(
            serverSchedules,
            draftSchedules,
            horarioSlotIndex,
        );

        if (!horarioEditable) {
            const reubicaciones = items.filter((item) => String(item.op).toLowerCase() === 'update');
            const descartados = items.length - reubicaciones.length;
            if (descartados > 0 && reubicaciones.length === 0) {
                notification.warning({
                    title: 'Paralelo publicado',
                    description: mensajeParaleloGestionNoEditable(paraleloGestionEstado),
                });
                return;
            }
            if (descartados > 0) {
                notification.info({
                    title: 'Paralelo publicado',
                    description:
                        'Solo se guardarán reubicaciones de bloques existentes. No se aplican altas ni bajas en este estado.',
                });
            }
            items = reubicaciones;
        }

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
                    'Algunos bloques no tienen docente o franja válida. Revise la asignación docente y el turno del paralelo antes de guardar.',
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
        planSemanalEditable,
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

            // Soltar sobre una franja donde la MISMA materia ya tiene otro bloque:
            // no-op silencioso. No es un error que deba interrumpir al usuario
            // (equivale al conflicto backend "La asignación ya tiene un bloque").
            if (
                occupantBlock &&
                occupantCourse &&
                Number(occupantCourse.cursoId) === Number(cursoId)
            ) {
                return { ok: false, silent: true };
            }

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
                        'Asigne un docente a esta materia en Institucional → Oferta académica antes de colocar bloques en el plan.',
                };
            }

            if (!horarioId) {
                return {
                    ok: false,
                    message:
                        'No se encontró el horario del catálogo para esa franja. Verifique el turno del paralelo (NOCHE/TARDE) y la hora elegida.',
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
                    ? `${conflictoParalelo.mensaje} Cada franja del paralelo admite una sola clase: elija una franja libre, o primero mueva a otro horario el bloque que ya está ahí.`
                    : res.conflictos?.map((c) => c.mensaje).filter(Boolean).join(' ') ||
                      res.error ||
                      'El bloque genera un conflicto de horario';
            return { ok: false, message: msg };
        },
        [draftSchedules, horarioSlotIndex, validarConflicto],
    );

    const handleVolver = useCallback(() => {
        const returnPath = location.state?.returnListPath;
        const target =
            typeof returnPath === 'string' && returnPath.trim()
                ? returnPath.trim()
                : '/institucional/horarios';
        navigate(target, {
            state: location.state?.menuSidebarKey
                ? { menuSidebarKey: location.state.menuSidebarKey }
                : undefined,
        });
    }, [navigate, location.state]);

    const persistDraftSchedules = useCallback(
        async (nextDraft, { coberturaReajuste = false } = {}) => {
            if (!paraleloGestionId) {
                return { success: false, error: 'Sin paralelo en gestión' };
            }

            let { items, incomplete } = buildBulkAsignacionHorarioItems(
                serverSchedules,
                nextDraft,
                horarioSlotIndex,
            );

            if (!coberturaReajuste && !horarioEditable) {
                const reubicaciones = items.filter((item) => String(item.op).toLowerCase() === 'update');
                items = reubicaciones;
            }

            if (!items.length) {
                return { success: true, noop: true };
            }

            if (incomplete) {
                return {
                    success: false,
                    error:
                        'Algunos bloques no tienen docente o franja válida. Revise la asignación docente y el turno del paralelo.',
                };
            }

            const bulkRes = await ejecutarBulk(items, { coberturaReajuste });
            if (bulkRes.success) {
                setBulkSaved(true);
                return { success: true, data: bulkRes.data };
            }

            setBulkSaved(false);
            return { success: false, error: bulkRes.error || 'No se pudieron guardar los bloques.' };
        },
        [
            paraleloGestionId,
            serverSchedules,
            horarioSlotIndex,
            horarioEditable,
            ejecutarBulk,
        ],
    );

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
                        description: `Se generaron ${result.placed} bloque(s) de 45 min. Revise el plan y guarde los cambios.`,
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

    const reajustarBloquesCurso = useCallback(
        async (cursoId, horasPlanOverride = null) => {
            if (!coberturaReajustable) {
                notification.warning({
                    title: 'Cobertura no editable',
                    description: mensajeParaleloGestionCoberturaNoReajustable(paraleloGestionEstado),
                });
                return { ok: false };
            }

            const det = paraleloGestionDetalle;
            const result = reajustarCoberturaCurso({
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

            if (result.removed === 0 && result.placed === 0) {
                notification.warning({
                    title: 'Sin cambios',
                    description:
                        result.message ||
                        'La cobertura ya coincide con el plan o no hay franjas libres para completarla.',
                });
                return { ok: false, ...result };
            }

            const persistRes = await persistDraftSchedules(result.schedules, { coberturaReajuste: true });
            if (!persistRes.success) {
                notification.error({
                    title: 'No se pudo guardar',
                    description:
                        persistRes.error ||
                        'Se calculó el reajuste pero no se pudo persistir. Revise conflictos o permisos.',
                });
                return { ok: false, ...result };
            }

            setDraftSchedules(result.schedules);
            if (result.faltante > 0) {
                notification.warning({
                    title: 'Cobertura parcial',
                    description:
                        result.message ||
                        'Se alineó parte de la carga; aún faltan franjas libres en el turno.',
                });
            } else {
                notification.success({
                    title: 'Cobertura reajustada',
                    description:
                        result.message ||
                        `Se alineó la materia con la carga del plan (${result.removed} quitados, ${result.placed} generados).`,
                });
            }
            setTab('plan');
            return { ok: true, ...result };
        },
        [
            notification,
            coberturaReajustable,
            paraleloGestionEstado,
            draftSchedules,
            turnoEfectivo,
            horarioSlotIndex,
            paraleloGestionDetalle,
            paraleloNombre,
            persistDraftSchedules,
            setDraftSchedules,
            setTab,
        ],
    );

    const reajustarCoberturaParalelo = useCallback(async () => {
        if (!coberturaReajustable) {
            notification.warning({
                title: 'Cobertura no editable',
                description: mensajeParaleloGestionCoberturaNoReajustable(paraleloGestionEstado),
            });
            return { ok: false };
        }

        const det = paraleloGestionDetalle;
        const aulaMeta = {
            aulaId: det?.aulaId ?? null,
            aulaNombre: det?.aulaNombre ?? null,
            aulaCodigo: det?.aulaCodigo ?? null,
            paraleloNombre: paraleloNombre ?? null,
        };

        let nextSchedules = draftSchedules;
        let totalRemoved = 0;
        let totalPlaced = 0;
        let totalFaltante = 0;
        const sinDocente = [];

        for (const curso of draftSchedules) {
            if (!curso?.docente || !curso?.asignacionDocenteId) {
                sinDocente.push(
                    curso?.materiaNombre || curso?.materiaSigla || `Curso ${curso?.cursoId}`,
                );
                continue;
            }
            const result = reajustarCoberturaCurso({
                schedules: nextSchedules,
                cursoId: curso.cursoId,
                turnoLabel: turnoEfectivo || null,
                horarioSlotIndex,
                aulaMeta,
            });
            nextSchedules = result.schedules;
            totalRemoved += result.removed ?? 0;
            totalPlaced += result.placed ?? 0;
            totalFaltante += result.faltante ?? 0;
        }

        const sinDocenteMsg = sinDocente.length
            ? ` Sin docente (asigne uno en Oferta académica): ${sinDocente.join(', ')}.`
            : '';

        if (totalRemoved === 0 && totalPlaced === 0) {
            notification.warning({
                title: 'Cobertura sin cambios',
                description:
                    `La cobertura de las materias con docente ya coincide con el plan o no hay franjas libres en el turno (incluido sábado).${sinDocenteMsg}`,
            });
            return { ok: false };
        }

        const persistRes = await persistDraftSchedules(nextSchedules, {
            coberturaReajuste: true,
        });
        if (!persistRes.success) {
            notification.error({
                title: 'No se pudo guardar',
                description:
                    persistRes.error ||
                    'Se calculó la cobertura de la semana pero no se pudo persistir. Revise conflictos o permisos.',
            });
            return { ok: false };
        }

        setDraftSchedules(nextSchedules);
        const resumen = `${totalPlaced} bloque(s) generados, ${totalRemoved} quitado(s)`;
        if (totalFaltante > 0) {
            notification.warning({
                title: 'Cobertura parcial de la semana',
                description: `Se alineó parte de la carga (${resumen}); faltan ${totalFaltante} franja(s) libre(s) en el turno.${sinDocenteMsg}`,
            });
        } else {
            notification.success({
                title: 'Cobertura de la semana generada',
                description: `Se alineó toda la semana con el plan (${resumen}).${sinDocenteMsg}`,
            });
        }
        setTab('plan');
        return { ok: true, placed: totalPlaced, removed: totalRemoved, faltante: totalFaltante };
    }, [
        notification,
        coberturaReajustable,
        paraleloGestionEstado,
        draftSchedules,
        turnoEfectivo,
        horarioSlotIndex,
        paraleloGestionDetalle,
        paraleloNombre,
        persistDraftSchedules,
        setDraftSchedules,
        setTab,
    ]);

    // Plan semanal con cambios sin guardar respecto al servidor (diff bulk).
    // Refleja exactamente lo que persistDraftSchedules enviaría: si un paralelo
    // no es editable solo cuentan reubicaciones (op 'update').
    const planSemanalDirty = useMemo(() => {
        const { items } = buildBulkAsignacionHorarioItems(
            serverSchedules,
            draftSchedules,
            horarioSlotIndex,
        );
        const relevantes = horarioEditable
            ? items
            : items.filter((it) => String(it.op).toLowerCase() === 'update');
        return relevantes.length > 0;
    }, [serverSchedules, draftSchedules, horarioSlotIndex, horarioEditable]);

    // Armado sin pendientes: cobertura completa, sin conflictos y sin materias
    // faltantes. Habilita publicar el paralelo desde el armado (último paso del
    // flujo) aunque la oferta nunca se haya marcado: se oferta y publica de una.
    const armadoCompleto =
        Boolean(coberturaGrilla?.completa) &&
        (conflictosGrilla?.length ?? 0) === 0 &&
        (missingSubjects?.length ?? 0) === 0;
    const puedePublicarDesdeArmado =
        armadoCompleto &&
        !planSemanalDirty &&
        paraleloGestionEstado !== 'PUBLICADO' &&
        paraleloGestionEstado !== 'CERRADO';

    const publicarParalelo = useCallback(async () => {
        const pgId = Number(paraleloGestionId);
        if (!Number.isFinite(pgId) || pgId < 1) return { ok: false };
        if (planSemanalDirty) {
            notification.warning({
                title: 'Guarde los cambios',
                description: 'Guarde el plan semanal antes de publicar el paralelo.',
            });
            return { ok: false };
        }

        setPublicandoParalelo(true);
        try {
            // Si sigue en BORRADOR, primero se oferta (valida aula + oferta completa).
            if (paraleloGestionEstado === 'BORRADOR') {
                const ofertaRes = await updateParaleloGestionEstado(pgId, 'OFERTADO');
                if (!ofertaRes.success) {
                    notification.error({
                        title: 'No se pudo ofertar el paralelo',
                        description:
                            ofertaRes.error ||
                            'Verifique que tenga aula asignada y la oferta de cursos completa.',
                    });
                    return { ok: false };
                }
            }

            const pubRes = await publicarParaleloApi(pgId);
            if (!pubRes.success) {
                const fallas = pubRes.details?.fallas ?? pubRes.details ?? [];
                const detalle =
                    Array.isArray(fallas) && fallas.length
                        ? fallas.map((f) => f?.mensaje || f).filter(Boolean).join(' ')
                        : pubRes.error;
                notification.error({
                    title: 'No se pudo publicar',
                    description:
                        detalle ||
                        'Revise cobertura, conflictos y docentes antes de publicar el paralelo.',
                });
                return { ok: false };
            }

            notification.success({
                title: 'Paralelo publicado',
                description: 'El horario quedó ofertado y publicado.',
            });
            await fetchGrillaHorario(pgId);
            return { ok: true };
        } finally {
            setPublicandoParalelo(false);
        }
    }, [
        paraleloGestionId,
        planSemanalDirty,
        paraleloGestionEstado,
        updateParaleloGestionEstado,
        publicarParaleloApi,
        fetchGrillaHorario,
        notification,
    ]);

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
        planSemanalEditable,
        planSemanalDirty,
        coberturaReajustable,
        generarBloquesCurso,
        reajustarBloquesCurso,
        reajustarCoberturaParalelo,
        puedePublicarDesdeArmado,
        publicandoParalelo,
        publicarParalelo,
    };
};
