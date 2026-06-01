/**
 * Detalle de paralelo maestro.
 */

import { Alert } from 'antd';
import { TeamOutlined, ApartmentOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailTabLabel from '@molecules/DetailTabLabel';
import StatusPill from '@atoms/StatusPill';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailTabsPanel from '@organisms/DetailTabsPanel';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import { useAuthContext } from '@application-auth';
import { useParaleloDetallePage } from '@application-configuracion/academico/hooks';
import {
  getMateriaEstadoLabel,
  getMateriaEstadoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';
import { getParaleloTurnoPillClass } from '@application-configuracion/academico/config/paraleloTurnoOptions';
import { getParaleloPeriodoPillClass } from '@application-configuracion/academico/config/paraleloPeriodoPill';
import ParaleloPeriodoCell from '../components/atoms/ParaleloPeriodoCell';
import ParaleloDetailOfertaSection from '../components/organisms/ParaleloDetailOfertaSection';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const ParaleloDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    paralelo,
    carrera,
    instanciasGestion,
    instanciasLoading,
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useParaleloDetallePage();

  const puedeEditar = hasPermiso('configuracion.paralelo', 'EDITAR');
  const estadoLabel = getMateriaEstadoLabel(paralelo?.activo);
  const estadoPillClass = getMateriaEstadoPillClass(paralelo?.activo);

  const carreraLabel =
    carrera?.nombre ?? paralelo?.carreraNombre ?? (carrera?.codigo ? carrera.codigo : '—');

  const periodoLabel =
    paralelo?.periodoNombre ||
    (paralelo?.periodoNumero != null ? `${paralelo.periodoNumero}º año` : '—');

  const tabItems = paralelo
    ? [
        {
          key: 'informacion',
          label: <DetailTabLabel icon={<TeamOutlined />}>Información</DetailTabLabel>,
          children: (
            <div className="sd-tab-body">
              <DetailInfoCard title="Datos del paralelo">
                <DetailField label="Carrera">{carreraLabel}</DetailField>
                <DetailField label="Periodo">
                  {periodoLabel !== '—' ? (
                    <ParaleloPeriodoCell
                      periodoNumero={paralelo.periodoNumero}
                      periodoNombre={paralelo.periodoNombre}
                      descripcion={paralelo.descripcion}
                      showDescripcion={false}
                    />
                  ) : (
                    '—'
                  )}
                </DetailField>
                <DetailField label="Turno">
                  {paralelo.turno ? (
                    <StatusPill
                      label={paralelo.turno}
                      className={getParaleloTurnoPillClass(paralelo.turno)}
                    />
                  ) : (
                    '—'
                  )}
                </DetailField>
                <DetailField label="Descripción" span={2}>
                  {paralelo.descripcion || '—'}
                </DetailField>
              </DetailInfoCard>
            </div>
          ),
        },
        {
          key: 'oferta',
          label: <DetailTabLabel icon={<ApartmentOutlined />}>Oferta académica</DetailTabLabel>,
          children: (
            <div className="sd-tab-body">
              <ParaleloDetailOfertaSection
                instancias={instanciasGestion}
                loading={instanciasLoading}
                paralelo={paralelo}
                carrera={carrera}
              />
            </div>
          ),
        },
      ]
    : [];

  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de paralelo" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon message="Identificador de paralelo inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de paralelo" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando paralelo…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !paralelo}
        emptyDescription="No se encontró el paralelo solicitado"
      >
        {paralelo ? (
          <>
            <DetailProfileCard
              avatarInitials={(paralelo.nombre || 'P').slice(0, 2).toUpperCase()}
              active={paralelo.activo !== false}
              title={paralelo.nombre}
              subtitle={
                <>
                  <StatusPill label={paralelo.turno} className={getParaleloTurnoPillClass(paralelo.turno)} />
                  {carrera?.codigo ? ` · ${carrera.codigo}` : ''}
                  {paralelo.periodoNumero != null ? (
                    <>
                      {' · '}
                      <StatusPill
                        label={`${paralelo.periodoNumero}º año`}
                        className={getParaleloPeriodoPillClass(paralelo.periodoNumero)}
                      />
                    </>
                  ) : null}
                </>
              }
              metaExtra={<StatusPill label={estadoLabel} className={estadoPillClass} />}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar paralelo"
              editAriaLabel="Editar paralelo"
            />
            <DetailTabsPanel items={tabItems} defaultActiveKey="informacion" />
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default ParaleloDetailPage;
