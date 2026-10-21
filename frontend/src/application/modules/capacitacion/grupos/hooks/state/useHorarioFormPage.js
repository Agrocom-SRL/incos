/**
 * Hook de pantalla: alta/edición de un horario de capacitación (CAP ·
 * CREAR/EDITAR).
 *
 * Gemelo de `useParticipanteFormPage`: precarga en modo edición (GET fresco por
 * id vía `HorarioFormProvider`), submit con payload EXACTO del backend y
 * navegación de vuelta al tab «Horarios» de Grupos (mantenimiento del catálogo; el
 * formulario de curso crea horarios en un modal propio, sin navegar aquí).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useHorarioFormContext } from '@application-capacitacion/grupos/hooks/context/useHorarioFormContext';
import {
  mapFormValuesToHorarioPayload,
  mapHorarioToFormValues,
} from '@application-capacitacion/grupos/mappers/horarioCapacitacionMapper';
import { buildHorarioEtiqueta } from '@application-capacitacion/utils/horarioCapacitacion';
import {
  GRUPOS_TAB_HORARIOS,
  CAP_GRUPOS_MENU_KEY,
  GRUPOS_CAP_LIST_PATH,
  grupoCapTabPath,
} from '@application-capacitacion/config/paths';

export const useHorarioFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const { horarioId, horario, loadingHorario, errorHorario, saving, guardarHorario } =
    useHorarioFormContext();

  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar horario' : 'Nuevo horario';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && horarioId == null;

  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_GRUPOS_MENU_KEY;
  const returnListPath = location.state?.returnListPath || grupoCapTabPath(GRUPOS_TAB_HORARIOS);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Grupos', href: GRUPOS_CAP_LIST_PATH },
      { title: 'Horarios', href: grupoCapTabPath(GRUPOS_TAB_HORARIOS) },
      { title: pageTitle },
    ],
    [pageTitle],
  );

  // Precarga: alta → vacío; edición → ficha del horario.
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapHorarioToFormValues(null));
      return;
    }
    if (isInvalidEditId || loadingHorario || !horario) return;
    form.setFieldsValue(mapHorarioToFormValues(horario));
  }, [isEditMode, isInvalidEditId, loadingHorario, horario, form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToHorarioPayload(values);
      const resultado = await guardarHorario({ id: isEditMode ? horarioId : null, payload });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar el horario');
      }
      notification.success({
        title: isEditMode ? 'Horario actualizado' : 'Horario guardado',
        description: buildHorarioEtiqueta(payload.dia, payload.horaInicio, payload.horaFin),
      });
      handleVolver();
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar el horario';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [form, isEditMode, horarioId, guardarHorario, notification, handleVolver]);

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: isEditMode ? loadingHorario : false,
    submitLoading: saving,
    error: error || (isEditMode ? errorHorario : null),
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
