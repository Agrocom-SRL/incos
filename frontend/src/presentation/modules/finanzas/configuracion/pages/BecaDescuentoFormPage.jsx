/**
 * ABM catálogo maestro Becas y descuentos — workspace alineado a CFG Académico.
 * Gemelo de `configuracion/complementarios/pages/DiscapacidadFormPage.jsx`, con
 * dos secciones (`Datos` + `Reglas de aplicación`) apiladas: cada una es un
 * `CfgFormWorkspace` propio (el botón de guardado va en el footer de la última).
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { useBecaDescuentoForm } from '@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoForm';
import { BECA_DESCUENTO_PERMISO } from '@finanzas/configuracion/config/becaDescuentoPermisos';
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
                    fields={datosBeca.fields}
                    form={form}
                  />
                ) : null}

                {reglasAplicacion?.fields?.length ? (
                  <CfgFormWorkspace
                    title={reglasAplicacion.title}
                    description={reglasAplicacion.description}
                    fields={reglasAplicacion.fields}
                    form={form}
                    footer={saveButton}
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
