import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App } from 'antd';
import apiClient from '@api-client';
import { HORARIOS_DOCENTE_ENDPOINTS, PARALELOS_GESTION_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { useGestionesCatalogApi } from '@application/modules/shared/hooks';
import { useHorariosPendientesSidebarApi } from '../api/useHorariosPendientesSidebarApi';
import { useBulkAsignacionHorariosApi } from '../api/useBulkAsignacionHorariosApi';
import { useValidarConflictoHorarioApi } from '../api/useValidarConflictoHorarioApi';
import { mapDocenteGrillaConflictosFromApi } from '@application-institucional/horarios/mappers/docenteGrillaConflictosMapper';
import {
    buildHorarioSlotIndexFromFranjas,
    buildHorarioSlotIndexFromGrilla,
    resolveHorarioIdForBloque,
} from '@application-institucional/horarios/utils/buildHorarioSlotIndex';
import { buildBulkAsignacionHorarioItems } from '@application-institucional/horarios/utils/buildBulkAsignacionHorarioItems';
import {
    grillaHorarioToCourseSchedules,
    extractGrillaHorarioMeta,
} from '@application-institucional/horarios/mappers/grillaHorarioMapper';
import {
    appendBlockToCourse,
    findBlockAtSlot,
    findCourseAndBlock,
    moveBlockToSlot,
    swapOrMoveBlockToSlot,
} from '@application-institucional/horarios/utils/planSemanalBlockOps';
import {
    HORARIOS_CONFLICTOS_PATH,
    HORARIOS_GESTION_PATH,
    buildHorariosConflictosUrl,
} from '@application-institucional/horarios/config/paths';

const VISTA_DOCENTE = 'docente';

function parseVistaModo(vistaParam) {
    if (vistaParam == null || vistaParam === '' || vistaParam === VISTA_DOCENTE) {
        return VISTA_DOCENTE;
    }
    const m = String(vistaParam).match(/^pg-(\d+)$/);
    if (m) {
        const pg = Number(m[1]);
        if (Number.isFinite(pg) && pg > 0) return pg;
    }
    return VISTA_DOCENTE;
}

export const useGestionHorariosConflictosState = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { notification } = App.useApp();

    const docenteIdParam = searchParams.get('docenteId');
    const docenteId =
        docenteIdParam != null && Number.isFinite(Number(docenteIdParam)) && Number(docenteIdParam) > 0
            ? Number(docenteIdParam)
            : null;

    const vistaModo = parseVistaModo(searchParams.get('vista'));

    const { gestiones } = useGestionesCatalogApi();
    const gestionVigente = useMemo(() => {
        const list = Array.isArray(gestiones) ? gestiones : [];
        return list.find((g) => g.vigente) ?? list[0] ?? null;
    }, [gestiones]);
    const gestionVigenteId = useMemo(() => {
        const id = gestionVigente?.id != null ? Number(gestionVigente.id) : null;
        return Number.isFinite(id) && id > 0 ? id : null;
    }, [gestionVigente]);

    const { data: pendientesRaw } = useHorariosPendientesSidebarApi();
    const docentesConConflictos = useMemo(
        () => pendientesRaw?.docentesConConflictosOperativos ?? [],
        [pendientesRaw],
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [grillaRaw, setGrillaRaw] = useState(null);
    const [docenteServerSchedules, setDocenteServerSchedules] = useState([]);
    const [docenteDraftSchedules, setDocenteDraftSchedules] = useState([]);
    const [paraleloStates, setParaleloStates] = useState({});
    const paralelosCargadosRef = useRef(new Set());

    const { ejecutarBulk, loading: persistLoading } = useBulkAsignacionHorariosApi();
    const { validar: validarConflicto } = useValidarConflictoHorarioApi();

    const grilla = useMemo(() => mapDocenteGrillaConflictosFromApi(grillaRaw), [grillaRaw]);

    const horarioSlotIndexDocente = useMemo(
        () => buildHorarioSlotIndexFromFranjas(grilla?.franjas ?? []),
        [grilla?.franjas],
    );

    const bloquesEnConflictoSet = useMemo(
        () => new Set(grilla?.bloquesEnConflicto ?? []),
        [grilla?.bloquesEnConflicto],
    );

    const paralelosInvolucrados = useMemo(
        () => grilla?.paralelosInvolucrados ?? [],
        [grilla?.paralelosInvolucrados],
    );

    const turnoEfectivo = useMemo(() => grilla?.turnoEfectivo ?? null, [grilla?.turnoEfectivo]);

    const isParaleloVista = vistaModo !== VISTA_DOCENTE && Number.isFinite(vistaModo);
    const activeParaleloState = isParaleloVista ? paraleloStates[vistaModo] : null;

    const draftSchedules = isParaleloVista
        ? (activeParaleloState?.draftSchedules ?? [])
        : docenteDraftSchedules;

    const setDraftSchedules = useCallback(
        (updater) => {
            if (isParaleloVista) {
                setParaleloStates((prev) => {
                    const cur = prev[vistaModo];
                    if (!cur) return prev;
                    const nextSchedules =
                        typeof updater === 'function' ? updater(cur.draftSchedules) : updater;
                    return {
                        ...prev,
                        [vistaModo]: { ...cur, draftSchedules: nextSchedules },
                    };
                });
                return;
            }
            setDocenteDraftSchedules(updater);
        },
        [isParaleloVista, vistaModo],
    );

    const fetchParaleloGrilla = useCallback(async (paraleloGestionId) => {
        const pgId = Number(paraleloGestionId);
        if (!Number.isFinite(pgId) || pgId < 1) return;

        setParaleloStates((prev) => ({
            ...prev,
            [pgId]: {
                ...(prev[pgId] ?? {}),
                loading: true,
                error: null,
            },
        }));

        try {
            const response = await apiClient.get(PARALELOS_GESTION_ENDPOINTS.GRILLA_HORARIO(pgId));
            const result = handleSuccessResponse(response);
            if (!result.success) {
                setParaleloStates((prev) => ({
                    ...prev,
                    [pgId]: {
                        ...(prev[pgId] ?? {}),
                        loading: false,
                        error: result.error || 'No se pudo cargar la grilla del paralelo',
                    },
                }));
                return;
            }

            const payload = result.data ?? {};
            const meta = extractGrillaHorarioMeta(payload);
            const paraleloMeta = paralelosInvolucrados.find(
                (p) => Number(p.paraleloGestionId) === pgId,
            );
            const schedules = grillaHorarioToCourseSchedules(payload, {
                turno: meta?.turno ?? paraleloMeta?.turno,
                paraleloNombre: paraleloMeta?.paraleloNombre,
            });

            setParaleloStates((prev) => ({
                ...prev,
                [pgId]: {
                    paraleloGestionId: pgId,
                    paraleloNombre: paraleloMeta?.paraleloNombre ?? `Paralelo #${pgId}`,
                    turno: meta?.turno ?? paraleloMeta?.turno ?? null,
                    serverSchedules: schedules,
                    draftSchedules: schedules,
                    horarioSlotIndex: buildHorarioSlotIndexFromGrilla(payload),
                    loading: false,
                    error: null,
                },
            }));
        } catch (err) {
            const fail = handleErrorResponse(err, 'No se pudo cargar la grilla del paralelo');
            setParaleloStates((prev) => ({
                ...prev,
                [pgId]: {
                    ...(prev[pgId] ?? {}),
                    loading: false,
                    error: fail.error,
                },
            }));
        }
    }, [paralelosInvolucrados]);

    const fetchGrilla = useCallback(async () => {
        if (!docenteId || !gestionVigenteId) {
            setGrillaRaw(null);
            setDocenteServerSchedules([]);
            setDocenteDraftSchedules([]);
            setParaleloStates({});
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(
                HORARIOS_DOCENTE_ENDPOINTS.GRILLA_CONFLICTOS(docenteId, gestionVigenteId),
            );
            const result = handleSuccessResponse(response);
            if (!result.success) {
                setError(result.error || 'No se pudo cargar la grilla del docente');
                setGrillaRaw(null);
                return;
            }
            const mapped = mapDocenteGrillaConflictosFromApi(result.data);
            setGrillaRaw(result.data);
            const schedules = mapped?.courseSchedules ?? [];
            setDocenteServerSchedules(schedules);
            setDocenteDraftSchedules(schedules);
            setParaleloStates({});
            paralelosCargadosRef.current = new Set();
        } catch (err) {
            const fail = handleErrorResponse(err, 'No se pudo cargar la grilla del docente');
            setError(fail.error);
            setGrillaRaw(null);
        } finally {
            setLoading(false);
        }
    }, [docenteId, gestionVigenteId]);

    useEffect(() => {
        fetchGrilla();
    }, [fetchGrilla]);

    useEffect(() => {
        if (!paralelosInvolucrados.length) return;
        for (const p of paralelosInvolucrados) {
            const pgId = Number(p.paraleloGestionId);
            if (!Number.isFinite(pgId) || pgId < 1) continue;
            if (paralelosCargadosRef.current.has(pgId)) continue;
            paralelosCargadosRef.current.add(pgId);
            fetchParaleloGrilla(pgId);
        }
    }, [paralelosInvolucrados, fetchParaleloGrilla]);

    useEffect(() => {
        if (!isParaleloVista) return;
        if (paralelosCargadosRef.current.has(vistaModo)) return;
        paralelosCargadosRef.current.add(vistaModo);
        fetchParaleloGrilla(vistaModo);
    }, [isParaleloVista, vistaModo, fetchParaleloGrilla]);

    const setVistaModo = useCallback(
        (modo) => {
            const next = new URLSearchParams(searchParams);
            if (modo === VISTA_DOCENTE || modo == null) {
                next.delete('vista');
            } else {
                const pg = Number(modo);
                if (Number.isFinite(pg) && pg > 0) next.set('vista', `pg-${pg}`);
            }
            setSearchParams(next, { replace: true });
        },
        [searchParams, setSearchParams],
    );

    const setDocenteId = useCallback(
        (id) => {
            const n = Number(id);
            if (!Number.isFinite(n) || n < 1) {
                setSearchParams({}, { replace: true });
                return;
            }
            navigate(buildHorariosConflictosUrl(n, { vista: VISTA_DOCENTE }), { replace: true });
        },
        [navigate, setSearchParams],
    );

    useEffect(() => {
        if (docenteId != null) return;
        const unico = (docentesConConflictos || []).filter((d) => d?.docenteId != null);
        if (unico.length !== 1) return;
        const id = Number(unico[0].docenteId);
        if (!Number.isFinite(id) || id < 1) return;
        navigate(buildHorariosConflictosUrl(id), { replace: true });
    }, [docenteId, docentesConConflictos, navigate]);

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
            const schedules = isParaleloVista
                ? (paraleloStates[vistaModo]?.draftSchedules ?? [])
                : docenteDraftSchedules;
            const horarioSlotIndex = isParaleloVista
                ? (paraleloStates[vistaModo]?.horarioSlotIndex ?? horarioSlotIndexDocente)
                : horarioSlotIndexDocente;

            const { course: occupantCourse, block: occupantBlock } = findBlockAtSlot(
                schedules,
                targetDia,
                targetSlotMinutes,
                cursoHorarioId,
            );
            const esIntercambio =
                occupantBlock &&
                occupantCourse &&
                Number(occupantCourse.cursoId) !== Number(cursoId) &&
                sourceDia &&
                Number.isFinite(Number(sourceSlotMinutes));

            const preview = bloquePreview
                ? appendBlockToCourse(schedules, cursoId, bloquePreview)
                : esIntercambio
                  ? swapOrMoveBlockToSlot(schedules, {
                        cursoId,
                        cursoHorarioId,
                        targetDia,
                        targetSlotMinutes,
                        sourceDia,
                        sourceSlotMinutes,
                    })
                  : moveBlockToSlot(schedules, {
                        cursoId,
                        cursoHorarioId,
                        targetDia,
                        targetSlotMinutes,
                    });

            const { course, block } = findCourseAndBlock(preview, cursoId, cursoHorarioId);
            if (!course || !block) return { ok: true };
            if (esIntercambio) return { ok: true, swap: true };

            const horarioId = resolveHorarioIdForBloque(block, horarioSlotIndex);
            const asignacionDocenteId = Number(
                course.asignacionDocenteId ?? block.asignacionDocenteId,
            );

            if (!Number.isFinite(asignacionDocenteId) || asignacionDocenteId < 1) {
                return {
                    ok: false,
                    message:
                        'Sin asignación docente vigente para esta materia. Revisá la oferta académica del paralelo.',
                };
            }
            if (!horarioId) {
                return {
                    ok: false,
                    message:
                        'Franja horaria no reconocida en el catálogo del turno. Elegí un horario válido de la grilla (filas del turno TARDE/NOCHE).',
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

            const conflictoDocente = res.conflictos?.find((c) => c?.tipo === 'DOCENTE');
            const conflictoParalelo = res.conflictos?.find((c) => c?.tipo === 'PARALELO');
            const conflictoAula = res.conflictos?.find((c) => c?.tipo === 'AULA');

            if (conflictoDocente) {
                return {
                    ok: false,
                    message: `${conflictoDocente.mensaje}. Elegí una celda vacía o intercambiá con otro bloque del docente.`,
                };
            }
            if (conflictoParalelo) {
                return {
                    ok: false,
                    message: `${conflictoParalelo.mensaje} Elegí otra franja libre o intercalá con la materia que ocupa ese horario.`,
                };
            }
            if (conflictoAula) {
                return {
                    ok: false,
                    message: `${conflictoAula.mensaje} Revisá la asignación de aulas o elegí otra franja.`,
                };
            }

            const msg =
                res.conflictos?.map((c) => c.mensaje).filter(Boolean).join(' ') ||
                res.error ||
                'El bloque sigue en conflicto con otra asignación del docente u otra restricción.';
            return { ok: false, message: msg };
        },
        [
            isParaleloVista,
            vistaModo,
            paraleloStates,
            docenteDraftSchedules,
            horarioSlotIndexDocente,
            validarConflicto,
        ],
    );

    const onRequestPersist = useCallback(async () => {
        const serverSchedules = isParaleloVista
            ? (paraleloStates[vistaModo]?.serverSchedules ?? [])
            : docenteServerSchedules;
        const currentDraft = isParaleloVista
            ? (paraleloStates[vistaModo]?.draftSchedules ?? [])
            : docenteDraftSchedules;
        const slotIndex = isParaleloVista
            ? (paraleloStates[vistaModo]?.horarioSlotIndex ?? horarioSlotIndexDocente)
            : horarioSlotIndexDocente;

        const { items, incomplete } = buildBulkAsignacionHorarioItems(
            serverSchedules,
            currentDraft,
            slotIndex,
        );
        if (!items.length) {
            notification.info({ title: 'Sin cambios', description: 'No hay bloques modificados para guardar.' });
            return;
        }
        if (incomplete) {
            notification.warning({
                title: 'Datos incompletos',
                description: 'Algunos bloques no tienen franja válida. Revisá antes de guardar.',
            });
            return;
        }
        const bulkRes = await ejecutarBulk(items);
        if (bulkRes.success) {
            notification.success({
                title: 'Horarios actualizados',
                description: 'Los bloques se guardaron. Recargando grilla…',
            });
            await fetchGrilla();
            paralelosCargadosRef.current = new Set();
            if (isParaleloVista) {
                await fetchParaleloGrilla(vistaModo);
            } else {
                for (const p of paralelosInvolucrados) {
                    await fetchParaleloGrilla(p.paraleloGestionId);
                }
            }
            return;
        }
        notification.error({
            title: 'Error al guardar',
            description: bulkRes.error || 'No se pudieron guardar los cambios.',
        });
    }, [
        isParaleloVista,
        vistaModo,
        paraleloStates,
        docenteServerSchedules,
        docenteDraftSchedules,
        horarioSlotIndexDocente,
        ejecutarBulk,
        notification,
        fetchGrilla,
        fetchParaleloGrilla,
        paralelosInvolucrados,
    ]);

    const handleVolver = useCallback(() => navigate(HORARIOS_GESTION_PATH), [navigate]);

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: HORARIOS_GESTION_PATH },
            { title: 'Resolver conflictos' },
        ],
        [],
    );

    const pageTitle = grilla?.docenteNombre
        ? `Conflictos de horario — ${grilla.docenteNombre}`
        : 'Resolver conflictos de horario';

    const vistaOpciones = useMemo(() => {
        const opts = [
            {
                key: VISTA_DOCENTE,
                label: grilla?.docenteNombre ? `Docente (${grilla.docenteNombre})` : 'Vista docente',
            },
        ];
        for (const p of paralelosInvolucrados) {
            opts.push({
                key: String(p.paraleloGestionId),
                label: `Paralelo ${p.paraleloNombre || p.paraleloGestionId}`,
            });
        }
        return opts;
    }, [grilla?.docenteNombre, paralelosInvolucrados]);

    const vistaActivaKey = isParaleloVista ? String(vistaModo) : VISTA_DOCENTE;
    const vistaActivaLabel = useMemo(() => {
        if (!isParaleloVista) {
            return grilla?.docenteNombre
                ? `Grilla del docente — ${grilla.docenteNombre}`
                : 'Grilla del docente';
        }
        const st = paraleloStates[vistaModo];
        return st?.paraleloNombre
            ? `Grilla del paralelo — ${st.paraleloNombre}`
            : `Grilla del paralelo #${vistaModo}`;
    }, [isParaleloVista, vistaModo, grilla?.docenteNombre, paraleloStates]);

    const turnoVistaActiva = isParaleloVista
        ? (activeParaleloState?.turno ?? turnoEfectivo)
        : turnoEfectivo;

    const vistaLoading = isParaleloVista ? Boolean(activeParaleloState?.loading) : false;
    const vistaError = isParaleloVista ? activeParaleloState?.error : null;

    return {
        docenteId,
        setDocenteId,
        docentesConConflictos,
        gestionVigente,
        loading: loading || vistaLoading,
        error: error || vistaError,
        grilla,
        draftSchedules,
        setDraftSchedules,
        bloquesEnConflictoSet,
        persistLoading,
        onRequestPersist,
        validatePlacement,
        handleVolver,
        breadcrumbItems,
        pageTitle,
        refetch: fetchGrilla,
        vistaModo,
        vistaActivaKey,
        vistaActivaLabel,
        vistaOpciones,
        setVistaModo,
        turnoVistaActiva,
        paralelosInvolucrados,
        isParaleloVista,
    };
};
