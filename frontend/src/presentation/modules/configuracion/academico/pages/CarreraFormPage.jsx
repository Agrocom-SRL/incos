/**
 * ABM Carrera — workspace alineado a AcademicoPage (catálogo académico).
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { useCarreraForm } from '@application-configuracion/academico/hooks';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import CarreraFormSections from '../components/organisms/CarreraFormSections';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const CarreraFormPage = ({ mode = 'create' }) => {
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
  } = useCarreraForm(mode);

  const saveButton = (
    <ActionButton
      permiso="configuracion.carrera"
      accion={permisoAccion}
      variant="primary"
      size="large"
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar carrera
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
            <Alert type="error" showIcon message="Identificador de carrera inválido" />
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
          <Spin spinning={loading} tip="Cargando carrera…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon message={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                initialValues={initialValues}
                disabled={loading || submitLoading}
              >
                <CarreraFormSections
                  form={form}
                  formSections={formSections}
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

export default CarreraFormPage;
