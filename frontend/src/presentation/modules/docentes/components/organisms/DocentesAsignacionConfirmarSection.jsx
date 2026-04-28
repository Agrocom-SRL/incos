/**
 * Último paso del wizard: resumen, horario semanal, carga horaria estimada y tabla de asignaciones.
 */

import { Alert, Spin, Table, Typography } from 'antd';
import { Card } from '@atoms';
import DocenteSchedulesSection from '@docentes/components/organisms/DocenteSchedulesSection';

const { Text, Paragraph } = Typography;

export default function DocentesAsignacionConfirmarSection({
  planLabel,
  periodoLabel,
  paraleloLabel,
  cursoLabel,
  docenteId,
  docenteNombre,
  cargaHorariaOpt,
  asignaciones = [],
  loadingAsignaciones = false,
  errorAsignaciones = null,
  asignacionesColumns,
  courseSchedulesPreview = [],
  loadingHorariosPreview = false,
  errorHorariosPreview = null,
}) {
  return (
    <Card
      title="Resumen y registro"
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section daa-asignacion-section"
    >
      <Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 12 }}>
        Revisá la selección y el <Text strong>horario semanal del curso</Text> antes de confirmar. El botón{' '}
        <Text strong>Registrar asignación</Text> envía la fila al servidor.
      </Paragraph>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Selección actual"
        description={
          <ul className="daa-asignacion-resumen-list">
            {docenteId != null && (
              <li>
                <Text strong>Docente:</Text> {docenteNombre || 'No especificado'}
              </li>
            )}
            <li>
              <Text strong>Plan:</Text> {planLabel || '—'}
            </li>
            <li>
              <Text strong>Periodo:</Text> {periodoLabel || '—'}
            </li>
            <li>
              <Text strong>Paralelo:</Text> {paraleloLabel || '—'}
            </li>
            <li>
              <Text strong>Curso:</Text> {cursoLabel || '—'}
            </li>
          </ul>
        }
      />

      <Typography.Title level={5} style={{ marginTop: 4, marginBottom: 8 }}>
        Horario semanal del curso elegido
      </Typography.Title>
      {errorHorariosPreview ? (
        <Alert type="error" showIcon style={{ marginBottom: 12 }} message={errorHorariosPreview} />
      ) : null}
      <Spin spinning={loadingHorariosPreview}>
        <DocenteSchedulesSection courseSchedules={courseSchedulesPreview} puedeAsignarMaterias={false} />
      </Spin>

      {docenteId != null ? (
        <div className="daa-asignacion-actions" style={{ marginBottom: 16 }}>
          <div className="daa-asignacion-actions__inner">
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
              Carga horaria semanal estimada
            </Text>
            <Text strong>{cargaHorariaOpt ?? '—'} h</Text>
            <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0, fontSize: 13 }}>
              Se calcula automáticamente según la cantidad de bloques del horario del curso.
            </Paragraph>
          </div>
        </div>
      ) : (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Sin docente en contexto"
          description="No se puede registrar una asignación sin docente. Podés volver a la lista y abrir esta pantalla desde la fila del docente."
        />
      )}

      <Typography.Title level={5} style={{ marginTop: 8, marginBottom: 8 }}>
        Asignaciones actuales del docente
      </Typography.Title>
      {!docenteId ? (
        <Alert type="info" showIcon message="Elegí un docente para ver la tabla" />
      ) : (
        <>
          {errorAsignaciones && (
            <Alert type="error" showIcon style={{ marginBottom: 12 }} message={errorAsignaciones} />
          )}
          <Spin spinning={loadingAsignaciones}>
            <Table
              size="small"
              rowKey="id"
              columns={asignacionesColumns}
              dataSource={asignaciones}
              pagination={{ pageSize: 6, showSizeChanger: true }}
              locale={{ emptyText: loadingAsignaciones ? ' ' : 'Sin asignaciones para este docente' }}
            />
          </Spin>
        </>
      )}
    </Card>
  );
}
