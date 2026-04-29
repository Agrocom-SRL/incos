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
        return <UsuarioCategoriaCreacionStepContent key="categoria" form={formInstance} />;
      }
      if (sectionKey === 'perfil') {
        return (
          <UsuarioWizardPerfilStepContent
            key="perfil"
            form={formInstance}
            rolesCatalog={roles}
            prefillDocenteUsuario={prefillDocenteUsuario}
          />
        );
      }
      if (sectionKey === 'cuenta') {
        return (
          <UsuarioWizardCredencialesStepContent
            key="cuenta"
            form={formInstance}
            rolesCatalog={roles}
          />
        );
      }
      return null;
    },
    [roles, prefillDocenteUsuario]
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
            title="Nuevo Usuario"
            breadcrumbItems={breadcrumbItems}
            actions={
              <Button variant="default" icon={<ArrowLeftOutlined />} onClick={goToUsuariosList}>
                Volver
              </Button>
            }
          />
        }
      >
        {submitError ? (
          <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} />
        ) : null}
        <WizardForm
          key={wizardFormMountKey}
          className="seg-usuario-create-wizard"
          steps={wizardSteps}
          form={form}
          loading={loading}
          viewMode={false}
          resolveOptions={() => []}
          initialValues={usuarioAltaInitialValues}
          onFinish={handleFinish}
          showSaveButton={false}
          renderSectionContent={renderSectionContent}
          onValidateBeforeNext={onValidateBeforeNext}
          finishLabel="Crear usuario"
          nextLabel="Siguiente"
          prevLabel="Anterior"
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
