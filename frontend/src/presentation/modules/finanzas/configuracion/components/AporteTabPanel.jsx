/**
 * Panel del tab «Aporte» (Config. de pagos · Finanzas).
 *
 * Formulario del aporte de la gestión vigente: monto base (Bs), vigencia (fecha
 * inicio req / fin opcional) y estado activo (switch). El guardado es UPSERT (POST
 * si no existe config para la gestión vigente; PUT si existe) — la decisión vive en
 * el hook de estado. El botón se envuelve en `PermisoGuard EDITAR` (atom `Button`).
 *
 * Recibe props ya mapeadas (aporte vigente, gestión, handlers); no llama hooks de fetch.
 */

import { useEffect } from 'react';
import { DatePicker, Form, InputNumber, Switch, Tag } from 'antd';
import dayjs from 'dayjs';
import { Button } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { allSpacing } from '@theme/tokens';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';

const MONTO_RULES = [
  { required: true, message: 'Ingrese el monto base del aporte' },
  {
    validator: (_, value) => {
      const monto = Number(value);
      if (!Number.isFinite(monto) || monto <= 0) {
        return Promise.reject(new Error('El monto debe ser mayor a 0'));
      }
      return Promise.resolve();
    },
  },
];

const AporteTabPanel = ({ aporteVigente, gestionVigente, saving, onGuardar }) => {
  const [form] = Form.useForm();

  // Precarga el formulario con el aporte vigente (o valores por defecto para alta).
  useEffect(() => {
    form.setFieldsValue({
      montoBase: aporteVigente?.montoBase ?? null,
      aporteActivo: aporteVigente?.aporteActivo ?? true,
      fechaInicio: aporteVigente?.fechaInicio ? dayjs(aporteVigente.fechaInicio) : null,
      fechaFin: aporteVigente?.fechaFin ? dayjs(aporteVigente.fechaFin) : null,
    });
  }, [aporteVigente, form]);

  const handleGuardar = async () => {
    const values = await form.validateFields();
    await onGuardar?.(values);
  };

  const gestionLabel = gestionVigente?.nombre || gestionVigente?.gestion || gestionVigente?.anio;

  return (
    <div className="cfg-pagos-panel">
      <Form form={form} layout="vertical" className="cfg-pagos-aporte-form">
        {gestionLabel ? (
          <Form.Item label="Gestión vigente">
            <Tag color="processing">Gestión {gestionLabel}</Tag>
          </Form.Item>
        ) : null}

        <Form.Item name="montoBase" label="Monto base del aporte (Bs)" rules={MONTO_RULES}>
          <InputNumber
            size="large"
            min={0}
            step={50}
            prefix="Bs"
            style={{ width: '100%' }}
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item
          name="fechaInicio"
          label="Fecha de inicio de vigencia"
          rules={[{ required: true, message: 'Seleccione la fecha de inicio' }]}
        >
          <DatePicker size="large" format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="fechaFin"
          label="Fecha de fin (opcional)"
          tooltip="Déjelo vacío si el aporte no tiene fecha límite."
        >
          <DatePicker size="large" format="DD/MM/YYYY" style={{ width: '100%' }} allowClear />
        </Form.Item>

        <Form.Item name="aporteActivo" label="Aporte activo" valuePropName="checked">
          <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
        </Form.Item>

        <div style={{ marginTop: allSpacing.marginLG }}>
          <PermisoGuard
            codigo={CONFIG_PAGOS_PERMISO}
            accion="EDITAR"
            fallback={
              <Button variant="primary" disabled>
                Sin permiso para editar
              </Button>
            }
          >
            <Button variant="primary" loading={saving} onClick={handleGuardar}>
              Guardar aporte
            </Button>
          </PermisoGuard>
        </div>
      </Form>
    </div>
  );
};

export default AporteTabPanel;
