/**
 * Aporte de la gestión vigente (Finanzas) — página HIJA de "Config. de pagos"
 * (sin ítem de menú propio, se llega desde el botón "Configuración de
 * aportes" de `ConfigPagosPage`). Workspace alineado a CFG Académico
 * (`CarreraFormPage`/`MateriaFormPage`): `PageHeader` + `BackButton` +
 * `Form` + organism `AporteFormSections` (`CfgFormWorkspace` data-driven).
 *
 * Permiso propio `finanzas.aporte` (LISTAR/CREAR/EDITAR, sin ELIMINAR),
 * separado de `finanzas.configuracion.pago` (bancos/cuentas/métodos).
 */

import { useEffect } from 'react';
import { Alert, Empty, Flex, Form, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, Button } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { allSpacing } from '@theme/tokens';
import { useAportePage } from '@application-finanzas/aportes/hooks/state/useAportePage';
import { APORTE_PERMISO } from '@finanzas/configuracion/config/aportePermisos';
import AporteFormSections from '@finanzas/configuracion/components/organisms/AporteFormSections';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/configuracion/styles/aporte-page.css';

const { Text } = Typography;

const AporteConfigPage = () => {
  const [form] = Form.useForm();
  const {
    gestionVigente,
    breadcrumbItems,
    aporteVigente,
    loading,
    error,
    refetch,
    saving,
    formSections,
    handleVolver,
    guardarAporte,
  } = useAportePage();

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

  const saveButton = (
    <ActionButton
      permiso={APORTE_PERMISO}
      accion="EDITAR"
      variant="primary"
      size="large"
      loading={saving}
      onClick={handleGuardar}
    >
      Guardar aporte
    </ActionButton>
  );

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
      <Form
        form={form}
        layout="vertical"
        className="cfg-academico-form aporte-page-form"
        disabled={loading || saving}
      >
        <AporteFormSections
          form={form}
          formSections={formSections}
          gestionLabel={gestionLabel}
          footer={saveButton}
        />
      </Form>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Configuración de pagos · Aportes"
          breadcrumbItems={breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
        />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>{body}</MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default AporteConfigPage;
