/**
 * ABM Paralelo maestro — workspace alineado a AcademicoPage.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { useParaleloForm } from '@application-configuracion/academico/hooks';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import ParaleloFormSections from '../components/organisms/ParaleloFormSections';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const ParaleloFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading,
    submitLoading,
    error,
    formSections,
    resolveOptions,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
    carreraId,
    carreras,
    carrerasLoading,
    carrerasError,
    sinPlanVigente,
  } = useParaleloForm(mode);

  const saveButton = (
    <ActionButton
      permiso="configuracion.paralelo"
      accion={permisoAccion}
      variant="primary"
      size="large"
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar paralelo
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
            <Alert type="error" showIcon title="Identificador de paralelo inválido" />
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
          <Spin spinning={loading} tip="Cargando paralelo…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <ParaleloFormSections
                  form={form}
                  formSections={formSections}
                  resolveOptions={resolveOptions}
                  footer={saveButton}
                  carreras={carreras}
                  carrerasLoading={carrerasLoading}
                  carrerasError={carrerasError}
                  carreraId={carreraId}
                  sinPlanVigente={sinPlanVigente}
                  fieldsDisabled={loading || submitLoading}
                />
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default ParaleloFormPage;
