/**
 * Detalle de banco autorizado — orquestación UI (ficha sd-profile).
 * Gemelo simplificado de `configuracion/complementarios/pages/DiscapacidadDetailPage.jsx`,
 * con acciones extra en `DetailProfileCard` (activar/desactivar + eliminar) y el
 * Drawer de edición reutilizado (`BancoDrawer`).
 */

import { BankOutlined, CheckCircleOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
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
import { useBancoDetailPage } from '@application-finanzas/hooks/state/useBancoDetailPage';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import BancoDrawer from '@finanzas/configuracion/components/BancoDrawer.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const BancoDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    banco,
    metodos,
    metodoNombre,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    saving,
    eliminando,
    drawerAbierto,
    abrirDrawer,
    cerrarDrawer,
    guardarBancoSubmit,
    handleToggleActivo,
    handleEliminar,
    handleVolver,
    refetch,
  } = useBancoDetailPage();

  const puedeEditar = hasPermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de banco" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de banco inválido" />
      </PageTemplate>
    );
  }

  const profileActions = banco ? (
    <>
      <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="EDITAR">
        <Button
          variant={banco.activo ? 'warning' : 'success'}
          icon={banco.activo ? <StopOutlined /> : <CheckCircleOutlined />}
          loading={saving}
          onClick={handleToggleActivo}
        >
          {banco.activo ? 'Desactivar' : 'Activar'}
        </Button>
      </PermisoGuard>
      <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="ELIMINAR">
        <Button variant="danger" icon={<DeleteOutlined />} loading={eliminando} onClick={handleEliminar}>
          Eliminar
        </Button>
      </PermisoGuard>
    </>
  ) : null;

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de banco" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando banco…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !banco}
        emptyDescription="No se encontró el banco solicitado"
      >
        {banco ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={banco.activo !== false}
              title={(banco.nombre || '—').toUpperCase()}
              subtitle={
                <>
                  <BankOutlined /> Banco autorizado
                </>
              }
              showEdit={puedeEditar}
              onEdit={abrirDrawer}
              editTooltip="Editar banco"
              editAriaLabel="Editar banco"
              actions={profileActions}
            />

            <DetailInfoCard title="Información" icon={<BankOutlined />}>
              <DetailField label="Código">{banco.codigo || '—'}</DetailField>
              <DetailField label="Nombre">{banco.nombre || '—'}</DetailField>
              <DetailField label="Método de pago asociado">{metodoNombre || '—'}</DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>

      <BancoDrawer
        open={drawerAbierto}
        banco={banco}
        metodos={metodos}
        saving={saving}
        onGuardar={guardarBancoSubmit}
        onCancelar={cerrarDrawer}
      />
    </PageTemplate>
  );
};

export default BancoDetailPage;
