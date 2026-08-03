/**
 * MiBoletinPage — portal del estudiante (rama ESTUDIANTE del ítem Calificaciones).
 *
 * Se presenta como una FICHA DE DETALLE: cabecera de perfil (sd-profile) con el
 * estudiante + una tarjeta con sus calificaciones por asignatura, replicando el
 * look de las grillas del módulo (notas centradas, nota final destacada, Tag de
 * estado). SOLO LECTURA salvo la descarga del PDF del boletín (única descarga
 * permitida al estudiante): el botón «Descargar PDF» abre un menú para elegir
 * el boletín ANUAL o el de un bimestre (1º–4º). La lógica vive en `useMiBoletin`.
 */

import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import { App, Dropdown, Empty, Tag } from 'antd';
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

  const handleDescargar = async (bimestre = null) => {
    const result = await descargarPdf(bimestre != null ? { bimestre } : undefined);
    if (!result?.success) {
      message.error(result?.error || 'No se pudo descargar su boletín');
    }
  };

  // Menú de descarga: boletín ANUAL (4 bimestres, como siempre) o boletín de un
  // BIMESTRE (desglose teórica/práctica/total de ese bimestre).
  const menuDescarga = {
    items: [
      { key: 'anual', label: 'Boletín anual' },
      { type: 'divider' },
      { key: '1', label: 'Boletín del 1º bimestre' },
      { key: '2', label: 'Boletín del 2º bimestre' },
      { key: '3', label: 'Boletín del 3º bimestre' },
      { key: '4', label: 'Boletín del 4º bimestre' },
    ],
    onClick: ({ key }) => handleDescargar(key === 'anual' ? null : Number(key)),
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
              <Dropdown
                menu={menuDescarga}
                trigger={['click']}
                placement="bottomRight"
                disabled={descargando}
              >
                <Button
                  variant="primary"
                  icon={<DownloadOutlined />}
                  loading={descargando}
                  title="Descargue su boletín anual o el de un bimestre"
                >
                  Descargar PDF <DownOutlined />
                </Button>
              </Dropdown>
            ) : null
          }
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando su boletín…"
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
