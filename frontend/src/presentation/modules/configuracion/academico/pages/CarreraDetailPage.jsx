/**
 * Detalle de carrera — orquestación UI (ficha sd-profile + tabs).
 */

import { useMemo } from 'react';
import { Alert } from 'antd';
import { BookOutlined, TeamOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailTabLabel from '@molecules/DetailTabLabel';
import StatusPill from '@atoms/StatusPill';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailTabsPanel from '@organisms/DetailTabsPanel';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { useAuthContext } from '@application-auth';
import { useCarreraDetallePage } from '@application-configuracion/academico/hooks';
import {
  getMateriaEstadoLabel,
  getMateriaEstadoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';
import CarreraDetailInformacionSection from '@configuracion/academico/components/organisms/CarreraDetailInformacionSection';
import CarreraDetailMateriasSection from '@configuracion/academico/components/organisms/CarreraDetailMateriasSection';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const CarreraDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    carrera,
    periodos,
    totalMaterias,
    planVigente,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    avatarColor,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useCarreraDetallePage();

  const puedeEditar = hasPermiso('configuracion.carrera', 'EDITAR');
  const puedeVerMateria = hasPermiso('configuracion.materia', 'DETALLE');

  const accent = sanitizeDocenteColorHex(avatarColor) || undefined;
  const estadoLabel = getMateriaEstadoLabel(carrera?.activo);
  const estadoPillClass = getMateriaEstadoPillClass(carrera?.activo);

  const tabItems = useMemo(() => {
    if (!carrera) return [];
    return [
      {
        key: 'informacion',
        label: <DetailTabLabel icon={<TeamOutlined />}>Información</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <CarreraDetailInformacionSection carrera={carrera} planVigente={planVigente} />
          </div>
        ),
      },
      {
        key: 'materias',
        label: <DetailTabLabel icon={<BookOutlined />}>Materias por periodo</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <CarreraDetailMateriasSection periodos={periodos} puedeVerMateria={puedeVerMateria} />
          </div>
        ),
      },
    ];
  }, [carrera, periodos, planVigente, puedeVerMateria]);

  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de carrera" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de carrera inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de carrera" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando carrera…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !carrera}
        emptyDescription="No se encontró la carrera solicitada"
      >
        {carrera ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarStyle={accent ? { backgroundColor: accent } : undefined}
              active={carrera.activo !== false}
              title={carrera.nombre}
              subtitle={
                <>
                  <TeamOutlined /> {carrera.codigo}
                  {carrera.areaFormacion ? ` · ${carrera.areaFormacion}` : ''}
                </>
              }
              metaExtra={<StatusPill label={estadoLabel} className={estadoPillClass} />}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar carrera"
              editAriaLabel="Editar carrera"
              stats={[
                { label: 'Materias', value: totalMaterias || '—', primary: true },
                { label: 'Periodos', value: periodos.length || '—' },
                { label: 'Título', value: carrera.tituloOtorgado || '—' },
              ]}
            />
            <DetailTabsPanel items={tabItems} defaultActiveKey="informacion" />
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default CarreraDetailPage;
