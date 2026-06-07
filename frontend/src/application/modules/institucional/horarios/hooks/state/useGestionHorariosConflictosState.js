import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App } from 'antd';
import apiClient from '@api-client';
import { HORARIOS_DOCENTE_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { useGestionesCatalogApi } from '@application/modules/shared/hooks';
import { useHorariosPendientesSidebarApi } from '../api/useHorariosPendientesSidebarApi';
import { useBulkAsignacionHorariosApi } from '../api/useBulkAsignacionHorariosApi';
import { useValidarConflictoHorarioApi } from '../api/useValidarConflictoHorarioApi';
import { mapDocenteGrillaConflictosFromApi } from '@application-institucional/horarios/mappers/docenteGrillaConflictosMapper';
import {
    buildHorarioSlotIndexFromFranjas,
    resolveHorarioIdForBloque,
} from '@application-institucional/horarios/utils/buildHorarioSlotIndex';
import { buildBulkAsignacionHorarioItems } from '@application-institucional/horarios/utils/buildBulkAsignacionHorarioItems';
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
} from '@application-institucional/horarios/config/paths';

export const useGestionHorariosConflictosState = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { notification } = App.useApp();

    const docenteIdParam = searchParams.get('docenteId');
    const docenteId =
        docenteIdParam != null && Number.isFinite(Number(docenteIdParam)) && Number(docenteIdParam) > 0
            ? Number(docenteIdParam)
            : null;

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
    const [serverSchedules, setServerSchedules] = useState([]);
    const [draftSchedules, setDraftSchedules] = useState([]);

    const { ejecutarBulk, loading: persistLoading } = useBulkAsignacionHorariosApi();
    const { validar: validarConflicto } = useValidarConflictoHorarioApi();

    const grilla = useMemo(() => mapDocenteGrillaConflictosFromApi(grillaRaw), [grillaRaw]);

    const horarioSlotIndex = useMemo(
        () => buildHorarioSlotIndexFromFranjas(grilla?.franjas ?? []),
        [grilla?.franjas],
    );

    const bloquesEnConflictoSet = useMemo(
        () => new Set(grilla?.bloquesEnConflicto ?? []),
        [grilla?.bloquesEnConflicto],
    );

    const fetchGrilla = useCallback(async () => {
        if (!docenteId || !gestionVigenteId) {
            setGrillaRaw(null);
            setServerSchedules([]);
            setDraftSchedules([]);
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
            setServerSchedules(schedules);
            setDraftSchedules(schedules);
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

    const setDocenteId = useCallback(
        (id) => {
            const n = Number(id);
            if (!Number.isFinite(n) || n < 1) {
                setSearchParams({}, { replace: true });
                return;
            }
            navigate(
                { pathname: HORARIOS_CONFLICTOS_PATH, search: `?docenteId=${n}` },
                { replace: true },
            );
        },
        [navigate, setSearchParams],
    );

    useEffect(() => {
        if (docenteId != null) return;
        const unico = (docentesConConflictos || []).filter((d) => d?.docenteId != null);
        if (unico.length !== 1) return;
        const id = Number(unico[0].docenteId);
        if (!Number.isFinite(id) || id < 1) return;
        navigate({ pathname: HORARIOS_CONFLICTOS_PATH, search: `?docenteId=${id}` }, { replace: true });
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
            const { course: occupantCourse, block: occupantBlock } = findBlockAtSlot(
                draftSchedules,
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
                ? appendBlockToCourse(draftSchedules, cursoId, bloquePreview)
                : esIntercambio
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
                    message: 'Franja horaria no reconocida en el catálogo. Elegí otro horario del grid.',
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

            const msg =
                res.conflictos?.map((c) => c.mensaje).filter(Boolean).join(' ') ||
                res.error ||
                'El bloque sigue en conflicto con otra asignación del docente u otra restricción.';
            return { ok: false, message: msg };
        },
        [draftSchedules, horarioSlotIndex, validarConflicto],
    );

    const onRequestPersist = useCallback(async () => {
        const { items, incomplete } = buildBulkAsignacionHorarioItems(
            serverSchedules,
            draftSchedules,
            horarioSlotIndex,
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
            return;
        }
        notification.error({
            title: 'Error al guardar',
            description: bulkRes.error || 'No se pudieron guardar los cambios.',
        });
    }, [
        serverSchedules,
        draftSchedules,
        horarioSlotIndex,
        ejecutarBulk,
        notification,
        fetchGrilla,
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

    return {
        docenteId,
        setDocenteId,
        docentesConConflictos,
        gestionVigente,
        loading,
        error,
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
    };
};
