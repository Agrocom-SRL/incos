import { useCallback } from 'react';
import { Flex, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadUsuarioCreatePageContext } from '@/application/modules/seguridad/hooks';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import { WizardForm } from '@organisms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import UsuarioCategoriaCreacionStepContent from '@modules/seguridad/usuarios/components/organisms/UsuarioCategoriaCreacionStepContent.jsx';
import UsuarioWizardPerfilStepContent from '@modules/seguridad/usuarios/components/organisms/UsuarioWizardPerfilStepContent.jsx';
import UsuarioWizardCredencialesStepContent from '@modules/seguridad/usuarios/components/organisms/UsuarioWizardCredencialesStepContent.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@modules/seguridad/styles/seguridad.css';
import '@configuracion/academico/styles/academico-form-page.css';

export default function UsuarioCreatePage() {
  const {
    form,
    roles,
    loading,
    submitError,
    prefillDocenteUsuario,
    prefillEstudianteUsuario,
    isEditMode,
    categoriaFijada,
    wizardInitialStep,
    wizardFormMountKey,
    breadcrumbItems,
    wizardSteps,
    usuarioAltaInitialValues,
    onValidateBeforeNext,
    handleFinish,
    goToUsuariosList,
  } = useSeguridadUsuarioCreatePageContext();

  const renderSectionContent = useCallback(
    (_stepIndex, sectionKey, _section, formInstance) => {
      if (sectionKey === 'categoria') {
        return (
          <UsuarioCategoriaCreacionStepContent
            key="categoria"
            form={formInstance}
            isEditMode={isEditMode}
          />
        );
      }
      if (sectionKey === 'perfil') {
        return (
          <UsuarioWizardPerfilStepContent
            key="perfil"
            form={formInstance}
            rolesCatalog={roles}
            prefillDocenteUsuario={prefillDocenteUsuario}
            prefillEstudianteUsuario={prefillEstudianteUsuario}
            isEditMode={isEditMode}
            categoriaFijada={categoriaFijada}
          />
        );
      }
      if (sectionKey === 'cuenta') {
        return (
          <UsuarioWizardCredencialesStepContent
            key="cuenta"
            form={formInstance}
            rolesCatalog={roles}
            isEditMode={isEditMode}
          />
        );
      }
      return null;
    },
    [roles, prefillDocenteUsuario, prefillEstudianteUsuario, isEditMode, categoriaFijada]
  );

  return (
    <PermisoGuard
      codigo="seguridad.usuario.crear"
      accion="CREAR"
      fallback={
        <Typography.Text type="danger">No tiene permiso para crear usuarios.</Typography.Text>
      }
    >
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title={isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
            breadcrumbItems={breadcrumbItems}
            actions={
              <BackButton icon={<ArrowLeftOutlined />} onClick={goToUsuariosList}>
                Volver
              </BackButton>
            }
          />
        </PageHeaderArea>

        <DashboardPageShell>
          <MainContent>
            <WizardForm
              key={wizardFormMountKey}
              variant="tabs"
              className="seg-usuario-create-wizard"
              steps={wizardSteps}
              form={form}
              loading={loading}
              viewMode={false}
              resolveOptions={() => []}
              initialStep={wizardInitialStep}
              initialValues={usuarioAltaInitialValues}
              onFinish={handleFinish}
              showSaveButton={false}
              renderSectionContent={renderSectionContent}
              onValidateBeforeNext={onValidateBeforeNext}
              errorMessage={submitError}
              finishLabel={isEditMode ? 'Guardar cambios' : 'Crear usuario'}
              nextLabel="Siguiente"
              prevLabel="Anterior"
            />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    </PermisoGuard>
  );
}
