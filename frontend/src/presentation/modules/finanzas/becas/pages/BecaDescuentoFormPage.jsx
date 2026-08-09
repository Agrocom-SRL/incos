/**
 * ABM catálogo maestro Becas y descuentos — workspace alineado a CFG Académico.
 * Gemelo de `configuracion/complementarios/pages/DiscapacidadFormPage.jsx`, con
 * dos sectores (`Datos` + `Reglas de aplicación`) dentro de una MISMA tarjeta
 * (prop `sections` de `CfgFormWorkspace`, mismo patrón visual que la pestaña
 * de datos del perfil en `UsuarioCreatePage`), en vez de dos cards apiladas.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { useBecaDescuentoForm } from '@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoForm';
import { BECA_DESCUENTO_PERMISO } from '@finanzas/becas/config/becaDescuentoPermisos';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const BecaDescuentoFormPage = ({ mode = 'create' }) => {
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
  } = useBecaDescuentoForm(mode);

  const { datosBeca, reglasAplicacion } = formSections ?? {};

  const saveButton = (
    <ActionButton
      permiso={BECA_DESCUENTO_PERMISO}
      accion={permisoAccion}
      variant="primary"
      size="large"
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar beca o descuento
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
            <Alert type="error" showIcon title="Identificador de beca o descuento inválido" />
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
          <Spin spinning={loading} tip="Cargando beca o descuento…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                initialValues={initialValues}
                disabled={loading || submitLoading}
              >
                {datosBeca?.fields?.length ? (
                  <CfgFormWorkspace
                    title={datosBeca.title}
                    description={datosBeca.description}
                    form={form}
                    footer={saveButton}
                    sections={[
                      { key: 'datosBeca', fields: datosBeca.fields },
                      ...(reglasAplicacion?.fields?.length
                        ? [
                            {
                              key: 'reglasAplicacion',
                              title: reglasAplicacion.title,
                              description: reglasAplicacion.description,
                              fields: reglasAplicacion.fields,
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

export default BecaDescuentoFormPage;
