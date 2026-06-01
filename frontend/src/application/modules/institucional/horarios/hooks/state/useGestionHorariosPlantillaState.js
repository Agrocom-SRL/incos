import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import { buildCarreraImageUrl } from '@application-institucional/horarios/utils/buildCarreraImageUrl';
import { useHorariosOfertaPermisos } from '../useHorariosOfertaPermisos';
import { useParaleloGestionVigenteResolver } from '../useParaleloGestionVigenteResolver.js';
import {
  buildFilasOfertaPlantilla,
  mapFaltantesToMissingSubjects,
} from '../../mappers/plantillaOfertaMapper.js';

export const useGestionHorariosPlantillaState = () => {
  const { canCrear, canEliminar } = useHorariosOfertaPermisos();
  const navigate = useNavigate();
  const { paraleloId: paraleloIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const queryParalelo = searchParams.get('paralelo');

  const paraleloIdResolved = paraleloIdParam || queryParalelo;
  const numericParaleloId = paraleloIdResolved ? Number(paraleloIdResolved) : null;
  const validParaleloId =
    numericParaleloId != null && !Number.isNaN(numericParaleloId) ? numericParaleloId : null;

  const {
    fetchOfertaCursos,
    validarOferta,
    eliminarOfertaCurso,
    crearOfertaCursoManual,
  } = useOfertaAcademicaApi();
  const resolver = useParaleloGestionVigenteResolver(validParaleloId);

  const [ofertaCursos, setOfertaCursos] = useState([]);
  const [missingSubjects, setMissingSubjects] = useState([]);
  const [loadingOferta, setLoadingOferta] = useState(false);
  const [ofertaLoadError, setOfertaLoadError] = useState(null);

  const [cursoModal, setCursoModal] = useState({
    open: false,
    isEdit: false,
    cursoEdit: null,
    prefillAsignaturaPlanId: undefined,
  });

  const meta = resolver.meta;
  const turnoEfectivo = (meta?.turno || '').trim();
  const resolverError = resolver.error;

  const loadOferta = useCallback(async () => {
    const pgId = resolver.paraleloGestionId;
    if (!pgId) {
      setOfertaCursos([]);
      setMissingSubjects([]);
      return;
    }

    setLoadingOferta(true);
    setOfertaLoadError(null);

    const [ofertaRes, validRes] = await Promise.all([
      fetchOfertaCursos(pgId),
      validarOferta(pgId),
    ]);

    if (!ofertaRes.success) {
      setOfertaLoadError(
        typeof ofertaRes.error === 'string' ? ofertaRes.error : 'No se pudo cargar la oferta del paralelo'
      );
      setOfertaCursos([]);
    } else {
      setOfertaCursos(ofertaRes.data?.ofertaCursos ?? []);
    }

    if (validRes.success) {
      const validacion = validRes.data?.validacion ?? validRes.data ?? {};
      setMissingSubjects(mapFaltantesToMissingSubjects(validacion.faltantes ?? []));
    } else if (ofertaRes.success) {
      setMissingSubjects([]);
    }

    setLoadingOferta(false);
  }, [fetchOfertaCursos, validarOferta, resolver.paraleloGestionId]);

  useEffect(() => {
    if (resolver.paraleloGestionId && !resolver.loading) {
      loadOferta();
    }
  }, [resolver.paraleloGestionId, resolver.loading, loadOferta]);

  const filasOferta = useMemo(
    () => buildFilasOfertaPlantilla(ofertaCursos, missingSubjects),
    [ofertaCursos, missingSubjects]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestión de horarios', href: '/institucional/horarios' },
      { title: 'Oferta de cursos' },
    ],
    []
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

  const openCursoModalCrear = useCallback(
    (prefillAsignaturaPlanId) => {
      if (!resolver.paraleloGestionId || !canCrear) return;
      setCursoModal({
        open: true,
        isEdit: false,
        cursoEdit: null,
        prefillAsignaturaPlanId:
          prefillAsignaturaPlanId != null && prefillAsignaturaPlanId !== ''
            ? Number(prefillAsignaturaPlanId)
            : undefined,
      });
    },
    [resolver.paraleloGestionId, canCrear]
  );

  const closeCursoModal = useCallback(() => {
    setCursoModal((s) => ({ ...s, open: false }));
  }, []);

  const onNuevoCurso = useCallback(() => {
    openCursoModalCrear(undefined);
  }, [openCursoModalCrear]);

  const onCrearCursoDesdeMateria = useCallback(
    (row) => {
      if (!canCrear || row?.asignaturaPlanId == null) return;
      openCursoModalCrear(row.asignaturaPlanId);
    },
    [openCursoModalCrear, canCrear]
  );

  const refetchOferta = useCallback(() => {
    loadOferta();
  }, [loadOferta]);

  const deleteFn = useCallback(
    async (ofertaCursoId) => {
      if (!resolver.paraleloGestionId) {
        return { success: false, error: 'Paralelo en gestión no resuelto' };
      }
      return eliminarOfertaCurso(ofertaCursoId);
    },
    [eliminarOfertaCurso, resolver.paraleloGestionId]
  );

  const { deleteItem, loading: deleteCursoLoading } = useDeleteItem({
    deleteFn,
    itemName: 'el curso de la oferta',
    onSuccess: refetchOferta,
  });

  const requestDeleteCurso = useCallback(
    (record) => {
      const ofertaId = record?.ofertaCursoId ?? record?.cursoId;
      if (!canEliminar || !resolver.paraleloGestionId || !ofertaId) return;
      const displayName =
        record.codigo ||
        [record.materiaSigla, record.materiaNombre].filter(Boolean).join(' — ') ||
        `oferta #${ofertaId}`;
      const itemDetails = [
        { label: 'Código', value: record.codigo || '—' },
        { label: 'Materia', value: record.materiaNombre || '—' },
        {
          label: 'Paralelo',
          value: meta?.nombre ? `${meta.nombre} (#${validParaleloId})` : `#${validParaleloId}`,
        },
        {
          label: 'Importante',
          value:
            'Si el curso tiene docente asignado o bloques en la grilla, el servidor puede rechazar la baja.',
        },
      ];
      deleteItem(ofertaId, displayName, itemDetails);
    },
    [validParaleloId, meta, deleteItem, canEliminar, resolver.paraleloGestionId]
  );

  const handleCrearCursoOferta = useCallback(
    async (formValues) => {
      const pgId = resolver.paraleloGestionId;
      if (!pgId) {
        return { success: false, error: 'Paralelo en gestión no resuelto' };
      }
      if (formValues?.asignaturaPlanId == null) {
        return { success: false, error: 'Seleccione una materia del plan' };
      }
      return crearOfertaCursoManual({
        paralelo_gestion_id: pgId,
        asignatura_plan_id: Number(formValues.asignaturaPlanId),
      });
    },
    [crearOfertaCursoManual, resolver.paraleloGestionId]
  );

  const loading = resolver.loading || loadingOferta;
  const error = resolverError || ofertaLoadError;

  return {
    validParaleloId,
    paraleloGestionId: resolver.paraleloGestionId,
    canCrear,
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
    onCrearCursoDesdeMateria,
    requestDeleteCurso,
    deleteCursoLoading,
    handleCrearCursoOferta,
  };
};
