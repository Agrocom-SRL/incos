/**
 * Detalle de banco autorizado — orquestación UI (ficha sd-profile).
 * Gemelo simplificado de `configuracion/complementarios/pages/DiscapacidadDetailPage.jsx`,
 * con acción de eliminar en `DetailProfileCard` (el toggle activo/inactivo vive
 * solo en el listado, `EstadoTogglePill`; esta ficha es de solo lectura +
 * Editar/Eliminar). La edición navega a la página completa `BancoFormPage`.
 * Incluye navegación cruzada al método de pago asociado y a las cuentas de
 * este banco (mismo catálogo en memoria de `ConfigPagosContext`).
 */

import { BankOutlined, DeleteOutlined, WalletOutlined } from '@ant-design/icons';
import { Alert, Typography } from 'antd';
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
import { useBancoDetailPage } from '@application-finanzas/hooks/state/useBancoDetailPage';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { bancoEditarPath, metodoDetallePath, cuentaDetallePath } from '@application-finanzas/config/paths';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const BancoDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const navigate = useNavigate();
  const {
    banco,
    metodoNombre,
    cuentasDelBanco,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    eliminando,
    handleEliminar,
    handleVolver,
    refetch,
  } = useBancoDetailPage();

  const puedeEditar = hasPermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const puedeVerDetalle = hasPermiso(CONFIG_PAGOS_PERMISO, 'DETALLE');
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
    <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="ELIMINAR">
      <Button variant="danger" icon={<DeleteOutlined />} loading={eliminando} onClick={handleEliminar}>
        Eliminar
      </Button>
    </PermisoGuard>
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
              onEdit={() => navigate(bancoEditarPath(banco.id))}
              editTooltip="Editar banco"
              editAriaLabel="Editar banco"
              actions={profileActions}
            />

            <DetailInfoCard title="Información" icon={<BankOutlined />}>
              <DetailField label="Código">{banco.codigo || '—'}</DetailField>
              <DetailField label="Nombre">{banco.nombre || '—'}</DetailField>
              <DetailField label="Método de pago asociado">
                {metodoNombre && puedeVerDetalle && banco.metodoPagoId ? (
                  <Typography.Link onClick={() => navigate(metodoDetallePath(banco.metodoPagoId))}>
                    {metodoNombre}
                  </Typography.Link>
                ) : (
                  metodoNombre || '—'
                )}
              </DetailField>
            </DetailInfoCard>

            <DetailInfoCard title="Cuentas de este banco" icon={<WalletOutlined />}>
              {cuentasDelBanco.length > 0 ? (
                cuentasDelBanco.map((cuenta) => (
                  <DetailField
                    key={cuenta.id}
                    label={cuenta.nombreTitular || cuenta.numeroCuenta || 'Cuenta'}
                    span={2}
                  >
                    {puedeVerDetalle ? (
                      <Typography.Link onClick={() => navigate(cuentaDetallePath(cuenta.id))}>
                        {cuenta.numeroCuenta || cuenta.nombreTitular || `Cuenta #${cuenta.id}`}
                      </Typography.Link>
                    ) : (
                      cuenta.numeroCuenta || cuenta.nombreTitular || '—'
                    )}
                  </DetailField>
                ))
              ) : (
                <DetailField label="Cuentas" span={2}>
                  Este banco aún no tiene cuentas registradas
                </DetailField>
              )}
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default BancoDetailPage;
