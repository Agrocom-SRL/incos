/**
 * Organismo: tarjeta de configuración del APORTE de la gestión vigente
 * (Config. de pagos · Finanzas).
 *
 * Form en Card (gemelo de las secciones de `PoliticaInstitucionalPage`): monto base
 * (Bs), aporte activo (switch), fecha inicio y fecha fin (opcional). El guardado es
 * UPSERT (POST si no existe config para la gestión vigente; PUT si existe) — la
 * decisión vive en el hook de estado. El botón se envuelve en `PermisoGuard EDITAR`.
 *
 * Recibe props ya mapeadas (aporte vigente, gestión, handlers); no llama hooks de fetch.
 */

import { useEffect } from 'react';
import { DatePicker, Form, InputNumber, Switch, Tag } from 'antd';
import dayjs from 'dayjs';
import { Card, Button as AtomButton } from '@atoms';
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

const AporteConfigCard = ({ aporteVigente, gestionVigente, saving, onGuardar }) => {
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
    <Card
      title="Aporte de la gestión vigente"
      headerColor="primary"
      variant="outlined"
      shadow={false}
      extra={gestionLabel ? <Tag color="processing">Gestión {gestionLabel}</Tag> : null}
    >
      <Form form={form} layout="vertical">
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
              <AtomButton variant="primary" disabled>
                Sin permiso para editar
              </AtomButton>
            }
          >
            <AtomButton variant="primary" loading={saving} onClick={handleGuardar}>
              Guardar aporte
            </AtomButton>
          </PermisoGuard>
        </div>
      </Form>
    </Card>
  );
};

export default AporteConfigCard;
