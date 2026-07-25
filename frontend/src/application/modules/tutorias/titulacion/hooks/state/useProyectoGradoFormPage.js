/**
 * Hook de pantalla: alta/edición de un proyecto de grado (TUT · CREAR/EDITAR).
 *
 * Gemelo de `useCursoCapacitacionFormPage` (CAP): secciones declarativas para
 * `CfgFormWorkspace`, precarga en modo edición (titular + integrantes),
 * submit con el payload del contrato (T7/T8) y navegación a la ficha.
 *
 * La modalidad gobierna la grupalidad: solo PSP (esModalidadGrupal) muestra
 * el multi-select de integrantes adicionales. El titular y los integrantes se
 * eligen con búsqueda de estudiantes debounced (catálogo reutilizado).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useProyectoGradoFormContext } from '@application-tutorias/titulacion/hooks/context/useProyectoGradoFormContext';
import { useBuscarEstudiantesTut } from '@application-tutorias/titulacion/hooks/api/useBuscarEstudiantesTut';
import { esModalidadGrupal } from '@application-tutorias/utils/tutoriasPills';
import {
  mapFormValuesToProyectoPayload,
  mapProyectoToFormValues,
} from '@application-tutorias/titulacion/mappers/proyectoGradoMapper';
import {
  PROYECTOS_GRADO_LIST_PATH,
  TUT_TITULACION_MENU_KEY,
  proyectoGradoDetallePath,
} from '@application-tutorias/config/paths';

/** Secciones declarativas del formulario (CfgFormWorkspace). */
const createProyectoFormSections = ({
  modalidadOptions,
  loadingModalidades,
  carreras,
  carrerasDisponible,
  loadingCarreras,
  docentes,
  docentesDisponible,
  loadingDocentes,
}) => ({
  datosProyecto: {
    title: 'Datos del proyecto',
    description:
      'Identificación del proyecto de grado: título, modalidad, carrera y tutor. ' +
      'La modalidad PSP (Proyecto Socio-comunitario Productivo) admite un grupo de integrantes.',
    fields: [
      {
        name: 'titulo',
        label: 'Título del proyecto',
        type: 'input',
        required: true,
        span: 24,
        placeholder: 'Ej. Sistema de gestión de inventarios para la empresa X',
        maxLength: 500,
      },
      {
        name: 'modalidadId',
        label: 'Modalidad de grado',
        type: 'select',
        required: true,
        span: 12,
        options: modalidadOptions,
        loading: loadingModalidades,
        placeholder: 'Seleccione la modalidad',
      },
      {
        name: 'carreraId',
        label: 'Carrera',
        type: 'select',
        required: true,
        span: 12,
        options: carreras,
        loading: loadingCarreras,
        disabled: !carrerasDisponible,
        placeholder: carrerasDisponible
          ? 'Seleccione la carrera'
          : 'Catálogo de carreras no disponible para su rol',
      },
      {
        name: 'tutorId',
        label: 'Tutor (opcional — puede designarse después)',
        type: 'select',
        span: 12,
        options: docentes,
        allowClear: true,
        loading: loadingDocentes,
        disabled: !docentesDisponible,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: docentesDisponible
          ? 'Seleccione un docente'
          : 'Catálogo de docentes no disponible para su rol',
      },
      {
        name: 'descripcion',
        label: 'Descripción (opcional)',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Resumen del proyecto',
      },
      {
        name: 'objetivos',
        label: 'Objetivos (opcional)',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Objetivo general y objetivos específicos',
      },
    ],
  },
});

export const useProyectoGradoFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const {
    proyectoId,
    proyecto,
    loadingProyecto,
    errorProyecto,
    saving,
    guardarProyecto,
    modalidadOptions,
    modalidadById,
    loadingModalidades,
    carreras,
    loadingCarreras,
    carrerasDisponible,
    docentes,
    loadingDocentes,
    docentesDisponible,
  } = useProyectoGradoFormContext();

  const [error, setError] = useState(null);
  const busquedaEstudiantes = useBuscarEstudiantesTut();

  // La modalidad elegida decide si se muestran integrantes múltiples (PSP).
  const modalidadId = Form.useWatch('modalidadId', form);
  const modalidadSeleccionada = modalidadId != null ? modalidadById[modalidadId] : null;
  const modalidadGrupal = esModalidadGrupal(modalidadSeleccionada?.codigo);

  const pageTitle = isEditMode ? 'Editar proyecto de grado' : 'Nuevo proyecto de grado';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && proyectoId == null;

  const returnListPath = location.state?.returnListPath || PROYECTOS_GRADO_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TUT_TITULACION_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Tutorías' },
      { title: 'Proyectos de grado', href: returnListPath },
      { title: pageTitle },
    ],
    [returnListPath, pageTitle],
  );

  /**
   * Opciones del select de estudiantes: resultados de la búsqueda + los ya
   * elegidos en edición (para que el Select muestre su etiqueta).
   */
  const estudianteOptions = useMemo(() => {
    const porId = new Map();
    for (const e of busquedaEstudiantes.estudiantes) {
      porId.set(e.id, { value: e.id, label: e.ci ? `${e.nombreCompleto} · CI ${e.ci}` : e.nombreCompleto });
    }
    for (const i of proyecto?.integrantes ?? []) {
      if (i.estudianteId != null && !porId.has(i.estudianteId)) {
        porId.set(i.estudianteId, { value: i.estudianteId, label: i.nombreCompleto });
      }
    }
    return Array.from(porId.values());
  }, [busquedaEstudiantes.estudiantes, proyecto?.integrantes]);

  // Precarga: alta → defaults; edición → ficha (titular + integrantes).
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapProyectoToFormValues(null));
      return;
    }
    if (isInvalidEditId || loadingProyecto || !proyecto) return;
    form.setFieldsValue(mapProyectoToFormValues(proyecto));
  }, [isEditMode, isInvalidEditId, loadingProyecto, proyecto, form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToProyectoPayload(values);
      if (!modalidadGrupal) {
        // Modalidad individual: nunca enviar integrantes adicionales.
        payload.integranteIds = [];
      }
      const resultado = await guardarProyecto({ id: isEditMode ? proyectoId : null, payload });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar el proyecto de grado');
      }
      notification.success({
        title: isEditMode ? 'Proyecto actualizado' : 'Proyecto registrado',
        description: payload.titulo,
      });
      const raw = resultado.data?.proyectoGrado ?? resultado.data;
      const savedId = raw?.id ?? proyectoId;
      if (savedId) {
        navigate(proyectoGradoDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el proyecto de grado';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [
    form,
    modalidadGrupal,
    isEditMode,
    proyectoId,
    guardarProyecto,
    notification,
    navigate,
    returnListPath,
    menuSidebarKey,
    handleVolver,
  ]);

  const formSections = useMemo(
    () =>
      createProyectoFormSections({
        modalidadOptions,
        loadingModalidades,
        carreras,
        carrerasDisponible,
        loadingCarreras,
        docentes,
        docentesDisponible,
        loadingDocentes,
      }),
    [
      modalidadOptions,
      loadingModalidades,
      carreras,
      carrerasDisponible,
      loadingCarreras,
      docentes,
      docentesDisponible,
      loadingDocentes,
    ],
  );

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: isEditMode ? loadingProyecto : false,
    submitLoading: saving,
    error: error || (isEditMode ? errorProyecto : null),
    formSections,
    modalidadGrupal,
    estudianteOptions,
    buscandoEstudiantes: busquedaEstudiantes.loading,
    onBuscarEstudiantes: busquedaEstudiantes.buscar,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
