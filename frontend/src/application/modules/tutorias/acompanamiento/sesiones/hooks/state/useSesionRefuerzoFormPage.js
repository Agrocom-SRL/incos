/**
 * Hook de pantalla: programar/editar sesión de refuerzo (TUT ·
 * sesion·CREAR/EDITAR).
 *
 * Gemelo de `useCursoCapacitacionFormPage`: secciones declarativas para
 * `CfgFormWorkspace`, precarga en edición (A7 no toca estudiantes: la
 * asistencia se registra en la ficha, A9), submit con el payload del
 * contrato (A6/A7) y navegación a la ficha.
 *
 * La modalidad gobierna aula/enlace (PRESENCIAL → aula, VIRTUAL → enlace) y
 * el curso elegido filtra los estudiantes preseleccionables desde las
 * alertas de riesgo (docente → A2, resto → A1). Si se llega desde "Mis
 * alumnos en riesgo", el alumno y su curso vienen preseleccionados
 * (location.state.alertaPreseleccionada).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useSesionRefuerzoFormContext } from '@application-tutorias/acompanamiento/sesiones/hooks/context/useSesionRefuerzoFormContext';
import {
  mapFormValuesToSesionPayload,
  mapSesionToFormValues,
} from '@application-tutorias/acompanamiento/sesiones/mappers/sesionRefuerzoMapper';
import {
  SESIONES_LIST_PATH,
  TUT_SESIONES_MENU_KEY,
  sesionDetallePath,
} from '@application-tutorias/config/paths';

const MODALIDAD_OPTIONS = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
];

/** Secciones declarativas del formulario (CfgFormWorkspace). */
const createSesionFormSections = ({
  isEditMode,
  asignacionOptions,
  asignacionesDisponible,
  loadingAsignaciones,
  esVirtual,
  aulas,
  aulasDisponible,
  loadingAulas,
  estudianteOptions,
  loadingAlertas,
  cursoSeleccionado,
}) => ({
  programacion: {
    title: isEditMode ? 'Datos de la sesión' : 'Programar sesión de refuerzo',
    description:
      'Sesión complementaria para estudiantes con riesgo pedagógico. El curso determina ' +
      'la materia reforzada y los alumnos convocables.',
    fields: [
      {
        name: 'asignacionDocenteId',
        label: 'Curso (materia · paralelo — docente)',
        type: 'select',
        required: true,
        span: 12,
        options: asignacionOptions,
        loading: loadingAsignaciones,
        disabled: !asignacionesDisponible || isEditMode,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: asignacionesDisponible
          ? 'Seleccione el curso a reforzar'
          : 'Catálogo de cursos no disponible para su rol',
      },
      {
        name: 'fecha',
        label: 'Fecha de la sesión',
        type: 'date',
        required: true,
        span: 12,
      },
      {
        name: 'tema',
        label: 'Tema a reforzar',
        type: 'input',
        required: true,
        span: 24,
        maxLength: 255,
        placeholder: 'Ej. Repaso de asientos de ajuste',
      },
    ],
  },
  modalidad: {
    title: 'Modalidad y lugar',
    description:
      'Una sesión presencial ocupa un aula física; una virtual requiere el enlace de la reunión.',
    fields: [
      {
        name: 'modalidad',
        label: 'Modalidad',
        type: 'radio',
        required: true,
        span: 12,
        options: MODALIDAD_OPTIONS,
      },
      esVirtual
        ? {
            name: 'enlaceVirtual',
            label: 'Enlace de la sesión virtual',
            type: 'input',
            required: true,
            span: 12,
            maxLength: 500,
            placeholder: 'https://meet…',
          }
        : {
            name: 'aulaId',
            label: 'Aula',
            type: 'select',
            span: 12,
            options: aulas,
            allowClear: true,
            loading: loadingAulas,
            disabled: !aulasDisponible,
            placeholder: aulasDisponible
              ? 'Seleccione un aula (opcional)'
              : 'Catálogo de aulas no disponible para su rol',
          },
      {
        name: 'observaciones',
        label: 'Observaciones (opcional)',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Notas para la sesión',
      },
    ],
  },
  estudiantes: isEditMode
    ? null
    : {
        title: 'Estudiantes convocados',
        description: cursoSeleccionado
          ? 'Alumnos en riesgo del curso seleccionado. Puede quitar o mantener a los convocados; la asistencia se registra después, en la ficha de la sesión.'
          : 'Seleccione primero el curso para ver a sus alumnos en riesgo.',
        fields: [
          {
            name: 'estudiantes',
            label: 'Alumnos en riesgo',
            type: 'select',
            mode: 'multiple',
            span: 24,
            options: estudianteOptions,
            loading: loadingAlertas,
            disabled: !cursoSeleccionado,
            optionFilterProp: 'label',
            placeholder: cursoSeleccionado
              ? 'Seleccione uno o más alumnos'
              : 'Seleccione primero el curso',
          },
        ],
      },
});

export const useSesionRefuerzoFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const {
    sesionId,
    sesion,
    loadingSesion,
    errorSesion,
    saving,
    guardarSesion,
    asignacionOptions,
    asignacionById,
    loadingAsignaciones,
    asignacionesDisponible,
    aulas,
    loadingAulas,
    aulasDisponible,
    alertasCandidatas,
    loadingAlertas,
  } = useSesionRefuerzoFormContext();

  const [error, setError] = useState(null);

  const modalidad = Form.useWatch('modalidad', form);
  const asignacionDocenteId = Form.useWatch('asignacionDocenteId', form);
  const esVirtual = modalidad === 'VIRTUAL';
  const cursoSeleccionado = asignacionDocenteId != null;

  const pageTitle = isEditMode ? 'Editar sesión de refuerzo' : 'Programar sesión de refuerzo';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && sesionId == null;

  const returnListPath = location.state?.returnListPath || SESIONES_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TUT_SESIONES_MENU_KEY;
  const alertaPreseleccionada = location.state?.alertaPreseleccionada ?? null;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Académico' },
      { title: 'Sesiones de refuerzo', href: returnListPath },
      { title: pageTitle },
    ],
    [returnListPath, pageTitle],
  );

  /**
   * Candidatos del curso elegido: coincide por asignación cuando la vista 156
   * la expone; si no, por materia de la asignación (catálogo vista 130).
   */
  const estudianteOptions = useMemo(() => {
    if (!cursoSeleccionado) return [];
    const materiaIdCurso = asignacionById[asignacionDocenteId]?.materiaId ?? null;
    return alertasCandidatas
      .filter((a) =>
        a.asignacionDocenteId != null
          ? a.asignacionDocenteId === asignacionDocenteId
          : materiaIdCurso != null && a.materiaId === materiaIdCurso,
      )
      .filter((a) => a.matriculaMateriaId != null)
      .map((a) => ({
        value: a.matriculaMateriaId,
        label: a.notaUltimoBimestre != null
          ? `${a.estudianteNombre} · Nota ${a.notaUltimoBimestre}`
          : a.estudianteNombre,
      }));
  }, [cursoSeleccionado, asignacionDocenteId, asignacionById, alertasCandidatas]);

  // Precarga: alta → defaults (+ alumno preseleccionado); edición → ficha (A5).
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapSesionToFormValues(null));
      if (alertaPreseleccionada) {
        form.setFieldsValue({
          asignacionDocenteId: alertaPreseleccionada.asignacionDocenteId ?? undefined,
          estudiantes: alertaPreseleccionada.matriculaMateriaId
            ? [alertaPreseleccionada.matriculaMateriaId]
            : [],
        });
      }
      return;
    }
    if (isInvalidEditId || loadingSesion || !sesion) return;
    form.setFieldsValue(mapSesionToFormValues(sesion));
  }, [isEditMode, isInvalidEditId, loadingSesion, sesion, form, alertaPreseleccionada]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToSesionPayload(values, { incluirEstudiantes: !isEditMode });
      if (!payload.horaInicio || !payload.horaFin) {
        setError('Indique la hora de inicio y de fin de la sesión');
        return;
      }
      const resultado = await guardarSesion({ id: isEditMode ? sesionId : null, payload });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar la sesión de refuerzo');
      }
      notification.success({
        title: isEditMode ? 'Sesión actualizada' : 'Sesión programada',
        description: payload.tema || undefined,
      });
      const raw = resultado.data?.sesionRefuerzo ?? resultado.data;
      const savedId = raw?.id ?? sesionId;
      if (savedId) {
        navigate(sesionDetallePath(savedId), {
          replace: !isEditMode,
          state: { returnListPath, menuSidebarKey },
        });
      } else {
        handleVolver();
      }
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar la sesión de refuerzo';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [
    form,
    isEditMode,
    sesionId,
    guardarSesion,
    notification,
    navigate,
    returnListPath,
    menuSidebarKey,
    handleVolver,
  ]);

  const formSections = useMemo(
    () =>
      createSesionFormSections({
        isEditMode,
        asignacionOptions,
        asignacionesDisponible,
        loadingAsignaciones,
        esVirtual,
        aulas,
        aulasDisponible,
        loadingAulas,
        estudianteOptions,
        loadingAlertas,
        cursoSeleccionado,
      }),
    [
      isEditMode,
      asignacionOptions,
      asignacionesDisponible,
      loadingAsignaciones,
      esVirtual,
      aulas,
      aulasDisponible,
      loadingAulas,
      estudianteOptions,
      loadingAlertas,
      cursoSeleccionado,
    ],
  );

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: isEditMode ? loadingSesion : false,
    submitLoading: saving,
    error: error || (isEditMode ? errorSesion : null),
    formSections,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
