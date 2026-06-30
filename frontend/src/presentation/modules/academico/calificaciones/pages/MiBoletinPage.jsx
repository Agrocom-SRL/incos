/**
 * MiBoletinPage — portal del estudiante (rama ESTUDIANTE del ítem Calificaciones).
 *
 * SOLO LECTURA salvo la descarga del PDF del boletín (única descarga permitida al
 * estudiante). La lógica vive en `useMiBoletin`.
 */

import {
  BookOutlined,
  DownloadOutlined,
  IdcardOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { App, Empty, Statistic } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard, DataTable } from '@molecules';
import { DetailField, Button } from '@atoms';
import { DetailPageShell } from '@organisms';
import { useMiBoletin } from '@application-academico/calificaciones/hooks/state/useMiBoletin.js';
import { miBoletinColumns } from '@academico/calificaciones/config/miBoletinColumns.jsx';

const gestionLabel = (gestion) => {
  if (!gestion) return '—';
  return gestion.nombre || gestion.anio || '—';
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
  const sinNotas = !loading && !error && boletin && asignaturas.length === 0;

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
        emptyDescription="No se encontró tu boletín."
      >
        {boletin ? (
          <>
            <DetailInfoCard title="Datos del estudiante" icon={<IdcardOutlined />} cols={3}>
              <DetailField label="Estudiante">{estudiante?.nombreCompleto || '—'}</DetailField>
              <DetailField label="Código">{estudiante?.codigo || '—'}</DetailField>
              <DetailField label="C.I.">{estudiante?.ci || '—'}</DetailField>
              <DetailField label="Carrera" span={2}>
                {boletin.carrera?.nombre || '—'}
              </DetailField>
              <DetailField label="Gestión">{gestionLabel(boletin.gestion)}</DetailField>
            </DetailInfoCard>

            <DetailInfoCard
              title="Calificaciones por asignatura"
              icon={<BookOutlined />}
              cols={1}
              extra={
                boletin.promedioGeneral != null ? (
                  <Statistic
                    title="Promedio general"
                    value={boletin.promedioGeneral}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ fontSize: 'inherit' }}
                  />
                ) : null
              }
            >
              {sinNotas ? (
                <Empty description="Aún no hay notas registradas." />
              ) : (
                <DataTable
                  dataSource={asignaturas}
                  columns={miBoletinColumns}
                  rowKey={(record) => record.asignaturaSigla || record.asignaturaNombre}
                  pagination={false}
                  size="small"
                />
              )}
            </DetailInfoCard>
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default MiBoletinPage;
