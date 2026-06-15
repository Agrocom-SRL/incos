import { useCallback } from 'react';
import { Alert, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadUsuarioCreatePageContext } from '@/application/modules/seguridad/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { WizardForm } from '@organisms';
import UsuarioCategoriaCreacionStepContent from '@modules/seguridad/components/organisms/UsuarioCategoriaCreacionStepContent.jsx';
import UsuarioWizardPerfilStepContent from '@modules/seguridad/components/organisms/UsuarioWizardPerfilStepContent.jsx';
import UsuarioWizardCredencialesStepContent from '@modules/seguridad/components/organisms/UsuarioWizardCredencialesStepContent.jsx';
import '@modules/seguridad/styles/seguridad.css';

export default function UsuarioCreatePage() {
  const {
    form,
    roles,
    loading,
    submitError,
    prefillDocenteUsuario,
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
    [roles, prefillDocenteUsuario, isEditMode, categoriaFijada]
  );

  return (
    <PermisoGuard
      codigo="seguridad.usuario.crear"
      accion="CREAR"
      fallback={
        <Typography.Text type="danger">No tiene permiso para crear usuarios.</Typography.Text>
      }
    >
      <PageTemplate
        header={
          <PageHeader
            title={isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
            breadcrumbItems={breadcrumbItems}
            actions={
              <Button variant="back" icon={<ArrowLeftOutlined />} onClick={goToUsuariosList}>
                Volver
              </Button>
            }
          />
        }
      >
        {submitError ? (
          <Alert type="error" showIcon title={submitError} style={{ marginBottom: 16 }} />
        ) : null}
        <WizardForm
          key={wizardFormMountKey}
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
          finishLabel={isEditMode ? 'Guardar cambios' : 'Crear usuario'}
          nextLabel="Siguiente"
          prevLabel="Anterior"
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
