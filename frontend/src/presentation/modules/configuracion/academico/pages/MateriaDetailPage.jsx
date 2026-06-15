/**
 * Detalle de materia — orquestación UI (ficha sd-profile + tabs).
 */

import { useMemo } from 'react';
import { Alert } from 'antd';
import { BookOutlined, ApartmentOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailTabLabel from '@molecules/DetailTabLabel';
import StatusPill from '@atoms/StatusPill';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailTabsPanel from '@organisms/DetailTabsPanel';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useMateriaDetallePage } from '@application-configuracion/academico/hooks';
import {
  getMateriaClasificacionPillClass,
  getMateriaTipoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';
import MateriaDetailInformacionSection from '@configuracion/academico/components/organisms/MateriaDetailInformacionSection';
import MateriaDetailAsignaturasSection from '@configuracion/academico/components/organisms/MateriaDetailAsignaturasSection';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const MateriaDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    materia,
    loading,
    error,
    isInvalidId,
    tipoLabel,
    avatarInitials,
    cargaHorariaResumen,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useMateriaDetallePage();

  const puedeEditar = hasPermiso('configuracion.materia', 'EDITAR');
  const asignaturas = materia?.asignaturas ?? [];

  const tabItems = useMemo(() => {
    if (!materia) return [];
    return [
      {
        key: 'informacion',
        label: <DetailTabLabel icon={<BookOutlined />}>Información</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <MateriaDetailInformacionSection materia={materia} tipoLabel={tipoLabel} />
          </div>
        ),
      },
      {
        key: 'asignaturas',
        label: <DetailTabLabel icon={<ApartmentOutlined />}>Asignatura de materia</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <MateriaDetailAsignaturasSection asignaturas={asignaturas} />
          </div>
        ),
      },
    ];
  }, [materia, tipoLabel, asignaturas]);

  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader title="Detalle de materia" breadcrumbItems={breadcrumbItems} actions={headerActions} />
        }
      >
        <Alert type="error" showIcon title="Identificador de materia inválido" />
      </PageTemplate>
    );
  }

  const metaExtra = materia ? (
    <>
      <StatusPill label={tipoLabel} className={getMateriaTipoPillClass(materia.tipo)} />
      {materia.clasificacion ? (
        <StatusPill
          label={materia.clasificacion}
          className={getMateriaClasificacionPillClass()}
        />
      ) : null}
    </>
  ) : null;

  return (
    <PageTemplate
      header={
        <PageHeader title="Detalle de materia" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando materia…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !materia}
        emptyDescription="No se encontró la materia solicitada"
      >
        {materia ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={materia.activo !== false}
              title={(materia.nombre || '—').toUpperCase()}
              subtitle={
                <>
                  <BookOutlined /> {materia.sigla || '—'}
                </>
              }
              metaExtra={metaExtra}
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar materia"
              editAriaLabel="Editar materia"
              stats={[
                {
                  label: 'Planes',
                  value:
                    new Set(asignaturas.map((u) => u.planEstudioId).filter(Boolean)).size || '—',
                  primary: true,
                },
                { label: 'Asignaturas', value: asignaturas.length || '—' },
                { label: 'Carga horaria', value: cargaHorariaResumen || '—' },
              ]}
            />
            <DetailTabsPanel items={tabItems} defaultActiveKey="informacion" />
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default MateriaDetailPage;
