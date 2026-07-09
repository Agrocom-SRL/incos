/**
 * Detalle de método de pago — orquestación UI (ficha sd-profile). Catálogo fijo
 * (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO): sin eliminar, solo ver/editar el nombre
 * y activar/desactivar. Gemelo simplificado de `BancoDetailPage.jsx`. La
 * edición navega a la página completa `MetodoFormPage`.
 */

import { CheckCircleOutlined, CreditCardOutlined, StopOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { Button } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { useAuthContext } from '@application-auth';
import { useMetodoDetailPage } from '@application-finanzas/hooks/state/useMetodoDetailPage';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { metodoEditarPath } from '@application-finanzas/config/paths';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const MetodoDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const navigate = useNavigate();
  const {
    metodo,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    saving,
    handleToggleActivo,
    handleVolver,
    refetch,
  } = useMetodoDetailPage();

  const puedeEditar = hasPermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de método de pago" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de método de pago inválido" />
      </PageTemplate>
    );
  }

  const profileActions = metodo ? (
    <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="EDITAR">
      <Button
        variant={metodo.activo ? 'warning' : 'success'}
        icon={metodo.activo ? <StopOutlined /> : <CheckCircleOutlined />}
        loading={saving}
        onClick={handleToggleActivo}
      >
        {metodo.activo ? 'Desactivar' : 'Activar'}
      </Button>
    </PermisoGuard>
  ) : null;

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de método de pago" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando método de pago…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !metodo}
        emptyDescription="No se encontró el método de pago solicitado"
      >
        {metodo ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={metodo.activo !== false}
              title={(metodo.nombre || '—').toUpperCase()}
              subtitle={
                <>
                  <CreditCardOutlined /> Método de pago
                </>
              }
              showEdit={puedeEditar}
              onEdit={() => navigate(metodoEditarPath(metodo.id))}
              editTooltip="Editar método"
              editAriaLabel="Editar método"
              actions={profileActions}
            />

            <DetailInfoCard title="Información" icon={<CreditCardOutlined />}>
              <DetailField label="Código">{metodo.codigo || '—'}</DetailField>
              <DetailField label="Nombre visible">{metodo.nombre || '—'}</DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default MetodoDetailPage;
