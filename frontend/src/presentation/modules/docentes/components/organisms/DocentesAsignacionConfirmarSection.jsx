/**
 * Último paso del wizard: resumen de la materia ofertada a vincular al docente.
 * El armado de bloques horarios es Institucional → Gestión de horarios.
 */

import { Alert, Typography } from 'antd';
import { Card } from '@atoms';

const { Text, Paragraph } = Typography;

export default function DocentesAsignacionConfirmarSection({
  planLabel,
  periodoLabel,
  paraleloLabel,
  cursoLabel,
  docenteId,
  docenteNombre,
  horasSemanalesPlan,
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
        Revisá la selección antes de confirmar. Esta acción vincula al docente con la{' '}
        <Text strong>materia ofertada</Text> en la gestión. Los bloques de horario se arman después en{' '}
        <Text strong>Institucional → Gestión de horarios</Text>.
      </Paragraph>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="Selección actual"
        description={
          <ul className="daa-asignacion-resumen-list">
            {docenteId != null && (
              <li>
                <Text strong>Docente:</Text> {docenteNombre || 'No especificado'}
              </li>
            )}
            <li>
              <Text strong>Plan habilitado:</Text> {planLabel || '—'}
            </li>
            <li>
              <Text strong>Periodo del plan:</Text> {periodoLabel || '—'}
            </li>
            <li>
              <Text strong>Paralelo en gestión:</Text> {paraleloLabel || '—'}
            </li>
            <li>
              <Text strong>Materia ofertada:</Text> {cursoLabel || '—'}
            </li>
            {horasSemanalesPlan != null ? (
              <li>
                <Text strong>Carga según plan:</Text> {horasSemanalesPlan} h/semana
              </li>
            ) : null}
          </ul>
        }
      />

      {docenteId == null ? (
        <Alert
          type="warning"
          showIcon
          title="Sin docente en contexto"
          description="Abrí esta pantalla desde la ficha o la lista del docente para registrar la asignación."
        />
      ) : null}
    </Card>
  );
}
