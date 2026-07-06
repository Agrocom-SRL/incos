/**
 * Aporte de la gestión vigente (Finanzas) — página propia (ítem de menú FIN,
 * order 4).
 *
 * Antes era el tab "Aporte" de "Config. de pagos"; se promovió a página
 * top-level con su propio permiso `finanzas.aporte` (LISTAR/CREAR/EDITAR, sin
 * ELIMINAR), separado de `finanzas.configuracion.pago` (bancos/cuentas/métodos).
 *
 * Página "dumb" (espejo de `ConfigPagosPage`, sin tabs): compone
 * `PageHeaderArea` + `DashboardPageShell` + `MainContent` + el workspace
 * `cfg-academico-workspace` con el formulario de monto base, vigencia y
 * estado del aporte. Toda la orquestación (fetch, upsert) vive en
 * `useAportePage` + el provider; aquí no se hace fetch.
 */

import { useEffect } from 'react';
import { Alert, DatePicker, Empty, Flex, Form, InputNumber, Spin, Switch, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { Button } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { allSpacing } from '@theme/tokens';
import { useAportePage } from '@application-finanzas/aportes/hooks/state/useAportePage';
import { APORTE_PERMISO } from '@finanzas/aportes/config/aportePermisos';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/aportes/styles/aporte-page.css';

const { Paragraph, Text } = Typography;

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

const AportePage = () => {
  const [form] = Form.useForm();
  const { gestionVigente, breadcrumbItems, aporteVigente, loading, error, refetch, saving, guardarAporte } =
    useAportePage();

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
    await guardarAporte(values);
  };

  const gestionLabel = gestionVigente?.nombre || gestionVigente?.gestion || gestionVigente?.anio;

  let body;
  if (loading) {
    body = (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={allSpacing.marginSM}
        style={{ minHeight: allSpacing.skeletonCardHeight }}
      >
        <Spin size="large" />
        <Text type="secondary">Cargando aporte de la gestión...</Text>
      </Flex>
    );
  } else if (error) {
    body = (
      <Alert
        type="error"
        showIcon
        title="No se pudo cargar el aporte de la gestión"
        description={typeof error === 'string' ? error : String(error)}
        action={
          <Button variant="info" size="small" onClick={refetch}>
            Reintentar
          </Button>
        }
      />
    );
  } else if (!gestionVigente) {
    body = <Empty description="No hay una gestión vigente para configurar el aporte" />;
  } else {
    body = (
      <section className="cfg-academico-workspace cfg-academico-form-workspace">
        <header className="cfg-academico-workspace__header">
          <ListPanelHeader title="Aporte de la gestión vigente" />
          <Paragraph type="secondary" className="cfg-academico-workspace__desc">
            Monto base, vigencia y estado del aporte que se cobra a los estudiantes en la gestión
            actual.
          </Paragraph>
        </header>
        <div className="cfg-academico-form-workspace__body">
          <div className="aporte-page-panel">
            <Form form={form} layout="vertical" className="aporte-page-form">
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
                  codigo={APORTE_PERMISO}
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
        </div>
      </section>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Aportes" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>{body}</MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default AportePage;
