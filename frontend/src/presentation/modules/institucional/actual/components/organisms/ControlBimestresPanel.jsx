import { Alert, Button, Card, Flex, Tag, Typography } from 'antd';
import { CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { formatFechaCorta } from '@application-institucional/actual/utils/bimestresTimeline.js';

const { Paragraph, Text } = Typography;

/** Acciones del ciclo lectivo: iniciar gestión y cerrar bimestre vigente. */
const ControlBimestresPanel = ({
  iniciada,
  estadoLabel,
  estadoColor,
  bimestreVigente,
  fase,
  iniciando,
  cerrando,
  validacion,
  onIniciarGestion,
  onValidarCierre,
  onCerrarBimestre,
}) => (
  <Flex vertical gap="large">
    <Flex align="center" gap="small" wrap>
      <Text strong>Estado del cursado:</Text>
      <Tag color={estadoColor}>{estadoLabel}</Tag>
      {iniciada && bimestreVigente ? <Tag color="processing">Bimestre vigente: B{bimestreVigente}</Tag> : null}
    </Flex>

    {/* Activación inicial */}
    <Card title="Iniciar gestión académica">
      <Flex vertical gap="middle">
        <Paragraph type="secondary" style={{ margin: 0 }}>
          Pone las matrículas de la gestión en CURSANDO y abre los 4 bimestres. A partir de aquí
          los estudiantes ven su horario y los docentes registran calificaciones.
          {fase?.fase === 'PRE_INICIO' && fase?.disponibleDesde && !fase?.ventanaAbierta
            ? ` Disponible a partir del ${formatFechaCorta(fase.disponibleDesde)}.`
            : ''}
        </Paragraph>
        <Flex>
          <ActionButton
            permiso="institucional.gestion.actual"
            accion="EDITAR"
            variant="primary"
            icon={<CheckCircleOutlined />}
            loading={iniciando}
            disabled={iniciada || (fase?.fase === 'PRE_INICIO' && fase?.ventanaAbierta === false)}
            onClick={onIniciarGestion}
          >
            {iniciada ? 'Cursado ya activado' : 'Activar cursado / Iniciar gestión académica'}
          </ActionButton>
        </Flex>
      </Flex>
    </Card>

    {/* Cierre de bimestre */}
    <Card title="Cerrar bimestre vigente">
      <Flex vertical gap="middle">
        <Paragraph type="secondary" style={{ margin: 0 }}>
          {iniciada
            ? fase?.mensaje || 'Valide que no haya notas pendientes y cierre el bimestre para habilitar el siguiente.'
            : 'Disponible una vez iniciada la gestión.'}
        </Paragraph>

        {validacion ? (
          validacion.puedeCerrar ? (
            <Alert
              type="success"
              showIcon
              title="El bimestre puede cerrarse"
              description="No hay cursos con notas pendientes."
            />
          ) : (
            <Alert
              type="warning"
              showIcon
              title={<strong>Notas pendientes impiden el cierre</strong>}
              description={
                <Flex vertical gap="small">
                  {(validacion.cursosConNotasFaltantes || []).map((c) => (
                    <Text key={c.asignacionId}>
                      {c.materia} · {c.docente} ({c.paralelo}) — {c.cantidadFaltantes} sin nota
                    </Text>
                  ))}
                </Flex>
              }
            />
          )
        ) : null}

        <Flex gap="small" wrap>
          <Button onClick={onValidarCierre} disabled={!iniciada || !bimestreVigente}>
            Validar cierre
          </Button>
          <ActionButton
            permiso="institucional.gestion.actual"
            accion="EDITAR"
            variant="primary"
            icon={<LockOutlined />}
            loading={cerrando}
            disabled={!iniciada || !bimestreVigente}
            onClick={onCerrarBimestre}
          >
            {bimestreVigente ? `Cerrar bimestre ${bimestreVigente}` : 'Cerrar bimestre'}
          </ActionButton>
        </Flex>
      </Flex>
    </Card>
  </Flex>
);

export default ControlBimestresPanel;
