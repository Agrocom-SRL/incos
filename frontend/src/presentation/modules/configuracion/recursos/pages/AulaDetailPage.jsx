/**
 * Detalle de aula — orquestación UI (ficha sd-profile).
 * Gemelo de `IdiomaDetailPage.jsx`.
 */

import { BankOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useAulaDetallePage } from '@application-configuracion/recursos/hooks';
import { getAulaCategoriaLabel } from '@application-configuracion/recursos/config/aulaCategoriaOptions';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const AulaDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    aula,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useAulaDetallePage();

  const puedeEditar = hasPermiso('configuracion.aula', 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de aula" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de aula inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de aula" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando aula…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !aula}
        emptyDescription="No se encontró el aula solicitada"
      >
        {aula ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={aula.activo !== false}
              title={(aula.nombre || '—').toUpperCase()}
              subtitle={<><BankOutlined /> {aula.codigo || getAulaCategoriaLabel(aula.categoria)}</>}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar aula"
              editAriaLabel="Editar aula"
            />

            <DetailInfoCard title="Información" icon={<BankOutlined />}>
              <DetailField label="Código">{aula.codigo || '—'}</DetailField>
              <DetailField label="Nombre">{aula.nombre || '—'}</DetailField>
              <DetailField label="Categoría">{getAulaCategoriaLabel(aula.categoria)}</DetailField>
              <DetailField label="Capacidad">
                {aula.capacidad != null ? `${aula.capacidad} personas` : '—'}
              </DetailField>
              <DetailField label="Observaciones">{aula.observaciones || '—'}</DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default AulaDetailPage;
