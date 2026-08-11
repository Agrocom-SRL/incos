/**
 * Registrar acta de defensa de grado — página propia (TIT · extensión
 * 2026-08-11, proyecto·APROBAR). Antes era `RegistrarActaDefensaModal`: se
 * convirtió en página (workspace alineado a `ProyectoGradoFormPage`, misma
 * tarjeta `CfgFormWorkspace` con secciones tituladas vía
 * `RegistrarActaDefensaFormSections`) por volumen de datos — fecha/hora, 3
 * miembros de tribunal (2 campos c/u) y una calificación por integrante
 * activo no entraban cómodos en un modal.
 *
 * Página "dumb": la orquestación (breadcrumbs, "Volver" a la lista de
 * origen, submit + navegación a la ficha) vive en `useRegistrarActaDefensaPage`.
 */

import { Alert, Flex, Form, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { useRegistrarActaDefensaPage } from '@application-titulacion/proyectos-grado/hooks/state/useRegistrarActaDefensaPage';
import RegistrarActaDefensaFormSections from '@titulacion/proyectos-grado/components/organisms/RegistrarActaDefensaFormSections';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Title } = Typography;

const RegistrarActaDefensaPage = () => {
  const {
    form,
    proyecto,
    loading,
    error,
    breadcrumbItems,
    integrantesActivos,
    docentes,
    loadingDocentes,
    docentesDisponible,
    saving,
    submitError,
    handleVolver,
    handleSubmit,
  } = useRegistrarActaDefensaPage();

  const sinIntegrantesActivos = !loading && integrantesActivos.length === 0;

  const saveButton = (
    <ActionButton
      permiso={TITULACION_PERMISOS.proyecto}
      accion="APROBAR"
      variant="primary"
      size="large"
      icon={<SaveOutlined />}
      loading={saving}
      disabled={loading || !docentesDisponible || sinIntegrantesActivos}
      onClick={handleSubmit}
    >
      Registrar acta
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Registrar acta de defensa"
          breadcrumbItems={breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
              Volver
            </BackButton>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={loading} tip="Cargando proyecto…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {error ? <Alert type="error" showIcon title={error} /> : null}
              {submitError ? <Alert type="error" showIcon title={submitError} /> : null}

              {proyecto ? (
                <Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>
                  {proyecto.titulo}
                </Title>
              ) : null}

              {!docentesDisponible ? (
                <Alert type="warning" showIcon title="Catálogo de docentes no disponible para su rol" />
              ) : sinIntegrantesActivos ? (
                <Alert
                  type="warning"
                  showIcon
                  title="El proyecto no tiene integrantes activos"
                  description="No es posible registrar el acta sin al menos un estudiante activo en el proyecto."
                />
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  className="cfg-academico-form"
                  disabled={loading || saving}
                >
                  <RegistrarActaDefensaFormSections
                    form={form}
                    integrantesActivos={integrantesActivos}
                    docentes={docentes}
                    loadingDocentes={loadingDocentes}
                    footer={saveButton}
                  />
                </Form>
              )}
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default RegistrarActaDefensaPage;
