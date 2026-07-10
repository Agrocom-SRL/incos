/**
 * Detalle de cuenta de pago — orquestación UI (ficha sd-profile).
 * Gemelo de `BancoDetailPage.jsx`, con la imagen QR (si existe) mostrada vía
 * `Image` de Ant Design (preview nativo). El toggle activo/inactivo vive solo
 * en el listado (`EstadoTogglePill`); esta ficha es de solo lectura +
 * Editar/Eliminar. La edición (incluido el QR) navega a la página completa
 * `CuentaFormPage`. Incluye navegación cruzada al banco y al método de pago
 * asociados (mismo catálogo en memoria de `ConfigPagosContext`).
 */

import { DeleteOutlined, QrcodeOutlined, WalletOutlined } from '@ant-design/icons';
import { Alert, Image, Typography } from 'antd';
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
import { useCuentaDetailPage } from '@application-finanzas/hooks/state/useCuentaDetailPage';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { cuentaEditarPath, bancoDetallePath, metodoDetallePath } from '@application-finanzas/config/paths';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const CuentaDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const navigate = useNavigate();
  const {
    cuenta,
    metodoNombre,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    eliminando,
    handleEliminar,
    handleVolver,
    refetch,
  } = useCuentaDetailPage();

  const puedeEditar = hasPermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const puedeVerDetalle = hasPermiso(CONFIG_PAGOS_PERMISO, 'DETALLE');
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
    <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="ELIMINAR">
      <Button variant="danger" icon={<DeleteOutlined />} loading={eliminando} onClick={handleEliminar}>
        Eliminar
      </Button>
    </PermisoGuard>
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
              onEdit={() => navigate(cuentaEditarPath(cuenta.id))}
              editTooltip="Editar cuenta"
              editAriaLabel="Editar cuenta"
              actions={profileActions}
            />

            <DetailInfoCard title="Información" icon={<WalletOutlined />}>
              <DetailField label="N.° de cuenta">{cuenta.numeroCuenta || '—'}</DetailField>
              <DetailField label="N.° de celular">{cuenta.numeroCelular || '—'}</DetailField>
              <DetailField label="Banco">
                {cuenta.bancoNombre && puedeVerDetalle && cuenta.bancoId ? (
                  <Typography.Link onClick={() => navigate(bancoDetallePath(cuenta.bancoId))}>
                    {cuenta.bancoNombre}
                  </Typography.Link>
                ) : (
                  cuenta.bancoNombre || '—'
                )}
              </DetailField>
              <DetailField label="Método de pago">
                {metodoNombre && puedeVerDetalle && cuenta.metodoPagoId ? (
                  <Typography.Link onClick={() => navigate(metodoDetallePath(cuenta.metodoPagoId))}>
                    {metodoNombre}
                  </Typography.Link>
                ) : (
                  metodoNombre || '—'
                )}
              </DetailField>
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
    </PageTemplate>
  );
};

export default CuentaDetailPage;
