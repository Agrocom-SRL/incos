/**
 * Hook de pantalla: alta/edición de un participante de capacitación (CAP ·
 * CREAR/EDITAR).
 *
 * Gemelo de `useCursoCapacitacionFormPage`, pero de una sola sección: los 7
 * campos de `ParticipanteFormFields` no son declarativos (no usan
 * `CfgFormFieldGrid`), así que no hace falta `createXFormSections`. Precarga
 * en modo edición (GET fresco por id vía `ParticipanteFormProvider`), submit
 * con payload EXACTO del backend (`create/updateParticipanteValidator`) y
 * navegación de vuelta al listado (el recurso no tiene ficha propia).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useParticipanteFormContext } from '@application-capacitacion/participantes/hooks/context/useParticipanteFormContext';
import {
  mapFormValuesToParticipantePayload,
  mapParticipanteToFormValues,
} from '@application-capacitacion/participantes/mappers/participanteMapper';
import {
  PARTICIPANTES_CAP_LIST_PATH,
  CAP_PARTICIPANTES_MENU_KEY,
} from '@application-capacitacion/config/paths';

export const useParticipanteFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const {
    participanteId,
    participante,
    loadingParticipante,
    errorParticipante,
    saving,
    guardarParticipante,
  } = useParticipanteFormContext();

  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar participante' : 'Nuevo participante';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && participanteId == null;

  const returnListPath = location.state?.returnListPath || PARTICIPANTES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_PARTICIPANTES_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Participantes', href: returnListPath },
      { title: pageTitle },
    ],
    [returnListPath, pageTitle],
  );

  // Precarga: alta → defaults; edición → ficha del participante.
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapParticipanteToFormValues(null));
      return;
    }
    if (isInvalidEditId || loadingParticipante || !participante) return;
    form.setFieldsValue(mapParticipanteToFormValues(participante));
  }, [isEditMode, isInvalidEditId, loadingParticipante, participante, form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToParticipantePayload(values);
      const resultado = await guardarParticipante({
        id: isEditMode ? participanteId : null,
        payload,
      });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar el participante');
      }
      notification.success({
        title: isEditMode ? 'Participante actualizado' : 'Participante registrado',
        description: payload.nombres,
      });
      navigate(returnListPath, { state: { menuSidebarKey } });
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar el participante';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [
    form,
    isEditMode,
    participanteId,
    guardarParticipante,
    notification,
    navigate,
    returnListPath,
    menuSidebarKey,
  ]);

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: isEditMode ? loadingParticipante : false,
    submitLoading: saving,
    error: error || (isEditMode ? errorParticipante : null),
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
