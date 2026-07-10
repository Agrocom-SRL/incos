/**
 * ABM cuenta de pago — workspace alineado a CFG Académico, mismo patrón de
 * "una sola tarjeta con varios sectores" que la pestaña de datos del perfil
 * en `UsuarioCreatePage` (prop `sections` de `CfgFormWorkspace`): "Datos de
 * la cuenta" + "QR de cobro". El QR es data-driven (`type: 'imageUpload'`,
 * mismo dragger visual que el campo "Imagen de la carrera") y solo aparece
 * cuando el switch "¿Desea agregar un QR de cobro?" está activo — igual que
 * "N.° de celular" con su propio switch.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { useCuentaForm } from '@application-finanzas/hooks/state/useCuentaForm';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const CuentaFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading,
    submitLoading,
    error,
    initialValues,
    formSections,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  } = useCuentaForm(mode);

  const { datosCuenta, qrCuenta } = formSections ?? {};

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
                    form={form}
                    footer={saveButton}
                    sections={[
                      { key: 'datosCuenta', fields: datosCuenta.fields },
                      ...(qrCuenta?.fields?.length
                        ? [
                            {
                              key: 'qrCuenta',
                              title: qrCuenta.title,
                              description: qrCuenta.description,
                              fields: qrCuenta.fields,
                            },
                          ]
                        : []),
                    ]}
                  />
                ) : null}
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CuentaFormPage;
