/**
 * Hook de pantalla: alta/edición de un curso de capacitación (CAP · CREAR/EDITAR).
 *
 * Gemelo de `useBancoForm` (Finanzas · Config. de pagos): secciones declarativas
 * (`config/cursoFormSections`) para el wizard, precarga en modo edición
 * (grupos con sus horarios y requisitos), submit con payload EXACTO del backend
 * (`create/updateCursoCapacitacionValidator`) y navegación a la ficha.
 *
 * Costos condicionales: «El curso tiene costo» y «Cobra matrícula» habilitan y
 * exigen su monto; apagados lo limpian (y viajan 0). Los horarios de cada grupo
 * se marcan con casillas sobre el catálogo (sin IDs hardcodeados); si falta uno,
 * un modal lo crea (`useCursoHorarioCrear`). El aula es opcional y va por grupo
 * (catálogo cargado una vez por el provider).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCursoCapacitacionFormContext } from '@application-capacitacion/cursos/hooks/context/useCursoCapacitacionFormContext';
import {
  mapCursoToFormValues,
  mapCursoToNuevaEdicionFormValues,
  mapFormValuesToCursoPayload,
} from '@application-capacitacion/cursos/mappers/cursoCapacitacionMapper';
import { createCursoFormSections } from '@application-capacitacion/cursos/config/cursoFormSections';
import { useCursoHorarioCrear } from '@application-capacitacion/cursos/hooks/state/useCursoHorarioCrear';
import { buildHorarioOptions } from '@application-capacitacion/utils/horarioCapacitacion';
import { hayGrupoSinNombre } from '@application-capacitacion/utils/gruposCapacitacion';
import {
  CURSOS_CAP_LIST_PATH,
  CAP_CURSOS_MENU_KEY,
  cursoCapDetallePath,
} from '@application-capacitacion/config/paths';

const DESCRIPCION_REQUISITOS =
  'Documentos o condiciones que debe cumplir el participante. Se puede inscribir sin cumplirlos (queda pendiente), pero solo pasa a «Inscrito» con los obligatorios entregados.';

export const useCursoCapacitacionFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const {
    cursoId,
    curso,
    loadingCurso,
    errorCurso,
    saving,
    guardarCurso,
    aulas,
    loadingAulas,
    aulasDisponible,
    horariosCatalogo,
    loadingHorarios,
    errorHorarios,
    creandoHorario,
    crearHorario,
  } = useCursoCapacitacionFormContext();

  const [error, setError] = useState(null);
  const [stepError, setStepError] = useState('');

  // El interruptor de costo gobierna si se pide el monto del curso (la matrícula se decide por grupo).
  // `preserve: true`: en los pasos 2 y 3 los interruptores ya no están montados y sin esto
  // `useWatch` los vería apagados, lo que borraba los montos escritos en el paso 1.
  const tieneCosto = Form.useWatch('tieneCosto', { form, preserve: true }) === true;

  // Apagar el interruptor del costo limpia su monto (se enviará 0); la matrícula vive en cada grupo.
  useEffect(() => {
    if (!tieneCosto) form.setFieldsValue({ costo: undefined });
  }, [tieneCosto, form]);

  // Catálogo + horarios ya asignados a los grupos (la edición nunca pierde una selección).
  const { options: horarioOptions, diaById: horarioDias } = useMemo(
    () =>
      buildHorarioOptions(
        horariosCatalogo,
        (curso?.grupos ?? []).flatMap((g) => g.horarios),
      ),
    [horariosCatalogo, curso?.grupos],
  );

  const horarioCrear = useCursoHorarioCrear({ form, crearHorario });

  // «Nueva edición»: el alta parte de una copia de la oferta de origen (`location.state.cursoOrigenId`).
  const origenId = !isEditMode && cursoId != null ? cursoId : null;

  const pageTitle = isEditMode
    ? 'Editar curso de capacitación'
    : origenId
      ? 'Nueva edición del curso'
      : 'Nuevo curso de capacitación';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && cursoId == null;

  const returnListPath = location.state?.returnListPath || CURSOS_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_CURSOS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Cursos', href: returnListPath },
      { title: pageTitle },
    ],
    [returnListPath, pageTitle],
  );

  // Precarga: alta → defaults; nueva edición → copia de la oferta de origen; edición → ficha del curso.
  useEffect(() => {
    if (!isEditMode && !origenId) {
      form.setFieldsValue(mapCursoToFormValues(null));
      return;
    }
    if (isInvalidEditId || loadingCurso || !curso) return;
    form.setFieldsValue(
      isEditMode ? mapCursoToFormValues(curso) : mapCursoToNuevaEdicionFormValues(curso),
    );
  }, [isEditMode, origenId, isInvalidEditId, loadingCurso, curso, form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      await form.validateFields();
      // Valores completos del store: incluye los horarios de cada grupo, que no son campos registrados.
      const values = form.getFieldsValue(true);
      if (hayGrupoSinNombre(values.grupos)) {
        throw new Error('Todos los grupos deben tener nombre');
      }
      const payload = mapFormValuesToCursoPayload(values, { cursoOrigenId: origenId });
      const resultado = await guardarCurso({ id: isEditMode ? cursoId : null, payload });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar el curso de capacitación');
      }
      notification.success({
        title: isEditMode ? 'Curso actualizado' : 'Curso creado',
        description: payload.titulo,
      });
      const raw = resultado.data?.cursoCapacitacion ?? resultado.data;
      const savedId = raw?.id ?? cursoId;
      if (savedId) {
        navigate(cursoCapDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el curso de capacitación';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [
    form,
    isEditMode,
    cursoId,
    origenId,
    guardarCurso,
    notification,
    navigate,
    returnListPath,
    menuSidebarKey,
    handleVolver,
  ]);

  const formSections = useMemo(
    () =>
      createCursoFormSections({
        tieneCosto,
      }),
    [tieneCosto],
  );

  /**
   * Pasos del wizard (mismo diseño `tabs` que el alta de estudiantes e inscripciones):
   * 1 datos y costos, 2 grupos y horarios, 3 requisitos. Las secciones 2 y 3 son
   * editores propios (`renderSectionContent` en la página).
   */
  const wizardSteps = useMemo(
    () => [
      {
        title: 'Datos del curso',
        formTitle: pageTitle,
        description: formSections.datosCurso?.description,
        sections: ['datosCurso', 'costos'],
        config: {
          datosCurso: formSections.datosCurso,
          costos: formSections.costos,
        },
      },
      {
        title: 'Grupos y horarios',
        formTitle: pageTitle,
        description: formSections.gruposHorarios?.description,
        sections: ['gruposHorarios'],
        config: {
          gruposHorarios: {
            title: formSections.gruposHorarios?.title,
            description: formSections.gruposHorarios?.description,
          },
        },
      },
      {
        title: 'Requisitos de inscripción',
        formTitle: pageTitle,
        description: DESCRIPCION_REQUISITOS,
        sections: ['requisitos'],
        config: { requisitos: { title: 'Requisitos de inscripción', description: DESCRIPCION_REQUISITOS } },
      },
    ],
    [pageTitle, formSections],
  );

  /** Valida el paso visible antes de avanzar: lo montado se valida; los grupos exigen nombre. */
  const onValidateBeforeNext = useCallback(
    async (stepNumber) => {
      setStepError('');
      await form.validateFields();
      if (stepNumber === 2 && hayGrupoSinNombre(form.getFieldValue('grupos'))) {
        throw new Error('Todos los grupos deben tener nombre');
      }
    },
    [form],
  );

  const handleValidationError = useCallback((err) => {
    setStepError(err?.errorFields ? 'Revise los campos obligatorios' : err?.message || 'Revise los datos del paso actual');
  }, []);

  // Paso inicial (p. ej. desde «Editar grupo» del listado de grupos); solo en edición.
  const initialStep = isEditMode ? Number(location.state?.initialStep) || 0 : 0;

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: isEditMode || origenId ? loadingCurso : false,
    submitLoading: saving,
    error: error || (isEditMode || origenId ? errorCurso : null),
    formSections,
    wizardSteps,
    initialStep,
    onValidateBeforeNext,
    handleValidationError,
    stepError,
    horarioOptions,
    horarioDias,
    loadingHorarios,
    errorHorarios,
    creandoHorario,
    horarioCrear,
    aulas,
    loadingAulas,
    aulasDisponible,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
