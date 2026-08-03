/**
 * ABM de trámite de pasantía (alta y edición) — workspace alineado a CFG
 * Académico. Gemelo de `ProyectoGradoFormPage` (TIT · Titulación): UNA
 * tarjeta con secciones internas (`PasantiaFormSections`, prop `sections` de
 * `CfgFormWorkspace`), botón guardar en el footer de la tarjeta.
 *
 * Página "dumb": la orquestación vive en `usePasantiaFormPage`
 * (el camino CONVALIDACION agrega la sección de contrato).
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { usePasantiaFormPage } from '@application-titulacion/pasantias/hooks/state/usePasantiaFormPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import PasantiaFormSections from '@titulacion/pasantias/components/organisms/PasantiaFormSections';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const PasantiaFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading,
    submitLoading,
    error,
    formSections,
    estudianteOptions,
    buscandoEstudiantes,
    onBuscarEstudiantes,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  } = usePasantiaFormPage(mode);

  const saveButton = (
    <ActionButton
      permiso={TITULACION_PERMISOS.pasantia}
      accion={permisoAccion}
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar trámite
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
            <Alert type="error" showIcon title="Identificador de trámite inválido" />
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
          <Spin spinning={loading} tip="Cargando trámite…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <PasantiaFormSections
                  form={form}
                  formSections={formSections}
                  estudianteOptions={estudianteOptions}
                  buscandoEstudiantes={buscandoEstudiantes}
                  onBuscarEstudiantes={onBuscarEstudiantes}
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

export default PasantiaFormPage;
