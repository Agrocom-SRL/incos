/**
 * Hook de pantalla: alta/edición de una empresa del catálogo (TIT ·
 * empresa·CREAR/EDITAR).
 *
 * Gemelo de `usePasantiaFormPage` en versión catálogo: secciones declarativas
 * para `CfgFormWorkspace` (campos de pasantias_empresas — checkboxes del
 * informe de verificación), precarga en edición y submit P8/P9.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { usePasantiaEmpresaFormContext } from '@application-titulacion/pasantias/hooks/context/usePasantiaEmpresaFormContext';
import { TIPO_SOCIETARIO_OPTIONS } from '@application-titulacion/utils/pasantiasPills';
import {
  mapEmpresaToFormValues,
  mapFormValuesToEmpresaPayload,
} from '@application-titulacion/pasantias/mappers/pasantiaMapper';
import {
  PASANTIAS_EMPRESAS_PATH,
  TIT_PASANTIAS_MENU_KEY,
} from '@application-titulacion/config/paths';

/** Secciones declarativas del formulario (CfgFormWorkspace). */
const EMPRESA_FORM_SECTIONS = {
  datosEmpresa: {
    title: 'Datos de la empresa',
    description:
      'Catálogo de empresas receptoras de pasantía. Los datos replican el informe de ' +
      'verificación de empresa (tipo societario, NIT y funcionamiento).',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre o razón social',
        type: 'input',
        required: true,
        span: 12,
        maxLength: 255,
        placeholder: 'Ej. Embotelladora Boliviana S.A.',
      },
      {
        name: 'nombreComercial',
        label: 'Nombre comercial (opcional)',
        type: 'input',
        span: 12,
        maxLength: 200,
        placeholder: 'Ej. Embol',
      },
      {
        name: 'tipoSocietario',
        label: 'Tipo societario',
        type: 'select',
        span: 6,
        options: TIPO_SOCIETARIO_OPTIONS,
        allowClear: true,
        placeholder: 'Seleccione el tipo',
      },
      { name: 'nit', label: 'NIT', type: 'input', span: 6, maxLength: 30, placeholder: 'Ej. 1023456789' },
      {
        name: 'enFuncionamiento',
        label: 'Empresa en funcionamiento',
        type: 'switch',
        span: 6,
        checkedChildren: 'Sí',
        unCheckedChildren: 'No',
      },
      {
        name: 'sectorActividad',
        label: 'Sector / actividad',
        type: 'input',
        span: 18,
        maxLength: 150,
        placeholder: 'Ej. Comercio de insumos agrícolas',
      },
    ],
  },
  contacto: {
    title: 'Contacto',
    fields: [
      {
        name: 'direccion',
        label: 'Dirección',
        type: 'input',
        span: 16,
        maxLength: 255,
        placeholder: 'Ej. Av. 6 de Agosto N.º 123',
      },
      {
        name: 'telefono',
        label: 'Teléfono',
        type: 'input',
        span: 8,
        maxLength: 30,
        placeholder: 'Ej. 2 2441122',
      },
      {
        name: 'observaciones',
        label: 'Observaciones (opcional)',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Observaciones de la verificación',
      },
    ],
  },
};

export const usePasantiaEmpresaFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const { empresaId, empresa, loadingEmpresa, errorEmpresa, saving, guardarEmpresa } =
    usePasantiaEmpresaFormContext();

  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar empresa' : 'Nueva empresa';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && empresaId == null;

  const returnListPath = location.state?.returnListPath || PASANTIAS_EMPRESAS_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TIT_PASANTIAS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Empresas de pasantía', href: returnListPath },
      { title: pageTitle },
    ],
    [returnListPath, pageTitle],
  );

  // Precarga: alta → defaults; edición → empresa resuelta del catálogo.
  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapEmpresaToFormValues(null));
      return;
    }
    if (isInvalidEditId || loadingEmpresa || !empresa) return;
    form.setFieldsValue(mapEmpresaToFormValues(empresa));
  }, [isEditMode, isInvalidEditId, loadingEmpresa, empresa, form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToEmpresaPayload(values);
      const resultado = await guardarEmpresa({
        empresaId: isEditMode ? empresaId : null,
        payload,
      });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar la empresa');
      }
      notification.success({
        title: isEditMode ? 'Empresa actualizada' : 'Empresa registrada',
        description: payload.nombre,
      });
      handleVolver();
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar la empresa';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [form, isEditMode, empresaId, guardarEmpresa, notification, handleVolver]);

  // No se encontró la empresa en el catálogo (edición con id inexistente).
  const empresaNoEncontrada = isEditMode && !isInvalidEditId && !loadingEmpresa && empresa == null;

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: isEditMode ? loadingEmpresa : false,
    submitLoading: saving,
    error:
      error ||
      (isEditMode ? errorEmpresa : null) ||
      (empresaNoEncontrada ? 'No se encontró la empresa solicitada.' : null),
    formSections: EMPRESA_FORM_SECTIONS,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
