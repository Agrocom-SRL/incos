/**
 * MiBoletinPage — portal del estudiante (rama ESTUDIANTE del ítem Calificaciones).
 *
 * Se presenta como una FICHA DE DETALLE: cabecera de perfil (sd-profile) con el
 * estudiante + una tarjeta con sus calificaciones por asignatura, replicando el
 * look de las grillas del módulo (notas centradas, nota final destacada, Tag de
 * estado). SOLO LECTURA salvo la descarga del PDF del boletín (única descarga
 * permitida al estudiante). La lógica vive en `useMiBoletin`.
 */

import { DownloadOutlined } from '@ant-design/icons';
import { App, Empty, Tag } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader, DataTable } from '@molecules';
import { Button } from '@atoms';
import { DetailPageShell, DetailProfileCard } from '@organisms';
import { buildInitials } from '@application/utils/formatters';
import { useMiBoletin } from '@application-academico/calificaciones/hooks/state/useMiBoletin.js';
import { miBoletinColumns } from '@academico/calificaciones/config/miBoletinColumns.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';
import '../styles/mi-boletin.css';

/** Etiqueta legible de la gestión (nombre o año). */
const gestionLabel = (gestion) => {
  if (!gestion) return null;
  return gestion.nombre || gestion.anio || null;
};

const MiBoletinPage = () => {
  const { message } = App.useApp();
  const {
    boletin,
    asignaturas,
    loading,
    error,
    descargando,
    descargarPdf,
    breadcrumbItems,
  } = useMiBoletin();

  const handleDescargar = async () => {
    const result = await descargarPdf();
    if (!result?.success) {
      message.error(result?.error || 'No se pudo descargar el boletín');
    }
  };

  const estudiante = boletin?.estudiante;
  const carrera = boletin?.carrera?.nombre || null;
  const gestion = gestionLabel(boletin?.gestion);
  const sinNotas = !loading && !error && boletin && asignaturas.length === 0;

  // Subtítulo de la cabecera: "carrera · gestión" (omite las partes ausentes).
  const subtitulo = [carrera, gestion].filter(Boolean).join(' · ') || null;

  const promedio =
    boletin?.promedioGeneral != null ? boletin.promedioGeneral : '—';

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Mi boletín"
          breadcrumbItems={breadcrumbItems}
          actions={
            boletin ? (
              <Button
                variant="primary"
                icon={<DownloadOutlined />}
                loading={descargando}
                onClick={handleDescargar}
              >
                Descargar PDF
              </Button>
            ) : null
          }
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando tu boletín…"
        error={error}
        showEmpty={!loading && !error && !boletin}
        emptyDescription="No se encontró su boletín."
      >
        {boletin ? (
          <>
            <DetailProfileCard
              avatarInitials={buildInitials(estudiante?.nombreCompleto)}
              avatarClassName="sd-profile__avatar sd-profile__avatar--default"
              title={estudiante?.nombreCompleto || '—'}
              subtitle={subtitulo}
              metaExtra={
                gestion ? (
                  <Tag color="green" className="mi-boletin__gestion-tag">
                    Gestión {gestion}
                  </Tag>
                ) : null
              }
              stats={[
                { label: 'Código', value: estudiante?.codigo || '—' },
                { label: 'C.I.', value: estudiante?.ci || '—' },
                { label: 'Promedio general', value: promedio, primary: true },
              ]}
            />

            {sinNotas ? (
              <Empty description="Aún no hay notas registradas." />
            ) : (
              <DataTable
                className="mi-boletin-grid"
                dataSource={asignaturas}
                columns={miBoletinColumns}
                rowKey={(record) => record.asignaturaSigla || record.asignaturaNombre}
                pagination={false}
                bordered
                scroll={{ x: 'max-content' }}
              />
            )}
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default MiBoletinPage;
