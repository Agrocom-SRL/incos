/**
 * ABM de curso de capacitación (alta y edición) — workspace alineado a CFG
 * Académico. Gemelo de `PlanFormPage`: UNA tarjeta con secciones internas
 * (`CursoCapacitacionFormSections`, prop `sections` de `CfgFormWorkspace`),
 * botón guardar en el footer de la tarjeta.
 *
 * Página "dumb": la orquestación vive en `useCursoCapacitacionFormPage`.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useCursoCapacitacionFormPage } from '@application-capacitacion/cursos/hooks/state/useCursoCapacitacionFormPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import CursoCapacitacionFormSections from '../components/organisms/CursoCapacitacionFormSections';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const CursoCapacitacionFormPage = ({ mode = 'create' }) => {
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
  } = useCursoCapacitacionFormPage(mode);

  const saveButton = (
    <ActionButton
      permiso={CAPACITACION_PERMISOS.curso}
      accion={permisoAccion}
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar curso
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
            <Alert type="error" showIcon title="Identificador de curso inválido" />
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
          <Spin spinning={loading} tip="Cargando curso…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <CursoCapacitacionFormSections
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

export default CursoCapacitacionFormPage;
