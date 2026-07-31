/**
 * ABM de ficha de seguimiento en clase (registrar y editar) — workspace
 * alineado a CFG Académico. Gemelo de `SesionRefuerzoFormPage`: UNA tarjeta
 * con secciones internas (`FichaSeguimientoFormSections`, prop `sections` de
 * `CfgFormWorkspace`), botón guardar en el footer de la tarjeta.
 *
 * Página "dumb": la orquestación (precarga, submit S3/S4) vive en
 * `useFichaSeguimientoFormPage`.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useFichaSeguimientoFormPage } from '@application-docentes/supervision/hooks/state/useFichaSeguimientoFormPage';
import { SUPERVISION_FICHA_PERMISO } from '@application-docentes/supervision/config/paths';
import FichaSeguimientoFormSections from '../components/organisms/FichaSeguimientoFormSections';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const FichaSeguimientoFormPage = ({ mode = 'create' }) => {
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
  } = useFichaSeguimientoFormPage(mode);

  const saveButton = (
    <ActionButton
      permiso={SUPERVISION_FICHA_PERMISO}
      accion={permisoAccion}
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar ficha
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
            <Alert type="error" showIcon title="Identificador de ficha inválido" />
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
          <Spin spinning={loading} tip="Cargando ficha…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                disabled={loading || submitLoading}
              >
                <FichaSeguimientoFormSections form={form} formSections={formSections} footer={saveButton} />
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default FichaSeguimientoFormPage;
