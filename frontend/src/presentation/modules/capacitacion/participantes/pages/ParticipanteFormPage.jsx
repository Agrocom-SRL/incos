/**
 * ABM de participante de capacitación (alta y edición) — workspace alineado a
 * CFG Académico. Gemelo de `CarreraFormPage`: una sola sección, sin modal ni
 * drawer.
 *
 * Página "dumb": la orquestación vive en `useParticipanteFormPage`.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useParticipanteFormPage } from '@application-capacitacion/participantes/hooks/state/useParticipanteFormPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import ParticipanteFormSections from '../components/organisms/ParticipanteFormSections';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const ParticipanteFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading,
    submitLoading,
    error,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  } = useParticipanteFormPage(mode);

  const saveButton = (
    <ActionButton
      permiso={CAPACITACION_PERMISOS.participante}
      accion={permisoAccion}
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar participante
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
            <Alert type="error" showIcon title="Identificador de participante inválido" />
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
          <Spin spinning={loading} tip="Cargando participante…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <ParticipanteFormSections
                  form={form}
                  footer={saveButton}
                  disabled={loading || submitLoading}
                />
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default ParticipanteFormPage;
