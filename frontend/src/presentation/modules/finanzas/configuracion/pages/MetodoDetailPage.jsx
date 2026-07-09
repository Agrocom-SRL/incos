/**
 * Detalle de método de pago — orquestación UI (ficha sd-profile). Catálogo fijo
 * (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO): sin eliminar, solo ver/editar el nombre.
 * El toggle activo/inactivo vive únicamente en el listado (`EstadoTogglePill`);
 * esta ficha es de solo lectura + Editar. Gemelo simplificado de
 * `BancoDetailPage.jsx`. La edición navega a la página completa
 * `MetodoFormPage`. Incluye navegación cruzada a los bancos/cuentas que usan
 * este método (mismo catálogo en memoria de `ConfigPagosContext`).
 */

import { BankOutlined, CreditCardOutlined, WalletOutlined } from '@ant-design/icons';
import { Alert, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useMetodoDetailPage } from '@application-finanzas/hooks/state/useMetodoDetailPage';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { metodoEditarPath, bancoDetallePath, cuentaDetallePath } from '@application-finanzas/config/paths';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const MetodoDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const navigate = useNavigate();
  const {
    metodo,
    bancosDelMetodo,
    cuentasDelMetodo,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    refetch,
  } = useMetodoDetailPage();

  const puedeEditar = hasPermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const puedeVerDetalle = hasPermiso(CONFIG_PAGOS_PERMISO, 'DETALLE');
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
            />

            <DetailInfoCard title="Información" icon={<CreditCardOutlined />}>
              <DetailField label="Código">{metodo.codigo || '—'}</DetailField>
              <DetailField label="Nombre visible">{metodo.nombre || '—'}</DetailField>
            </DetailInfoCard>

            <DetailInfoCard title="Bancos que usan este método" icon={<BankOutlined />}>
              {bancosDelMetodo.length > 0 ? (
                bancosDelMetodo.map((banco) => (
                  <DetailField key={banco.id} label={banco.codigo || 'Banco'} span={2}>
                    {puedeVerDetalle ? (
                      <Typography.Link onClick={() => navigate(bancoDetallePath(banco.id))}>
                        {banco.nombre || `Banco #${banco.id}`}
                      </Typography.Link>
                    ) : (
                      banco.nombre || '—'
                    )}
                  </DetailField>
                ))
              ) : (
                <DetailField label="Bancos" span={2}>
                  Ningún banco usa este método de pago
                </DetailField>
              )}
            </DetailInfoCard>

            <DetailInfoCard title="Cuentas que usan este método" icon={<WalletOutlined />}>
              {cuentasDelMetodo.length > 0 ? (
                cuentasDelMetodo.map((cuenta) => (
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
                  Ninguna cuenta usa este método de pago
                </DetailField>
              )}
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default MetodoDetailPage;
