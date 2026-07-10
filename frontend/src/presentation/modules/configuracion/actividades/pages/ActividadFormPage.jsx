/**
 * ABM actividad — workspace alineado al catálogo académico.
 * Gemelo de `academico/pages/MateriaFormPage.jsx`. Campo `icono`: selector
 * visual (`FormIconPicker`) + preview inline del string kebab-case guardado.
 */

import { Alert, Flex, Form, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { useActividadForm } from '@application-configuracion/actividades/hooks';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@configuracion/actividades/styles/form-icon-picker.css';

const { Text } = Typography;

const ActividadFormPage = ({ mode = 'create' }) => {
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
  } = useActividadForm(mode);

  const { datosActividad } = formSections ?? {};
  const iconoValue = Form.useWatch('icono', form);

  const saveButton = (
    <ActionButton
      permiso="configuracion.actividad"
      accion={permisoAccion}
      variant="primary"
      size="large"
      loading={submitLoading}
      onClick={handleSubmit}
    >
      Guardar actividad
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
            <Alert type="error" showIcon title="Identificador de actividad inválido" />
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
          <Spin spinning={loading} tip="Cargando actividad…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}

              <Form
                form={form}
                layout="vertical"
                className="cfg-academico-form"
                initialValues={initialValues}
                disabled={loading || submitLoading}
              >
                {datosActividad?.fields?.length ? (
                  <CfgFormWorkspace
                    title={datosActividad.title}
                    description={datosActividad.description}
                    fields={datosActividad.fields}
                    form={form}
                    footer={saveButton}
                    afterField={{
                      icono: iconoValue ? (
                        <Text type="secondary">
                          Preview: <Text code>{iconoValue}</Text>
                        </Text>
                      ) : null,
                    }}
                  />
                ) : null}
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default ActividadFormPage;
