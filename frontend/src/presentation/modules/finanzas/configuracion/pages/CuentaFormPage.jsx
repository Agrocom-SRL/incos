/**
 * ABM cuenta de pago — workspace alineado a CFG Académico. Gemelo de
 * `BancoFormPage.jsx`, con una segunda sección para el QR de cobro. El campo
 * `qr` NO es data-driven (`CfgFormWorkspace`/`FormField` no lo soportan sin
 * acoplarse a `buildCarreraImageUrl`): se traslada tal cual el bloque
 * `Form.Item` + `Upload` que vivía en `CuentaDrawer.jsx` (retirado), vía
 * `beforeFields` de una sección propia.
 */

import { Alert, Flex, Form, Spin, Typography, Upload } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, Button } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { useCuentaForm } from '@application-finanzas/hooks/state/useCuentaForm';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/configuracion/styles/config-pagos.css';

const { Text } = Typography;

const QR_ACCEPT = '.jpg,.jpeg,.png';

/** Normaliza el evento de Upload a un fileList (espejo de `CuentaDrawer.normFile`). */
const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
};

const CuentaFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading,
    submitLoading,
    error,
    initialValues,
    formSections,
    cuentaActual,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  } = useCuentaForm(mode);

  const { datosCuenta } = formSections ?? {};

  const saveButton = (
    <ActionButton
      permiso={CONFIG_PAGOS_PERMISO}
      accion={permisoAccion}
      variant="primary"
      size="large"
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar cuenta
    </ActionButton>
  );

  const qrBlock = (
    <>
      <Text type="secondary" className="cfg-academico-workspace__desc">
        Subí el QR con el que los estudiantes realizarán el pago. JPG o PNG; reemplaza el QR
        actual si la cuenta ya tiene uno.
      </Text>

      <Form.Item
        name="qr"
        label="Imagen QR (opcional)"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload accept={QR_ACCEPT} maxCount={1} beforeUpload={() => false} listType="picture">
          <Button icon={<UploadOutlined />}>Seleccionar QR</Button>
        </Upload>
      </Form.Item>

      {isEditMode && cuentaActual?.qrImagenUrl ? (
        <Text type="secondary" className="cfg-pagos-drawer__qr-hint">
          <CheckCircleOutlined aria-hidden /> Esta cuenta ya tiene un QR cargado.
        </Text>
      ) : null}
    </>
  );

  if (isInvalidEditId) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title={pageTitle}
            breadcrumbItems={breadcrumbItems}
            actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
          />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert type="error" showIcon title="Identificador de cuenta inválido" />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={loading} tip="Cargando cuenta…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                initialValues={initialValues}
                disabled={loading || submitLoading}
              >
                {datosCuenta?.fields?.length ? (
                  <CfgFormWorkspace
                    title={datosCuenta.title}
                    description={datosCuenta.description}
                    fields={datosCuenta.fields}
                    form={form}
                  />
                ) : null}

                <CfgFormWorkspace
                  title="Imagen QR de cobro"
                  fields={[]}
                  form={form}
                  beforeFields={qrBlock}
                  footer={saveButton}
                />
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CuentaFormPage;
