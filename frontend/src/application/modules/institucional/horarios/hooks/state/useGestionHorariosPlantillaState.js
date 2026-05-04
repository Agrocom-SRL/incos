import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useParaleloCursosOfertaApi } from '@application-academico/paralelos/hooks';
import { getUseCase } from '@container';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import { buildCarreraImageUrl } from '@application-institucional/horarios/utils/buildCarreraImageUrl';
import { useHorariosOfertaPermisos } from '../useHorariosOfertaPermisos';

export const useGestionHorariosPlantillaState = () => {
    const { canCrear, canEditar, canEliminar } = useHorariosOfertaPermisos();
    const navigate = useNavigate();
    const location = useLocation();
    const { paraleloId: paraleloIdParam } = useParams();
    const [searchParams] = useSearchParams();
    const queryParalelo = searchParams.get('paralelo');
    const turnoParam = searchParams.get('turno') || '';

    const paraleloIdResolved = paraleloIdParam || queryParalelo;
    const numericParaleloId = paraleloIdResolved ? Number(paraleloIdResolved) : null;
    const validParaleloId = numericParaleloId != null && !Number.isNaN(numericParaleloId) ? numericParaleloId : null;

    const { oferta, loading, error, fetch } = useParaleloCursosOfertaApi();

    const [cursoModal, setCursoModal] = useState({
        open: false,
        isEdit: false,
        cursoEdit: null,
        prefillAsignaturaPlanId: undefined,
    });

    useEffect(() => {
        if (location.pathname.endsWith('/horarios/plantilla') && queryParalelo) {
            const next = new URLSearchParams(searchParams);
            next.delete('paralelo');
            const suffix = next.toString();
            navigate(`/institucional/horarios/paralelo/${queryParalelo}/gestion${suffix ? `?${suffix}` : ''}`, {
                replace: true,
            });
        }
    }, [location.pathname, queryParalelo, navigate, searchParams]);

    useEffect(() => {
        if (validParaleloId) {
            fetch(validParaleloId);
        }
    }, [validParaleloId, fetch]);

    const meta = oferta?.paralelo || null;
    const cursos = useMemo(() => (Array.isArray(oferta?.cursos) ? oferta.cursos : []), [oferta]);
    const missingSubjects = useMemo(
        () => (Array.isArray(oferta?.missingSubjects) ? oferta.missingSubjects : []),
        [oferta],
    );

    const turnoEfectivo = (turnoParam || meta?.turno || '').trim();

    const filasOferta = useMemo(() => {
        const sinCurso = missingSubjects.map((m) => ({
            _rowKey: `sin-curso-${m.asignaturaPlanId ?? m.materiaId}`,
            rowKind: 'sin_curso',
            asignaturaPlanId: m.asignaturaPlanId,
            materiaId: m.materiaId,
            materiaNombre: m.materiaNombre,
            materiaSigla: m.materiaSigla,
            horasSemanalesPlan: m.horasSemanalesPlan,
        }));
        const conCurso = cursos.map((c) => ({
            _rowKey: `curso-${c.cursoId}`,
            rowKind: 'curso',
            ...c,
        }));
        return [...sinCurso, ...conCurso];
    }, [missingSubjects, cursos]);

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Oferta de cursos' },
        ],
        [],
    );

    const pageTitle = useMemo(() => {
        if (!validParaleloId) return 'Gestión del paralelo — oferta de cursos';
        const nombre = meta?.nombre;
        const base = nombre
            ? `Oferta de cursos — ${nombre}`
            : `Oferta de cursos — Paralelo #${validParaleloId}`;
        return turnoEfectivo ? `${base} · Turno ${turnoEfectivo}` : base;
    }, [validParaleloId, meta?.nombre, turnoEfectivo]);

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    const openCursoModalCrear = useCallback((prefillAsignaturaPlanId) => {
        if (!validParaleloId || !canCrear) return;
        setCursoModal({
            open: true,
            isEdit: false,
            cursoEdit: null,
            prefillAsignaturaPlanId:
                prefillAsignaturaPlanId != null && prefillAsignaturaPlanId !== ''
                    ? Number(prefillAsignaturaPlanId)
                    : undefined,
        });
    }, [validParaleloId, canCrear]);

    const openCursoModalEditar = useCallback(
        (record) => {
            if (!validParaleloId || !record?.cursoId || !canEditar) return;
            setCursoModal({
                open: true,
                isEdit: true,
                cursoEdit: record,
                prefillAsignaturaPlanId: undefined,
            });
        },
        [validParaleloId, canEditar],
    );

    const closeCursoModal = useCallback(() => {
        setCursoModal((s) => ({ ...s, open: false }));
    }, []);

    const onNuevoCurso = useCallback(() => {
        openCursoModalCrear(undefined);
    }, [openCursoModalCrear]);

    const onEditarCurso = useCallback(
        (record) => {
            openCursoModalEditar(record);
        },
        [openCursoModalEditar],
    );

    const onCrearCursoDesdeMateria = useCallback(
        (row) => {
            if (!canCrear || row?.asignaturaPlanId == null) return;
            openCursoModalCrear(row.asignaturaPlanId);
        },
        [openCursoModalCrear, canCrear],
    );

    const refetchOferta = useCallback(() => {
        if (validParaleloId != null) fetch(validParaleloId);
    }, [validParaleloId, fetch]);

    const deleteFn = useCallback(
        async (cursoId) => {
            if (validParaleloId == null) {
                return { success: false, error: 'Paralelo no válido' };
            }
            const uc = getUseCase('eliminarCursoOferta');
            if (!uc) {
                return { success: false, error: 'No se pudo inicializar la operación' };
            }
            return uc.ejecutar(cursoId, validParaleloId);
        },
        [validParaleloId],
    );

    const { deleteItem, loading: deleteCursoLoading } = useDeleteItem({
        deleteFn,
        itemName: 'el curso',
        onSuccess: refetchOferta,
    });

    const requestDeleteCurso = useCallback(
        (record) => {
            if (!canEliminar || !validParaleloId || !record?.cursoId) return;
            const displayName =
                record.codigo ||
                [record.materiaSigla, record.materiaNombre].filter(Boolean).join(' — ') ||
                `curso #${record.cursoId}`;
            const itemDetails = [
                { label: 'Código', value: record.codigo || '—' },
                { label: 'Materia', value: record.materiaNombre || '—' },
                {
                    label: 'Paralelo',
                    value: meta?.nombre ? `${meta.nombre} (#${validParaleloId})` : `#${validParaleloId}`,
                },
                {
                    label: 'Importante',
                    value: 'Si el curso ya tiene bloques en el armado semanal, el servidor puede rechazar la baja.',
                },
            ];
            deleteItem(record.cursoId, displayName, itemDetails);
        },
        [validParaleloId, meta, deleteItem, canEliminar],
    );

    const handleCrearCursoOferta = useCallback(
        async (formValues) => {
            if (!validParaleloId) {
                return { success: false, error: 'Paralelo no válido' };
            }
            const uc = getUseCase('crearParaleloCursoOferta');
            if (!uc) {
                return { success: false, error: 'No se pudo inicializar la operación' };
            }
            return uc.ejecutar(validParaleloId, {
                asignaturaPlanId: formValues.asignaturaPlanId,
                cupoMinimo: formValues.cupoMinimo,
                cupoMaximo: formValues.cupoMaximo,
                colorHex: formValues.colorHex,
            });
        },
        [validParaleloId],
    );

    const handleActualizarCursoOferta = useCallback(async (courseId, payload) => {
        const uc = getUseCase('actualizarCursoOferta');
        if (!uc) {
            return { success: false, error: 'No se pudo inicializar la operación' };
        }
        return uc.ejecutar(courseId, payload);
    }, []);

    return {
        validParaleloId,
        canCrear,
        canEditar,
        canEliminar,
        meta,
        missingSubjects,
        turnoEfectivo,
        filasOferta,
        breadcrumbItems,
        pageTitle,
        loading,
        error,
        refetchOferta,
        buildCarreraImageUrl,
        handleVolver,
        cursoModal,
        closeCursoModal,
        onNuevoCurso,
        onEditarCurso,
        onCrearCursoDesdeMateria,
        requestDeleteCurso,
        deleteCursoLoading,
        handleCrearCursoOferta,
        handleActualizarCursoOferta,
    };
};
