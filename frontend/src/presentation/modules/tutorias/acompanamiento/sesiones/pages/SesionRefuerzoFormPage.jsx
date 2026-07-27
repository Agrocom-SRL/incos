/**
 * ABM de sesión de refuerzo (programar y editar) — workspace alineado a
 * CFG Académico. Gemelo de `CursoCapacitacionFormPage`: UNA tarjeta con
 * secciones internas (`SesionRefuerzoFormSections`, prop `sections` de
 * `CfgFormWorkspace`), botón guardar en el footer de la tarjeta.
 *
 * Página "dumb": la orquestación (precarga, alumno preseleccionado desde
 * "Mis alumnos en riesgo", submit A6/A7) vive en
 * `useSesionRefuerzoFormPage`.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useSesionRefuerzoFormPage } from '@application-tutorias/acompanamiento/sesiones/hooks/state/useSesionRefuerzoFormPage';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import SesionRefuerzoFormSections from '../components/organisms/SesionRefuerzoFormSections';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const SesionRefuerzoFormPage = ({ mode = 'create' }) => {
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
  } = useSesionRefuerzoFormPage(mode);

  const saveButton = (
    <ActionButton
      permiso={TUTORIAS_PERMISOS.sesion}
      accion={permisoAccion}
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar sesión
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
            <Alert type="error" showIcon title="Identificador de sesión inválido" />
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
          <Spin spinning={loading} tip="Cargando sesión…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <SesionRefuerzoFormSections
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

export default SesionRefuerzoFormPage;
