/**
 * Detalle de tipo de discapacidad — orquestación UI (ficha sd-profile).
 * Gemelo simplificado de `academico/pages/MateriaDetailPage.jsx` (catálogo simple,
 * sin tabs: una sola sección de información).
 */

import { SolutionOutlined, TeamOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useDiscapacidadDetallePage } from '@application-configuracion/complementarios/hooks';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const DiscapacidadDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    discapacidad,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useDiscapacidadDetallePage();

  const puedeEditar = hasPermiso('configuracion.complementario.discapacidad', 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de tipo de discapacidad"
            breadcrumbItems={breadcrumbItems}
            actions={headerActions}
          />
        }
      >
        <Alert type="error" showIcon title="Identificador de tipo de discapacidad inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de tipo de discapacidad"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando tipo de discapacidad…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !discapacidad}
        emptyDescription="No se encontró el tipo de discapacidad solicitado"
      >
        {discapacidad ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={discapacidad.activo !== false}
              title={(discapacidad.nombre || '—').toUpperCase()}
              subtitle={<><SolutionOutlined /> Tipo de discapacidad</>}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar tipo de discapacidad"
              editAriaLabel="Editar tipo de discapacidad"
            />

            <DetailInfoCard title="Información" icon={<SolutionOutlined />}>
              <DetailField label="Nombre">{discapacidad.nombre || '—'}</DetailField>
              <DetailField label="Descripción" span={2}>
                {discapacidad.descripcion || '—'}
              </DetailField>
            </DetailInfoCard>

            <DetailInfoCard title="Uso en el sistema" icon={<TeamOutlined />} cols={3}>
              <DetailField label="Estudiantes">{discapacidad.cantidadEstudiantes ?? 0}</DetailField>
              <DetailField label="Docentes">{discapacidad.cantidadDocentes ?? 0}</DetailField>
              <DetailField label="Personal">{discapacidad.cantidadPersonal ?? 0}</DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default DiscapacidadDetailPage;
