/**
 * Alta de rol — workspace alineado a RolesListPage (catálogo simple).
 * Gemelo de `configuracion/complementarios/pages/DiscapacidadFormPage.jsx`.
 */

import { Alert, Flex, Form } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { useRolForm } from '@/application/modules/seguridad/hooks';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const RolFormPage = () => {
  const {
    form,
    breadcrumbItems,
    submitLoading,
    submitError,
    formSections,
    handleVolver,
    handleSubmit,
  } = useRolForm();

  const { datosRol } = formSections ?? {};

  const saveButton = (
    <ActionButton
      permiso="seguridad.rol.gestionar"
      accion="CREAR"
      variant="primary"
      size="large"
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Crear rol
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Nuevo rol"
          breadcrumbItems={breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap="middle" className="cfg-academico-page__stack">
            {submitError ? <Alert type="error" showIcon title={submitError} /> : null}

            <Form form={form} layout="vertical" className="cfg-academico-form" disabled={submitLoading}>
              {datosRol?.fields?.length ? (
                <CfgFormWorkspace
                  title={datosRol.title}
                  description={datosRol.description}
                  fields={datosRol.fields}
                  form={form}
                  footer={saveButton}
                />
              ) : null}
            </Form>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default RolFormPage;
