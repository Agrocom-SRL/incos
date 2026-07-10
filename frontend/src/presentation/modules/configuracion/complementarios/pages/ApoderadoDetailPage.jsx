/**
 * Detalle de apoderado (tipo de parentesco) — orquestación UI (ficha sd-profile).
 * Gemelo de `DiscapacidadDetailPage.jsx`.
 */

import { TeamOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useApoderadoDetallePage } from '@application-configuracion/complementarios/hooks';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const ApoderadoDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    apoderado,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useApoderadoDetallePage();

  const puedeEditar = hasPermiso('configuracion.complementario.apoderados', 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de apoderado" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de apoderado inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de apoderado" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando apoderado…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !apoderado}
        emptyDescription="No se encontró el apoderado solicitado"
      >
        {apoderado ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={apoderado.activo !== false}
              title={(apoderado.nombre || '—').toUpperCase()}
              subtitle={<><TeamOutlined /> Apoderado</>}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar apoderado"
              editAriaLabel="Editar apoderado"
              stats={[
                { label: 'Estudiantes', value: apoderado.cantidadEstudiantes ?? 0, primary: true },
                { label: 'Docentes', value: apoderado.cantidadDocentes ?? 0 },
                { label: 'Personal', value: apoderado.cantidadPersonal ?? 0 },
              ]}
            />

            <DetailInfoCard title="Información" icon={<TeamOutlined />}>
              <DetailField label="Nombre">{apoderado.nombre || '—'}</DetailField>
              <DetailField label="Descripción" span={2}>
                {apoderado.descripcion || '—'}
              </DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default ApoderadoDetailPage;
