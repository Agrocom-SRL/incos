/**
 * Detalle de tipo de evaluación — orquestación UI (ficha sd-profile).
 * Gemelo de `IdiomaDetailPage.jsx`.
 */

import { FileDoneOutlined, BarChartOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useTipoEvaluacionDetallePage } from '@application-configuracion/recursos/hooks';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const TipoEvaluacionDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    tipoEvaluacion,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useTipoEvaluacionDetallePage();

  const puedeEditar = hasPermiso('configuracion.tipo-evaluacion', 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de tipo de evaluación"
            breadcrumbItems={breadcrumbItems}
            actions={headerActions}
          />
        }
      >
        <Alert type="error" showIcon title="Identificador de tipo de evaluación inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de tipo de evaluación"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando tipo de evaluación…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !tipoEvaluacion}
        emptyDescription="No se encontró el tipo de evaluación solicitado"
      >
        {tipoEvaluacion ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={tipoEvaluacion.activo !== false}
              title={(tipoEvaluacion.nombre || '—').toUpperCase()}
              subtitle={<><FileDoneOutlined /> {tipoEvaluacion.codigo || 'Tipo de evaluación'}</>}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar tipo de evaluación"
              editAriaLabel="Editar tipo de evaluación"
            />

            <DetailInfoCard title="Información" icon={<FileDoneOutlined />}>
              <DetailField label="Código">{tipoEvaluacion.codigo || '—'}</DetailField>
              <DetailField label="Nombre">{tipoEvaluacion.nombre || '—'}</DetailField>
              <DetailField label="Descripción">{tipoEvaluacion.descripcion || '—'}</DetailField>
              <DetailField label="Recuperatorio">
                {tipoEvaluacion.esRecuperatorio ? 'Sí' : 'No'}
              </DetailField>
            </DetailInfoCard>

            <DetailInfoCard title="Uso en el sistema" icon={<BarChartOutlined />}>
              <DetailField label="Evaluaciones registradas">
                {tipoEvaluacion.cantidadEvaluaciones ?? 0}
              </DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default TipoEvaluacionDetailPage;
