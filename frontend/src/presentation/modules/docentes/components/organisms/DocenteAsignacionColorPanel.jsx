/**
 * Panel para asignar color del docente (patrón CFG carrera — FormField popover).
 */

import { useCallback, useEffect, useState } from 'react';
import { App, Form } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { FormField } from '@molecules';
import { ActionButton } from '@atoms';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import { DOCENTE_COLOR_FIELD } from '@docentes/config/docenteColorField';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import '@configuracion/academico/styles/academico-form-page.css';

const DocenteAsignacionColorPanel = ({
  colorHex,
  puedeEditarColor = false,
  saving = false,
  onSaveColor,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const initial = sanitizeDocenteColorHex(colorHex) || undefined;

  useEffect(() => {
    form.setFieldsValue({ colorHex: initial });
  }, [form, initial]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields(['colorHex']);
      const hex = sanitizeDocenteColorHex(values.colorHex);
      if (!hex) {
        message.warning('Seleccione un color válido (#RRGGBB)');
        return;
      }
      await onSaveColor?.(hex);
    } catch {
      /* validación Form */
    }
  }, [form, message, onSaveColor]);

  return (
    <DetailInfoCard
      title="Color en horarios"
      icon={<BgColorsOutlined />}
      cols={1}
      extra={
        puedeEditarColor ? (
          <ActionButton
            permiso="docentes.editar"
            accion="EDITAR"
            variant="primary"
            size="small"
            loading={saving}
            onClick={handleSave}
          >
            Guardar color
          </ActionButton>
        ) : null
      }
    >
      <Form form={form} layout="vertical" disabled={!puedeEditarColor || saving}>
        <FormField field={DOCENTE_COLOR_FIELD} form={form} />
      </Form>
    </DetailInfoCard>
  );
};

export default DocenteAsignacionColorPanel;
