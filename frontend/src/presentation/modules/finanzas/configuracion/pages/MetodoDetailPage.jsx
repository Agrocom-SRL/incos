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
import { Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader, DetailRelatedList } from '@molecules';
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

            <DetailInfoCard title="Bancos que usan este método" icon={<BankOutlined />} cols={1}>
              <DetailRelatedList
                items={bancosDelMetodo.map((banco) => ({
                  key: banco.id,
                  icon: <BankOutlined />,
                  label: banco.nombre || `Banco #${banco.id}`,
                  caption: banco.codigo || null,
                  onClick: puedeVerDetalle ? () => navigate(bancoDetallePath(banco.id)) : undefined,
                }))}
                emptyText="Ningún banco usa este método de pago"
              />
            </DetailInfoCard>

            <DetailInfoCard title="Cuentas que usan este método" icon={<WalletOutlined />} cols={1}>
              <DetailRelatedList
                items={cuentasDelMetodo.map((cuenta) => ({
                  key: cuenta.id,
                  icon: <WalletOutlined />,
                  label: cuenta.numeroCuenta || cuenta.nombreTitular || `Cuenta #${cuenta.id}`,
                  caption:
                    cuenta.nombreTitular && cuenta.numeroCuenta ? cuenta.nombreTitular : null,
                  onClick: puedeVerDetalle ? () => navigate(cuentaDetallePath(cuenta.id)) : undefined,
                }))}
                emptyText="Ninguna cuenta usa este método de pago"
              />
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default MetodoDetailPage;
