/**
 * Detalle de cuenta de pago — orquestación UI (ficha sd-profile).
 * Gemelo de `BancoDetailPage.jsx`, con la imagen QR (si existe) mostrada vía
 * `Image` de Ant Design (preview nativo) y el Drawer reutilizado (`CuentaDrawer`).
 */

import {
  CheckCircleOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  StopOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Alert, Image } from 'antd';
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
import { useCuentaDetailPage } from '@application-finanzas/hooks/state/useCuentaDetailPage';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import CuentaDrawer from '@finanzas/configuracion/components/CuentaDrawer.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const CuentaDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    cuenta,
    metodos,
    bancos,
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
    guardarCuentaSubmit,
    handleToggleActivo,
    handleEliminar,
    handleVolver,
    refetch,
  } = useCuentaDetailPage();

  const puedeEditar = hasPermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de cuenta" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de cuenta inválido" />
      </PageTemplate>
    );
  }

  const profileActions = cuenta ? (
    <>
      <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="EDITAR">
        <Button
          variant={cuenta.activo ? 'warning' : 'success'}
          icon={cuenta.activo ? <StopOutlined /> : <CheckCircleOutlined />}
          loading={saving}
          onClick={handleToggleActivo}
        >
          {cuenta.activo ? 'Desactivar' : 'Activar'}
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
        <PageHeader title="Detalle de cuenta" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando cuenta…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !cuenta}
        emptyDescription="No se encontró la cuenta solicitada"
      >
        {cuenta ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={cuenta.activo !== false}
              title={(cuenta.nombreTitular || '—').toUpperCase()}
              subtitle={
                <>
                  <WalletOutlined /> Cuenta de pago
                </>
              }
              showEdit={puedeEditar}
              onEdit={abrirDrawer}
              editTooltip="Editar cuenta"
              editAriaLabel="Editar cuenta"
              actions={profileActions}
            />

            <DetailInfoCard title="Información" icon={<WalletOutlined />}>
              <DetailField label="N.° de cuenta">{cuenta.numeroCuenta || '—'}</DetailField>
              <DetailField label="N.° de celular">{cuenta.numeroCelular || '—'}</DetailField>
              <DetailField label="Banco">{cuenta.bancoNombre || '—'}</DetailField>
              <DetailField label="Método de pago">{metodoNombre || '—'}</DetailField>
            </DetailInfoCard>

            <DetailInfoCard title="QR de cobro" icon={<QrcodeOutlined />}>
              <DetailField label="Imagen QR" span={2}>
                {cuenta.qrImagenUrl ? (
                  <Image src={cuenta.qrImagenUrl} alt="QR de cobro" width={140} />
                ) : (
                  '—'
                )}
              </DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>

      <CuentaDrawer
        open={drawerAbierto}
        cuenta={cuenta}
        metodos={metodos}
        bancos={bancos}
        saving={saving}
        onGuardar={guardarCuentaSubmit}
        onCancelar={cerrarDrawer}
      />
    </PageTemplate>
  );
};

export default CuentaDetailPage;
