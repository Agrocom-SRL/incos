/**
 * Detalle de estado civil — orquestación UI (ficha sd-profile).
 * Gemelo de `IdiomaDetailPage.jsx`.
 */

import { HeartOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useEstadoCivilDetallePage } from '@application-configuracion/complementarios/hooks';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const EstadoCivilDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    estadoCivil,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useEstadoCivilDetallePage();

  const puedeEditar = hasPermiso('configuracion.complementario.estado-civil', 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de estado civil" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de estado civil inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de estado civil" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando estado civil…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !estadoCivil}
        emptyDescription="No se encontró el estado civil solicitado"
      >
        {estadoCivil ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={estadoCivil.activo !== false}
              title={(estadoCivil.nombre || '—').toUpperCase()}
              subtitle={<><HeartOutlined /> {estadoCivil.abreviatura || 'Estado civil'}</>}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar estado civil"
              editAriaLabel="Editar estado civil"
            />

            <DetailInfoCard title="Información" icon={<HeartOutlined />}>
              <DetailField label="Nombre">{estadoCivil.nombre || '—'}</DetailField>
              <DetailField label="Abreviatura">{estadoCivil.abreviatura || '—'}</DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default EstadoCivilDetailPage;
