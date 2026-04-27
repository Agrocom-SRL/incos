/**
 * Último paso del wizard: vista previa tipo ficha (carga + calendario), resumen, carga horaria y tabla de asignaciones.
 */

import { Link } from 'react-router-dom';
import { Alert, InputNumber, Spin, Table, Typography, Space, Divider } from 'antd';
import { Card } from '@atoms';
import DocenteAssignmentsSection from '@docentes/components/organisms/DocenteAssignmentsSection';
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
  onCargaHorariaChange,
  asignaciones = [],
  loadingAsignaciones = false,
  errorAsignaciones = null,
  asignacionesColumns,
  returnListPath = '/docentes/listar',
  menuSidebarKey = 'DOC-LIST',
  /** Fila única para DocenteAssignmentCard (curso a registrar) */
  previewAssignment = null,
  courseSchedulesPreview = [],
  loadingHorariosPreview = false,
  errorHorariosPreview = null,
}) {
  const previewList = previewAssignment ? [previewAssignment] : [];

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
                <Text strong>Docente:</Text> {docenteNombre || `ID ${docenteId}`}
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

      {previewAssignment ? (
        <>
          <Typography.Title level={5} style={{ marginTop: 4, marginBottom: 8 }}>
            Vista previa de la asignación
          </Typography.Title>
          <DocenteAssignmentsSection assignments={previewList} puedeAsignarMaterias={false} />
          <Divider style={{ margin: '20px 0' }} />
          <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
            Horario semanal del curso elegido
          </Typography.Title>
          {errorHorariosPreview ? (
            <Alert type="error" showIcon style={{ marginBottom: 12 }} message={errorHorariosPreview} />
          ) : null}
          <Spin spinning={loadingHorariosPreview}>
            <DocenteSchedulesSection courseSchedules={courseSchedulesPreview} puedeAsignarMaterias={false} />
          </Spin>
          <Divider style={{ margin: '24px 0' }} />
        </>
      ) : null}

      {docenteId != null ? (
        <div className="daa-asignacion-actions" style={{ marginBottom: 16 }}>
          <div className="daa-asignacion-actions__inner">
            <Space wrap align="end">
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  Carga horaria (opcional)
                </Text>
                <InputNumber
                  min={0}
                  max={200}
                  value={cargaHorariaOpt}
                  onChange={onCargaHorariaChange}
                  placeholder="—"
                />
              </div>
            </Space>
            <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0, fontSize: 13 }}>
              Usá el botón <Text strong>Registrar asignación</Text> en la barra inferior del asistente para guardar.
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
          <div style={{ marginTop: 12 }}>
            <Link to={`/docentes/${docenteId}`} state={{ returnListPath, menuSidebarKey }}>
              Ver ficha del docente
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
