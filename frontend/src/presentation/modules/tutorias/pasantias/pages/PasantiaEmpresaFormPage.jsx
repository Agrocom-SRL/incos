/**
 * ABM de empresa del catálogo de pasantías (alta y edición) — workspace
 * alineado a CFG Académico. Gemelo de `PasantiaFormPage`: UNA tarjeta
 * (`CfgFormWorkspace`, prop `sections` declarativas del hook), botón guardar
 * en el footer de la tarjeta.
 *
 * Página "dumb": la orquestación vive en `usePasantiaEmpresaFormPage`.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { usePasantiaEmpresaFormPage } from '@application-tutorias/pasantias/hooks/state/usePasantiaEmpresaFormPage';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const PasantiaEmpresaFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading,
    submitLoading,
    error,
    formSections,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  } = usePasantiaEmpresaFormPage(mode);

  const saveButton = (
    <ActionButton
      permiso={TUTORIAS_PERMISOS.pasantiaEmpresa}
      accion={permisoAccion}
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar empresa
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
            <Alert type="error" showIcon title="Identificador de empresa inválido" />
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
          <Spin spinning={loading} tip="Cargando empresa…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <CfgFormWorkspace
                  title={formSections.datosEmpresa.title}
                  description={formSections.datosEmpresa.description}
                  form={form}
                  footer={saveButton}
                  sections={[
                    { key: 'datosEmpresa', fields: formSections.datosEmpresa.fields },
                    { key: 'contacto', ...formSections.contacto },
                  ]}
                />
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default PasantiaEmpresaFormPage;
