/**
 * ABM de proyecto de grado (alta y edición) — workspace alineado a CFG
 * Académico. Gemelo de `CursoCapacitacionFormPage` (CAP): UNA tarjeta con
 * secciones internas (`ProyectoGradoFormSections`, prop `sections` de
 * `CfgFormWorkspace`), botón guardar en el footer de la tarjeta.
 *
 * Página "dumb": la orquestación vive en `useProyectoGradoFormPage`
 * (la modalidad PSP habilita la sección grupal de integrantes).
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useProyectoGradoFormPage } from '@application-titulacion/proyectos-grado/hooks/state/useProyectoGradoFormPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import ProyectoGradoFormSections from '@titulacion/proyectos-grado/components/organisms/ProyectoGradoFormSections';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const ProyectoGradoFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading,
    submitLoading,
    error,
    formSections,
    modalidadGrupal,
    estudianteOptions,
    buscandoEstudiantes,
    onBuscarEstudiantes,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  } = useProyectoGradoFormPage(mode);

  const saveButton = (
    <ActionButton
      permiso={TITULACION_PERMISOS.proyecto}
      accion={permisoAccion}
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar proyecto
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
            <Alert type="error" showIcon title="Identificador de proyecto inválido" />
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
          <Spin spinning={loading} tip="Cargando proyecto…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <ProyectoGradoFormSections
                  form={form}
                  formSections={formSections}
                  modalidadGrupal={modalidadGrupal}
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

export default ProyectoGradoFormPage;
