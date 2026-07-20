/**
 * Hook de pantalla: alta/edición de un curso de capacitación (CAP · CREAR/EDITAR).
 *
 * Gemelo de `useBancoForm` (Finanzas · Config. de pagos): secciones declarativas
 * para `CfgFormWorkspace`, precarga en modo edición (incluye horarioIds de la
 * junction), submit con payload EXACTO del backend
 * (`create/updateCursoCapacitacionValidator`) y navegación a la ficha.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import dayjs from 'dayjs';
import { useCursoCapacitacionFormContext } from '@application-capacitacion/cursos/hooks/context/useCursoCapacitacionFormContext';
import {
  mapCursoToFormValues,
  mapFormValuesToCursoPayload,
} from '@application-capacitacion/cursos/mappers/cursoCapacitacionMapper';
import { ESTADO_CURSO_OPTIONS } from '@application-capacitacion/utils/capacitacionPills';
import {
  CURSOS_CAP_LIST_PATH,
  CAP_CURSOS_MENU_KEY,
  cursoCapDetallePath,
} from '@application-capacitacion/config/paths';

/** Secciones declarativas del formulario (CfgFormWorkspace). */
const createCursoFormSections = ({
  aulas,
  aulasDisponible,
  loadingAulas,
  horarioOptions,
  loadingHorarios,
  aulaSeleccionada,
}) => ({
  datosCurso: {
    title: 'Datos del curso',
    description:
      'Identificación, costo y vigencia del curso corto. El cupo es informativo: no bloquea inscripciones.',
    fields: [
      {
        name: 'titulo',
        label: 'Título',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Word avanzado',
        maxLength: 200,
      },
      {
        name: 'estado',
        label: 'Estado del curso',
        type: 'select',
        required: true,
        span: 12,
        options: ESTADO_CURSO_OPTIONS,
        placeholder: 'Estado de la oferta',
      },
      {
        name: 'costo',
        label: 'Costo (Bs)',
        type: 'number',
        required: true,
        span: 12,
        min: 0,
        addonBefore: 'Bs',
        placeholder: '0',
      },
      {
        name: 'cupoMaximo',
        label: 'Cupo máximo',
        type: 'number',
        required: true,
        span: 12,
        min: 1,
        placeholder: '30',
      },
      {
        name: 'fechaInicio',
        label: 'Fecha de inicio',
        type: 'date',
        required: true,
        span: 12,
      },
      {
        name: 'fechaFin',
        label: 'Fecha de fin',
        type: 'date',
        required: true,
        span: 12,
        dependencies: ['fechaInicio'],
        rules: [
          ({ getFieldValue }) => ({
            validator: (_, value) => {
              const inicio = getFieldValue('fechaInicio');
              if (!value || !inicio || !dayjs(value).isBefore(dayjs(inicio), 'day')) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error('La fecha de fin no puede ser anterior a la de inicio'),
              );
            },
          }),
        ],
      },
      {
        name: 'descripcion',
        label: 'Descripción (opcional)',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Contenido, requisitos o público objetivo del curso',
      },
    ],
  },
  horarioAula: {
    title: 'Horario y aula',
    description:
      'El aula determina qué bloques de horario están disponibles. Seleccione primero el aula; los bloques ya ocupados por un paralelo académico u otro curso quedan deshabilitados. El aula es opcional y se comparte con la oferta formal.',
    fields: [
      {
        name: 'aulaId',
        label: 'Aula (opcional)',
        type: 'select',
        span: 12,
        options: aulas,
        allowClear: true,
        disabled: !aulasDisponible,
        loading: loadingAulas,
        placeholder: aulasDisponible
          ? 'Seleccione un aula'
          : 'Catálogo de aulas no disponible para su rol',
      },
      {
        name: 'horarioIds',
        label: 'Bloques de horario',
        type: 'select',
        mode: 'multiple',
        span: 12,
        options: horarioOptions,
        loading: loadingHorarios,
        disabled: !aulaSeleccionada,
        placeholder: aulaSeleccionada
          ? 'Seleccione uno o más bloques'
          : 'Seleccione primero un aula',
      },
    ],
  },
});

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
    horariosDisponibles,
    loadingHorarios,
    cargarHorariosDisponibles,
  } = useCursoCapacitacionFormContext();

  const [error, setError] = useState(null);

  // El aula gobierna la disponibilidad de bloques de horario: se recarga al
  // elegirla/cambiarla y también al montar si ya viene precargada (edición).
  const aulaId = Form.useWatch('aulaId', form);
  useEffect(() => {
    cargarHorariosDisponibles(aulaId, isEditMode ? cursoId : undefined);
  }, [aulaId, isEditMode, cursoId, cargarHorariosDisponibles]);

  const aulaSeleccionada = aulaId != null && aulaId !== '';

  const horarioOptions = useMemo(() => {
    const porTurno = new Map();
    for (const h of horariosDisponibles) {
      const turno = h.turno || 'Sin turno';
      if (!porTurno.has(turno)) porTurno.set(turno, []);
      porTurno.get(turno).push({
        value: h.horarioId,
        label: h.ocupado ? `${h.bloqueLabel} · Ocupado` : h.bloqueLabel,
        disabled: h.ocupado,
      });
    }
    return Array.from(porTurno.entries()).map(([turno, options]) => ({
      label: turno,
      title: turno,
      options,
    }));
  }, [horariosDisponibles]);

  const horarioTurnoById = useMemo(() => {
    const map = {};
    for (const h of horariosDisponibles) {
      map[h.horarioId] = h.turno;
    }
    return map;
  }, [horariosDisponibles]);

  const pageTitle = isEditMode ? 'Editar curso de capacitación' : 'Nuevo curso de capacitación';
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

  // Precarga: alta → defaults; edición → ficha del curso (con horarioIds).
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapCursoToFormValues(null));
      return;
    }
    if (isInvalidEditId || loadingCurso || !curso) return;
    form.setFieldsValue(mapCursoToFormValues(curso));
  }, [isEditMode, isInvalidEditId, loadingCurso, curso, form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToCursoPayload(values);
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
        aulas,
        aulasDisponible,
        loadingAulas,
        horarioOptions,
        loadingHorarios,
        aulaSeleccionada,
      }),
    [aulas, aulasDisponible, loadingAulas, horarioOptions, loadingHorarios, aulaSeleccionada],
  );

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: isEditMode ? loadingCurso : false,
    submitLoading: saving,
    error: error || (isEditMode ? errorCurso : null),
    formSections,
    horarioTurnoById,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
