/**
 * Detalle de aula — orquestación UI (ficha sd-profile).
 * Gemelo de `IdiomaDetailPage.jsx`.
 */

import { ApartmentOutlined, BankOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader, DetailRelatedList } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useAulaDetallePage } from '@application-configuracion/recursos/hooks';
import { getAulaCategoriaLabel } from '@application-configuracion/recursos/config/aulaCategoriaOptions';
import { paraleloDetallePath } from '@application-configuracion/recursos/config/paths';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const AulaDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const navigate = useNavigate();
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
  const puedeVerParalelo = hasPermiso('configuracion.paralelo', 'DETALLE');
  const paralelosQueUsanAula = aula?.paralelosQueUsanAula ?? [];
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
              stats={[
                { label: 'Paralelos que usan esta aula', value: paralelosQueUsanAula.length, primary: true },
              ]}
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

            <DetailInfoCard title="Paralelos que usan esta aula" icon={<ApartmentOutlined />} cols={1}>
              <DetailRelatedList
                items={paralelosQueUsanAula.map((p) => ({
                  key: p.paraleloId,
                  icon: <ApartmentOutlined />,
                  label: p.paraleloNombre || `Paralelo #${p.paraleloId}`,
                  caption: [p.materiaNombre, p.carreraNombre, p.docenteNombre].filter(Boolean).join(' · ') || null,
                  onClick:
                    puedeVerParalelo && p.paraleloId
                      ? () => navigate(paraleloDetallePath(p.paraleloId))
                      : undefined,
                }))}
                emptyText="Ningún paralelo usa esta aula actualmente"
              />
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default AulaDetailPage;
