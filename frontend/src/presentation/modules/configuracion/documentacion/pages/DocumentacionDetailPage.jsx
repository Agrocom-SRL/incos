/**
 * Detalle de un documento — 1 sola página compartida por los 4 tipos de
 * documentación. Gemelo de `DiscapacidadDetailPage.jsx` (complementarios).
 */

import { FileTextOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import DetailField from '@atoms/DetailField';
import StatusPill from '@atoms/StatusPill';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useDocumentacionDetallePage } from '@application-configuracion/documentacion/hooks';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const DocumentacionDetailPage = ({ tipoConfig }) => {
  const { hasPermiso } = useAuthContext();
  const {
    documento,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useDocumentacionDetallePage(tipoConfig);

  const puedeEditar = hasPermiso(tipoConfig.permisoCodigo, 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;
  const tituloFicha = `Detalle de documento · ${tipoConfig.label}`;

  if (isInvalidId) {
    return (
      <PageTemplate header={<PageHeader title={tituloFicha} breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
        <Alert type="error" showIcon title="Identificador de documento inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate header={<PageHeader title={tituloFicha} breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando documento…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !documento}
        emptyDescription="No se encontró el documento solicitado"
      >
        {documento ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              active={documento.activo !== false}
              title={(documento.nombre || '—').toUpperCase()}
              subtitle={<><FileTextOutlined /> {tipoConfig.label}</>}
              metaExtra={
                <>
                  <StatusPill
                    label={documento.requerido ? 'Requerido' : 'Opcional'}
                    className={
                      documento.requerido
                        ? 'cfg-materia-pill cfg-materia-pill--activa'
                        : 'cfg-materia-pill cfg-materia-pill--default'
                    }
                  />
                  <StatusPill
                    label={documento.aceptaFotocopia ? 'Acepta fotocopia' : 'No acepta fotocopia'}
                    className={
                      documento.aceptaFotocopia
                        ? 'cfg-materia-pill cfg-materia-pill--activa'
                        : 'cfg-materia-pill cfg-materia-pill--inactiva'
                    }
                  />
                </>
              }
              showEdit={puedeEditar}
              onEdit={handleEditar}
              editTooltip="Editar documento"
              editAriaLabel="Editar documento"
            />

            <DetailInfoCard title="Información" icon={<FileTextOutlined />}>
              <DetailField label="Nombre">{documento.nombre || '—'}</DetailField>
              <DetailField label="Orden">{documento.orden ?? '—'}</DetailField>
              <DetailField label="Documento padre">
                {documento.documentoPadreId ? `#${documento.documentoPadreId}` : 'Ninguno'}
              </DetailField>
              <DetailField label="Documento del sistema">
                {documento.esDocumentoSistema ? 'Sí' : 'No'}
              </DetailField>
              <DetailField label="Descripción" span={2}>
                {documento.descripcion || '—'}
              </DetailField>
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default DocumentacionDetailPage;
