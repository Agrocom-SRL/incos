/**
 * Detalle de un documento — pantalla única para los 9 tipos del ENUM.
 * Gemelo de `actividades/pages/ActividadDetailPage.jsx`: subtítulo = tipo con
 * su ícono (documentacionTipoIconMap), pills de nivel (base/reemplazo) y
 * requisitos, y ficha con nivel («Reemplaza a …»), orden y estado.
 */

import { createElement } from 'react';
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
import { getDocumentacionTipoIcon } from '@configuracion/documentacion/config/documentacionTipoIconMap';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const DocumentacionDetailPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    documento,
    documentoPadreNombre,
    tipoLabel,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useDocumentacionDetallePage();

  const puedeEditar = hasPermiso('configuracion.documentacion', 'EDITAR');
  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={<PageHeader title="Detalle de documento" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
      >
        <Alert type="error" showIcon title="Identificador de documento inválido" />
      </PageTemplate>
    );
  }

  const esBase = documento?.documentoPadreId == null;
  const reemplazaALabel = esBase
    ? 'Documento base (primer orden)'
    : `Reemplaza a «${documentoPadreNombre ?? `#${documento?.documentoPadreId}`}»`;

  return (
    <PageTemplate
      header={<PageHeader title="Detalle de documento" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
    >
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
              subtitle={
                <>
                  {createElement(getDocumentacionTipoIcon(documento.tipoDocumento), {
                    'aria-hidden': true,
                  })}{' '}
                  {tipoLabel}
                </>
              }
              metaExtra={
                <>
                  <StatusPill
                    label={esBase ? 'Documento base' : 'Reemplazo'}
                    className={
                      esBase
                        ? 'cfg-materia-pill cfg-materia-pill--primary'
                        : 'cfg-materia-pill cfg-materia-pill--info'
                    }
                  />
                  <StatusPill
                    label={documento.requerido ? 'Requerido' : 'Opcional'}
                    className={
                      documento.requerido
                        ? 'cfg-materia-pill cfg-materia-pill--danger'
                        : 'cfg-materia-pill cfg-materia-pill--default'
                    }
                  />
                  <StatusPill
                    label={documento.aceptaFotocopia ? 'Acepta fotocopia' : 'Solo original'}
                    className={
                      documento.aceptaFotocopia
                        ? 'cfg-materia-pill cfg-materia-pill--success'
                        : 'cfg-materia-pill cfg-materia-pill--default'
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
              <DetailField label="Tipo de documento">{tipoLabel}</DetailField>
              <DetailField label="Nivel">{reemplazaALabel}</DetailField>
              <DetailField label="Requerido">{documento.requerido ? 'Sí' : 'No'}</DetailField>
              <DetailField label="Acepta fotocopia">
                {documento.aceptaFotocopia ? 'Sí' : 'No'}
              </DetailField>
              <DetailField label="Orden">{documento.orden ?? '—'}</DetailField>
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
