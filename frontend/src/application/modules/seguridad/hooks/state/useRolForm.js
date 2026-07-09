/**
 * Orquestación de alta de rol (página completa, solo modo create).
 * Gemelo simplificado de `configuracion/complementarios/hooks/state/useDiscapacidadForm.js`.
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import { TIPO_CONFIG } from '@modules/seguridad/roles/constants/rolTipoConfig.js';

const TIPO_OPTIONS = Object.entries(TIPO_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const CODIGO_PATTERN = /^[A-Z0-9_]+$/;

const createRolFormSections = () => ({
  datosRol: {
    title: 'Datos del rol',
    description:
      'El código identifica al rol de forma única (mayúsculas, números y guion bajo). Los permisos se ajustan luego, en la pantalla de permisos del rol.',
    fields: [
      {
        name: 'codigo',
        label: 'Código',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. COORDINADOR_ACADEMICO',
        maxLength: 50,
      },
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Nombre visible del rol',
        maxLength: 100,
      },
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'pillSelect',
        pillVariant: 'rolTipo',
        required: true,
        span: 12,
        placeholder: 'Seleccione…',
        options: TIPO_OPTIONS,
        allowClear: false,
      },
    ],
  },
});

function errMsg(e) {
  if (e?.message) return e.message;
  const err = e?.error;
  return typeof err === 'string' ? err : err?.message || 'No se pudo crear el rol';
}

export const useRolForm = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/roles' },
      { title: 'Roles', href: '/seguridad/roles' },
      { title: 'Nuevo rol' },
    ],
    [],
  );

  const handleVolver = useCallback(() => {
    navigate('/seguridad/roles');
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const values = await form.validateFields();
      const codigo = String(values.codigo ?? '').trim().toUpperCase();
      if (!CODIGO_PATTERN.test(codigo)) {
        throw new Error('El código solo admite mayúsculas, números y guion bajo');
      }
      const payload = { ...values, codigo };
      const rol = await useCasesFactory.crearRolAdmin().ejecutar(payload);
      notification.success({ title: 'Rol creado correctamente' });
      if (rol?.id) {
        navigate(`/seguridad/roles/${rol.id}/permisos`);
      } else {
        navigate('/seguridad/roles');
      }
    } catch (e) {
      if (e?.errorFields) {
        setSubmitError('Revise los campos obligatorios');
      } else {
        const msg = errMsg(e);
        setSubmitError(msg);
        notification.error({ title: 'Error al crear el rol', description: msg });
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [form, navigate, notification]);

  const formSections = useMemo(() => createRolFormSections(), []);

  return {
    form,
    breadcrumbItems,
    submitLoading,
    submitError,
    formSections,
    handleVolver,
    handleSubmit,
  };
};
