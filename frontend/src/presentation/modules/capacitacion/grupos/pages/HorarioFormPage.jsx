/**
 * ABM de horario de capacitación (alta y edición) — workspace alineado a CFG
 * Académico. Gemelo de `ParticipanteFormPage`: una sola sección, sin modal ni
 * drawer.
 *
 * Página "dumb": la orquestación vive en `useHorarioFormPage`.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useHorarioFormPage } from '@application-capacitacion/grupos/hooks/state/useHorarioFormPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import HorarioFormFields from '../components/organisms/HorarioFormFields';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const HorarioFormPage = ({ mode = 'create' }) => {
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
  } = useHorarioFormPage(mode);

  const backAction = <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />;

  const saveButton = (
    <ActionButton
      permiso={CAPACITACION_PERMISOS.grupo}
      accion={permisoAccion}
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar horario
    </ActionButton>
  );

  if (isInvalidEditId) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={backAction} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert type="error" showIcon title="Identificador de horario inválido" />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={backAction} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={loading} tip="Cargando horario…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <CfgFormWorkspace
                  title="Datos del horario"
                  description="Franja de día y hora que se asigna a los grupos de los cursos de capacitación."
                  fields={[]}
                  form={form}
                  footer={saveButton}
                  beforeFields={<HorarioFormFields disabled={loading || submitLoading} />}
                />
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default HorarioFormPage;
