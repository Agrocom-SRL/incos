/**
 * Detalle de idioma — orquestación UI (ficha sd-profile).
 * Gemelo de `DiscapacidadDetailPage.jsx`.
 */

import { GlobalOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useIdiomaDetallePage } from '@application-configuracion/complementarios/hooks';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const IdiomaDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    idioma,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useIdiomaDetallePage();

  const puedeEditar = hasPermiso('configuracion.complementario.idiomas', 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de idioma" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de idioma inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de idioma" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando idioma…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !idioma}
        emptyDescription="No se encontró el idioma solicitado"
      >
        {idioma ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={idioma.activo !== false}
              title={(idioma.nombre || '—').toUpperCase()}
              subtitle={<><GlobalOutlined /> {idioma.codigoIso || 'Idioma'}</>}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar idioma"
              editAriaLabel="Editar idioma"
              stats={[
                { label: 'Estudiantes', value: idioma.cantidadEstudiantes ?? 0, primary: true },
                { label: 'Docentes', value: idioma.cantidadDocentes ?? 0 },
                { label: 'Personal', value: idioma.cantidadPersonal ?? 0 },
              ]}
            />

            <DetailInfoCard title="Información" icon={<GlobalOutlined />}>
              <DetailField label="Nombre">{idioma.nombre || '—'}</DetailField>
              <DetailField label="Código ISO">{idioma.codigoIso || '—'}</DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default IdiomaDetailPage;
