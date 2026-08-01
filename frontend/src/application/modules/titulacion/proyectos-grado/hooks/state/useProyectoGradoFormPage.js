/**
 * Hook de pantalla: alta/edición de un proyecto de grado (TIT · CREAR/EDITAR).
 *
 * Gemelo de `useCursoCapacitacionFormPage` (CAP): secciones declarativas para
 * `CfgFormWorkspace`, precarga en modo edición (titular + integrantes),
 * submit con el payload del contrato (T7/T8) y navegación a la ficha.
 *
 * La modalidad gobierna la grupalidad: solo PSP (esModalidadGrupal) muestra
 * el multi-select de integrantes adicionales. El titular y los integrantes se
 * eligen de entre los estudiantes de 3er año ELEGIBLES para la carrera
 * seleccionada (Requisito 1, extensión 2026-07-31, `GET
 * /estudiantes-elegibles`) — ya no de un buscador genérico.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useProyectoGradoFormContext } from '@application-titulacion/proyectos-grado/hooks/context/useProyectoGradoFormContext';
import { useEstudiantesElegiblesModalidadApi } from '@application-titulacion/proyectos-grado/hooks/api/useEstudiantesElegiblesModalidadApi';
import { esModalidadGrupal } from '@application-titulacion/utils/titulacionPills';
import {
  mapFormValuesToProyectoPayload,
  mapProyectoToFormValues,
} from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';
import {
  PROYECTOS_GRADO_LIST_PATH,
  TIT_PROYECTOS_MENU_KEY,
  proyectoGradoDetallePath,
} from '@application-titulacion/config/paths';

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
    asignarTutor,
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

  // La modalidad elegida decide si se muestran integrantes múltiples (PSP).
  const modalidadId = Form.useWatch('modalidadId', form);
  const modalidadSeleccionada = modalidadId != null ? modalidadById[modalidadId] : null;
  const modalidadGrupal = esModalidadGrupal(modalidadSeleccionada?.codigo);

  // Estudiantes elegibles (3er año, sin proyecto vigente) de la carrera elegida.
  const carreraId = Form.useWatch('carreraId', form);
  const elegibles = useEstudiantesElegiblesModalidadApi({ carreraId });

  const pageTitle = isEditMode ? 'Editar proyecto de grado' : 'Nuevo proyecto de grado';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && proyectoId == null;

  const returnListPath = location.state?.returnListPath || PROYECTOS_GRADO_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TIT_PROYECTOS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Proyectos de grado', href: returnListPath },
      { title: pageTitle },
    ],
    [returnListPath, pageTitle],
  );

  /**
   * Opciones del select de estudiantes: catálogo de elegibles de la carrera +
   * los ya elegidos en edición (para que el Select muestre su etiqueta aunque
   * ya no figuren como elegibles, por tener este mismo proyecto vigente).
   */
  const estudianteOptions = useMemo(() => {
    const porId = new Map();
    for (const e of elegibles.estudiantes) {
      porId.set(e.estudianteId, {
        value: e.estudianteId,
        label: e.ci ? `${e.nombreCompleto} · CI ${e.ci}` : e.nombreCompleto,
      });
    }
    for (const i of proyecto?.integrantes ?? []) {
      if (i.estudianteId != null && !porId.has(i.estudianteId)) {
        porId.set(i.estudianteId, { value: i.estudianteId, label: i.nombreCompleto });
      }
    }
    return Array.from(porId.values());
  }, [elegibles.estudiantes, proyecto?.integrantes]);

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
        // Modalidad individual: el contrato T7 recibe solo al titular.
        payload.estudianteIds = [payload.titularEstudianteId];
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
      if (!isEditMode && savedId && payload.tutorId) {
        const tutorResult = await asignarTutor(savedId, payload.tutorId);
        if (!tutorResult?.success) {
          notification.warning({
            title: 'Proyecto registrado; revise la designación del tutor',
            description:
              tutorResult?.error ||
              'El proyecto fue creado, pero no se pudo completar la designación oficial.',
          });
        }
      }
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
    asignarTutor,
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
    buscandoEstudiantes: elegibles.loading,
    carreraSeleccionada: carreraId != null,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
