/**
 * Hook de pantalla: alta/edición de un trámite de pasantía (TUT · CREAR/EDITAR).
 *
 * Gemelo de `useProyectoGradoFormPage` (TUT · Titulación): secciones
 * declarativas para `CfgFormWorkspace`, precarga en modo edición, submit con
 * el payload del contrato (P3/P4) y navegación a la ficha.
 *
 * El CAMINO gobierna los campos (R.M. 487/2023, 300-360 h):
 *  - PASANTIA: práctica nueva en una empresa del catálogo (verificación previa).
 *  - CONVALIDACION: el estudiante ya trabaja — se agrega la sección de
 *    contrato (tipoContrato/tipoContratoDetalle, solo este camino).
 * El estudiante se elige con búsqueda debounced (catálogo reutilizado de TUT).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { usePasantiaFormContext } from '@application-tutorias/pasantias/hooks/context/usePasantiaFormContext';
import { useBuscarEstudiantesTut } from '@application-tutorias/titulacion/hooks/api/useBuscarEstudiantesTut';
import {
  HORAS_PASANTIA_MAX,
  HORAS_PASANTIA_MIN,
  TIPO_CONTRATO_OPTIONS,
  TIPO_PASANTIA_OPTIONS,
} from '@application-tutorias/utils/pasantiasPills';
import {
  mapFormValuesToPasantiaPayload,
  mapPasantiaToFormValues,
} from '@application-tutorias/pasantias/mappers/pasantiaMapper';
import {
  PASANTIAS_LIST_PATH,
  TUT_PASANTIAS_MENU_KEY,
  pasantiaDetallePath,
} from '@application-tutorias/config/paths';

/** Secciones declarativas del formulario (CfgFormWorkspace). */
const createPasantiaFormSections = ({
  esConvalidacion,
  empresaOptions,
  loadingEmpresas,
  carreras,
  carrerasDisponible,
  loadingCarreras,
  docentes,
  docentesDisponible,
  loadingDocentes,
}) => ({
  datosTramite: {
    title: 'Datos del trámite',
    description:
      'La práctica laboral exige entre 300 y 360 horas (R.M. 487/2023). El camino ' +
      'PASANTÍA registra una práctica nueva con verificación previa de la empresa; ' +
      'la CONVALIDACIÓN reconoce la experiencia de un estudiante que ya trabaja.',
    fields: [
      {
        name: 'tipo',
        label: 'Camino de cumplimiento',
        type: 'radio',
        required: true,
        span: 12,
        options: TIPO_PASANTIA_OPTIONS,
      },
      {
        name: 'carreraId',
        label: 'Carrera',
        type: 'select',
        span: 12,
        options: carreras,
        allowClear: true,
        loading: loadingCarreras,
        disabled: !carrerasDisponible,
        placeholder: carrerasDisponible
          ? 'Seleccione la carrera'
          : 'Catálogo de carreras no disponible para su rol',
      },
      {
        name: 'empresaId',
        label: 'Empresa',
        type: 'select',
        span: 12,
        options: empresaOptions,
        allowClear: true,
        loading: loadingEmpresas,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: 'Seleccione la empresa del catálogo',
      },
      {
        name: 'docenteSupervisorId',
        label: 'Docente supervisor (opcional)',
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
        name: 'horasRequeridas',
        label: 'Horas requeridas',
        type: 'number',
        required: true,
        span: 8,
        min: HORAS_PASANTIA_MIN,
        max: HORAS_PASANTIA_MAX,
        placeholder: `${HORAS_PASANTIA_MIN}–${HORAS_PASANTIA_MAX}`,
      },
      {
        name: 'horasCumplidas',
        label: 'Horas cumplidas',
        type: 'number',
        span: 8,
        min: 0,
        placeholder: '0',
      },
      { name: 'fechaInicio', label: 'Fecha de inicio', type: 'date', span: 8 },
      { name: 'fechaFinalizacion', label: 'Fecha de finalización', type: 'date', span: 8 },
    ],
  },
  puesto: {
    title: 'Puesto y funciones',
    description: 'Área, cargo y funciones que desempeña el estudiante en la empresa.',
    fields: [
      {
        name: 'areaDepartamento',
        label: 'Área / departamento',
        type: 'input',
        span: 12,
        maxLength: 150,
        placeholder: 'Ej. Contabilidad',
      },
      {
        name: 'cargoPuesto',
        label: 'Cargo / puesto',
        type: 'input',
        span: 12,
        maxLength: 150,
        placeholder: 'Ej. Auxiliar contable',
      },
      {
        name: 'funciones',
        label: 'Funciones (opcional)',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Funciones principales que desempeña el estudiante',
      },
    ],
  },
  ...(esConvalidacion
    ? {
        contrato: {
          title: 'Contrato de trabajo (convalidación)',
          description:
            'Datos del FORMATO DE CONVALIDACIÓN DE CERTIFICADO DE TRABAJO — solo aplican ' +
            'al camino CONVALIDACIÓN.',
          fields: [
            {
              name: 'tipoContrato',
              label: 'Tipo de contrato',
              type: 'select',
              span: 12,
              options: TIPO_CONTRATO_OPTIONS,
              allowClear: true,
              placeholder: 'Seleccione el tipo de contrato',
            },
            {
              name: 'tipoContratoDetalle',
              label: 'Detalle del contrato (si es «Otro»)',
              type: 'input',
              span: 12,
              maxLength: 150,
              placeholder: 'Ej. Contrato a plazo fijo',
            },
          ],
        },
      }
    : {}),
  responsable: {
    title: 'Responsable en la empresa',
    description: 'Persona de contacto que supervisa al estudiante dentro de la empresa.',
    fields: [
      {
        name: 'responsableEmpresa',
        label: 'Nombre del responsable',
        type: 'input',
        span: 12,
        maxLength: 150,
        placeholder: 'Nombre completo',
      },
      {
        name: 'cargoResponsable',
        label: 'Cargo del responsable',
        type: 'input',
        span: 6,
        maxLength: 150,
        placeholder: 'Ej. Jefe de área',
      },
      {
        name: 'telefonoResponsable',
        label: 'Teléfono del responsable',
        type: 'input',
        span: 6,
        maxLength: 30,
        placeholder: 'Ej. 71234567',
      },
      {
        name: 'observaciones',
        label: 'Observaciones (opcional)',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Observaciones del trámite',
      },
    ],
  },
});

export const usePasantiaFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const {
    pasantiaId,
    pasantia,
    loadingPasantia,
    errorPasantia,
    saving,
    guardarPasantia,
    empresaOptions,
    loadingEmpresas,
    carreras,
    loadingCarreras,
    carrerasDisponible,
    docentes,
    loadingDocentes,
    docentesDisponible,
  } = usePasantiaFormContext();

  const [error, setError] = useState(null);
  const busquedaEstudiantes = useBuscarEstudiantesTut();

  // El camino elegido decide la sección de contrato (solo CONVALIDACION).
  const tipo = Form.useWatch('tipo', form);
  const esConvalidacion = tipo === 'CONVALIDACION';

  const pageTitle = isEditMode ? 'Editar trámite de pasantía' : 'Nuevo trámite de pasantía';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && pasantiaId == null;

  const returnListPath = location.state?.returnListPath || PASANTIAS_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TUT_PASANTIAS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Pasantías', href: returnListPath },
      { title: pageTitle },
    ],
    [returnListPath, pageTitle],
  );

  /**
   * Opciones del select de estudiante: resultados de la búsqueda + el ya
   * elegido en edición (para que el Select muestre su etiqueta).
   */
  const estudianteOptions = useMemo(() => {
    const porId = new Map();
    for (const e of busquedaEstudiantes.estudiantes) {
      porId.set(e.id, {
        value: e.id,
        label: e.ci ? `${e.nombreCompleto} · CI ${e.ci}` : e.nombreCompleto,
      });
    }
    if (pasantia?.estudianteId != null && !porId.has(pasantia.estudianteId)) {
      porId.set(pasantia.estudianteId, {
        value: pasantia.estudianteId,
        label: pasantia.estudianteNombre || `Estudiante ${pasantia.estudianteId}`,
      });
    }
    return Array.from(porId.values());
  }, [busquedaEstudiantes.estudiantes, pasantia?.estudianteId, pasantia?.estudianteNombre]);

  // Precarga: alta → defaults; edición → ficha.
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapPasantiaToFormValues(null));
      return;
    }
    if (isInvalidEditId || loadingPasantia || !pasantia) return;
    form.setFieldsValue(mapPasantiaToFormValues(pasantia));
  }, [isEditMode, isInvalidEditId, loadingPasantia, pasantia, form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToPasantiaPayload(values);
      const resultado = await guardarPasantia({ id: isEditMode ? pasantiaId : null, payload });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar el trámite de pasantía');
      }
      notification.success({
        title: isEditMode ? 'Trámite actualizado' : 'Trámite registrado',
        description:
          payload.tipo === 'CONVALIDACION'
            ? 'Convalidación de experiencia laboral'
            : 'Trámite de pasantía',
      });
      const raw = resultado.data?.pasantia ?? resultado.data;
      const savedId = raw?.id ?? pasantiaId;
      if (savedId) {
        navigate(pasantiaDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el trámite de pasantía';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [
    form,
    isEditMode,
    pasantiaId,
    guardarPasantia,
    notification,
    navigate,
    returnListPath,
    menuSidebarKey,
    handleVolver,
  ]);

  const formSections = useMemo(
    () =>
      createPasantiaFormSections({
        esConvalidacion,
        empresaOptions,
        loadingEmpresas,
        carreras,
        carrerasDisponible,
        loadingCarreras,
        docentes,
        docentesDisponible,
        loadingDocentes,
      }),
    [
      esConvalidacion,
      empresaOptions,
      loadingEmpresas,
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
    loading: isEditMode ? loadingPasantia : false,
    submitLoading: saving,
    error: error || (isEditMode ? errorPasantia : null),
    formSections,
    esConvalidacion,
    estudianteOptions,
    buscandoEstudiantes: busquedaEstudiantes.loading,
    onBuscarEstudiantes: busquedaEstudiantes.buscar,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
