/**
 * Hook de pantalla: registrar/editar ficha de seguimiento en clase (DOC ·
 * docentes.supervision.ficha·CREAR/EDITAR).
 *
 * Réplica campo a campo del formulario físico «FICHA DE SEGUIMIENTO EN LA
 * CLASE PRESENCIAL»: curso observado + fecha, 4 SI/NO de documentación, 2
 * cantidades y 9 secciones de observación libre. Página "dumb": la
 * orquestación (precarga, submit S3/S4) vive aquí; el JSX declarativo se
 * renderiza en `FichaSeguimientoFormSections` (`CfgFormWorkspace`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useFichaSeguimientoFormContext } from '@application-docentes/supervision/hooks/context/useFichaSeguimientoFormContext';
import {
  mapFormValuesToFichaPayload,
  mapFichaToFormValues,
} from '@application-docentes/supervision/mappers/fichaSeguimientoMapper';
import {
  SUPERVISION_LIST_PATH,
  DOC_SUPERVISION_MENU_KEY,
  fichaSeguimientoDetallePath,
} from '@application-docentes/supervision/config/paths';

const SI_NO_SWITCH = { checkedChildren: 'Sí', unCheckedChildren: 'No' };

/** Secciones declarativas del formulario (CfgFormWorkspace). */
const createFichaFormSections = ({
  isEditMode,
  asignacionOptions,
  loadingAsignaciones,
  asignacionesDisponible,
}) => ({
  datosObservacion: {
    title: isEditMode ? 'Editar ficha de seguimiento' : 'Registrar ficha de seguimiento',
    description:
      'Ficha de seguimiento en la clase presencial: curso observado y fecha de la visita.',
    fields: [
      {
        name: 'asignacionDocenteId',
        label: 'Curso observado (materia · paralelo — docente)',
        type: 'select',
        required: true,
        span: 24,
        options: asignacionOptions,
        loading: loadingAsignaciones,
        disabled: !asignacionesDisponible,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: asignacionesDisponible
          ? 'Seleccione el curso observado'
          : 'Catálogo de cursos no disponible para su rol',
      },
      {
        name: 'fechaSeguimiento',
        label: 'Fecha de seguimiento',
        type: 'date',
        required: true,
        span: 12,
      },
    ],
  },
  documentacion: {
    title: 'Documentación (lista de asistencia)',
    description: 'Indique SI/NO si el docente presenta cada documento al momento de la visita.',
    fields: [
      {
        name: 'tieneCronogramaBimestral',
        label: 'Cronograma bimestral de asignatura',
        type: 'switch',
        span: 12,
        ...SI_NO_SWITCH,
      },
      {
        name: 'tienePlanBimestral',
        label: 'Plan bimestral',
        type: 'switch',
        span: 12,
        ...SI_NO_SWITCH,
      },
      {
        name: 'tieneRegistroAsistencia',
        label: 'Registro de asistencia',
        type: 'switch',
        span: 12,
        ...SI_NO_SWITCH,
      },
      {
        name: 'tieneRegistroPedagogico',
        label: 'Registro pedagógico y el consolidado',
        type: 'switch',
        span: 12,
        ...SI_NO_SWITCH,
      },
      {
        name: 'obsDocumentacion',
        label: 'Observaciones de documentación (opcional)',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Registre lo observado sobre la documentación',
      },
    ],
  },
  cantidadEstudiantes: {
    title: 'Cantidad de estudiantes',
    fields: [
      {
        name: 'estudiantesEnPlanilla',
        label: 'Estudiantes en planilla',
        type: 'number',
        span: 12,
        min: 0,
      },
      {
        name: 'estudiantesAsistentes',
        label: 'Estudiantes asistentes',
        type: 'number',
        span: 12,
        min: 0,
      },
    ],
  },
  estructuraClase: {
    title: 'Estructura mínima de la clase — observaciones',
    description: 'Registre todo lo observado en cada sección.',
    fields: [
      {
        name: 'obsAvanceAsignatura',
        label: 'Avance de la asignatura',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Avance según cronograma, plan bimestral y temática actual',
      },
      {
        name: 'obsPresentacionTema',
        label: 'Presentación del tema o continuidad de avance',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Título, competencia e indicadores; retroalimentación si es continuación',
      },
      {
        name: 'obsRecursos',
        label: 'Recursos que utiliza',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Power Point, PDF, Excel, Word, tablet gráfica u otro',
      },
      {
        name: 'obsExposicion',
        label: 'Exposición del docente',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Claridad, resúmenes, cuadros sinópticos, mapas, diagramas, casos, ejercicios',
      },
      {
        name: 'obsParticipacion',
        label: 'Participación de estudiantes',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Participación activa en la clase',
      },
      {
        name: 'obsActividadesPracticas',
        label: 'Actividades prácticas',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Espacio de preguntas y promoción de la participación',
      },
      {
        name: 'obsActividadesEvaluacion',
        label: 'Actividades de evaluación',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Evaluación de proceso o de resultado',
      },
    ],
  },
  otrasObservaciones: {
    title: 'Otras observaciones',
    fields: [
      {
        name: 'otrasObservaciones',
        label: 'Otras observaciones',
        type: 'textarea',
        span: 24,
        rows: 4,
        maxLength: 5000,
      },
    ],
  },
});

export const useFichaSeguimientoFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const {
    fichaId,
    ficha,
    loadingFicha,
    errorFicha,
    saving,
    guardarFicha,
    asignacionOptions,
    loadingAsignaciones,
    asignacionesDisponible,
  } = useFichaSeguimientoFormContext();

  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar ficha de seguimiento' : 'Registrar ficha de seguimiento';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && fichaId == null;

  const returnListPath = location.state?.returnListPath || SUPERVISION_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? DOC_SUPERVISION_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes' },
      { title: 'Supervisión docente', href: returnListPath },
      { title: pageTitle },
    ],
    [returnListPath, pageTitle],
  );

  // Precarga: alta → defaults (fecha de hoy); edición → ficha (S2).
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapFichaToFormValues(null));
      return;
    }
    if (isInvalidEditId || loadingFicha || !ficha) return;
    form.setFieldsValue(mapFichaToFormValues(ficha));
  }, [isEditMode, isInvalidEditId, loadingFicha, ficha, form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToFichaPayload(values);
      const resultado = await guardarFicha({ id: isEditMode ? fichaId : null, payload });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar la ficha de seguimiento');
      }
      notification.success({
        title: isEditMode ? 'Ficha actualizada' : 'Ficha registrada',
      });
      const raw = resultado.data?.fichaSeguimiento ?? resultado.data;
      const savedId = raw?.id ?? fichaId;
      if (savedId) {
        navigate(fichaSeguimientoDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar la ficha de seguimiento';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [
    form,
    isEditMode,
    fichaId,
    guardarFicha,
    notification,
    navigate,
    returnListPath,
    menuSidebarKey,
    handleVolver,
  ]);

  const formSections = useMemo(
    () =>
      createFichaFormSections({
        isEditMode,
        asignacionOptions,
        loadingAsignaciones,
        asignacionesDisponible,
      }),
    [isEditMode, asignacionOptions, loadingAsignaciones, asignacionesDisponible],
  );

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: isEditMode ? loadingFicha : false,
    submitLoading: saving,
    error: error || (isEditMode ? errorFicha : null),
    formSections,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
