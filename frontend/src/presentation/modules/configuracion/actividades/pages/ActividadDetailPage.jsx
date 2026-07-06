/**
 * Detalle de actividad — orquestación UI (ficha sd-profile).
 * Gemelo de `academico/pages/MateriaDetailPage.jsx` (catálogo simple, sin tabs).
 */

import { CalendarOutlined } from '@ant-design/icons';
import { Alert, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import StatusPill from '@atoms/StatusPill';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useActividadDetallePage } from '@application-configuracion/actividades/hooks';
import { getActividadTipoPillClass } from '@application-configuracion/actividades/config/actividadTipoPill';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Text } = Typography;

const ActividadDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    actividad,
    loading,
    error,
    isInvalidId,
    tipoLabel,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useActividadDetallePage();

  const puedeEditar = hasPermiso('configuracion.actividad', 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={<PageHeader title="Detalle de actividad" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
      >
        <Alert type="error" showIcon title="Identificador de actividad inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={<PageHeader title="Detalle de actividad" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando actividad…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !actividad}
        emptyDescription="No se encontró la actividad solicitada"
      >
        {actividad ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={actividad.activo !== false}
              title={(actividad.nombre || '—').toUpperCase()}
              subtitle={<><CalendarOutlined /> {tipoLabel}</>}
              metaExtra={
                <>
                  <StatusPill label={tipoLabel} className={getActividadTipoPillClass(actividad.tipo)} />
                  {actividad.esDestacada ? (
                    <StatusPill label="Destacada" className="cfg-materia-pill cfg-materia-pill--activa" />
                  ) : null}
                </>
              }
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar actividad"
              editAriaLabel="Editar actividad"
            />

            <DetailInfoCard title="Información" icon={<CalendarOutlined />}>
              <DetailField label="Nombre">{actividad.nombre || '—'}</DetailField>
              <DetailField label="Tipo">{tipoLabel}</DetailField>
              <DetailField label="Icono">
                {actividad.icono ? <Text code>{actividad.icono}</Text> : '—'}
              </DetailField>
              <DetailField label="Destacada">{actividad.esDestacada ? 'Sí' : 'No'}</DetailField>
              <DetailField label="Descripción" span={2}>
                {actividad.descripcion || '—'}
              </DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default ActividadDetailPage;
