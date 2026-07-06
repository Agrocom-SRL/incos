/**
 * ABM idioma — workspace alineado a ComplementariosPage.
 * Gemelo de `DiscapacidadFormPage.jsx`.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { useIdiomaForm } from '@application-configuracion/complementarios/hooks';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const IdiomaFormPage = ({ mode = 'create' }) => {
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
  } = useIdiomaForm(mode);

  const { datosIdioma } = formSections ?? {};

  const saveButton = (
    <ActionButton
      permiso="configuracion.complementario.idiomas"
      accion={permisoAccion}
      variant="primary"
      size="large"
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar idioma
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
            <Alert type="error" showIcon title="Identificador de idioma inválido" />
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
          <Spin spinning={loading} tip="Cargando idioma…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                initialValues={initialValues}
                disabled={loading || submitLoading}
              >
                {datosIdioma?.fields?.length ? (
                  <CfgFormWorkspace
                    title={datosIdioma.title}
                    description={datosIdioma.description}
                    fields={datosIdioma.fields}
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

export default IdiomaFormPage;
