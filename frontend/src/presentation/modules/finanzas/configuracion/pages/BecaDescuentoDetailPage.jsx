/**
 * Detalle de una beca o descuento del catálogo maestro — orquestación UI
 * (ficha sd-profile). Gemelo de
 * `configuracion/complementarios/pages/DiscapacidadDetailPage.jsx`, con botón
 * "Eliminar" adicional (con confirmación) en el slot `actions` de
 * `DetailProfileCard`. Editar navega al formulario de página completa
 * (`BecaDescuentoFormPage` modo edit), no hay drawer.
 */

import { DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { Button } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { useAuthContext } from '@application-auth';
import { useBecaDescuentoDetallePage } from '@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoDetallePage';
import { BECA_DESCUENTO_PERMISO } from '@finanzas/configuracion/config/becaDescuentoPermisos';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const TIPO_AUTOMATICA_LABEL = {
  PROMEDIO_90: 'Por promedio (≥ 90)',
  MANUAL: 'Manual',
};

const BecaDescuentoDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    beca,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    eliminando,
    handleVolver,
    handleEditar,
    handleEliminar,
    refetch,
  } = useBecaDescuentoDetallePage();

  const puedeEditar = hasPermiso(BECA_DESCUENTO_PERMISO, 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de beca o descuento"
            breadcrumbItems={breadcrumbItems}
            actions={headerActions}
          />
        }
      >
        <Alert type="error" showIcon title="Identificador de beca o descuento inválido" />
      </PageTemplate>
    );
  }

  const profileActions = beca ? (
    <PermisoGuard codigo={BECA_DESCUENTO_PERMISO} accion="ELIMINAR">
      <Button variant="danger" icon={<DeleteOutlined />} loading={eliminando} onClick={handleEliminar}>
        Eliminar
      </Button>
    </PermisoGuard>
  ) : null;

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de beca o descuento"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando beca o descuento…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !beca}
        emptyDescription="No se encontró la beca o descuento solicitada"
      >
        {beca ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={beca.activo !== false}
              title={(beca.nombre || '—').toUpperCase()}
              subtitle={
                <>
                  <GiftOutlined /> Beca o descuento
                </>
              }
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar beca o descuento"
              editAriaLabel="Editar beca o descuento"
              actions={profileActions}
            />

            <DetailInfoCard title="Información" icon={<GiftOutlined />}>
              <DetailField label="Código">{beca.codigo || '—'}</DetailField>
              <DetailField label="Porcentaje">
                {beca.porcentaje != null ? `${beca.porcentaje}%` : '—'}
              </DetailField>
              <DetailField label="Descripción" span={2}>
                {beca.descripcion || '—'}
              </DetailField>
            </DetailInfoCard>

            <DetailInfoCard title="Reglas de aplicación" icon={<GiftOutlined />}>
              <DetailField label="Requiere documentación">
                {beca.requiereDocumentacion ? 'Sí' : 'No'}
              </DetailField>
              <DetailField label="Requiere aprobación del Rector">
                {beca.requiereAprobacionRector ? 'Sí' : 'No'}
              </DetailField>
              <DetailField label="Asignación automática">
                {beca.esAutomatica ? 'Sí' : 'No'}
              </DetailField>
              {beca.esAutomatica ? (
                <DetailField label="Tipo de asignación automática">
                  {TIPO_AUTOMATICA_LABEL[beca.tipoAutomatica] || beca.tipoAutomatica || '—'}
                </DetailField>
              ) : null}
              {beca.esAutomatica && beca.tipoAutomatica === 'PROMEDIO_90' ? (
                <DetailField label="Promedio mínimo">{beca.promedioMinimo ?? '—'}</DetailField>
              ) : null}
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default BecaDescuentoDetailPage;
