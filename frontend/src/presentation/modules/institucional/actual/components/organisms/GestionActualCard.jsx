import { Card, Descriptions, Flex, Tag, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';

const { Paragraph, Title } = Typography;

/**
 * Tarjeta de la gestión vigente + control de activación del cursado.
 *
 * El botón se guarda con `academico.calificacion.gestion_bimestres` + EDITAR para
 * mantener coherencia con el backend del endpoint de inicio (vive en calificaciones),
 * aunque la pantalla se entre con `institucional.gestion.actual` + LISTAR.
 */
const GestionActualCard = ({
  gestionVigente,
  iniciada,
  estadoLabel,
  estadoColor,
  matriculasCursando,
  iniciando,
  onActivarCursado,
}) => (
  <Card>
    <Flex vertical gap="middle">
      <Flex align="center" justify="space-between" wrap gap="middle">
        <Title level={4} style={{ margin: 0 }}>
          {gestionVigente?.nombre || 'Gestión vigente'}
          {gestionVigente?.anio ? ` (${gestionVigente.anio})` : ''}
        </Title>
        <Tag color={estadoColor}>{estadoLabel}</Tag>
      </Flex>

      <Descriptions column={{ xs: 1, sm: 2 }} size="small">
        <Descriptions.Item label="Código">
          {gestionVigente?.codigo || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Matrículas en cursado">
          {matriculasCursando != null ? matriculasCursando : '—'}
        </Descriptions.Item>
      </Descriptions>

      <Paragraph type="secondary" style={{ margin: 0 }}>
        Activar el cursado pone las matrículas de la gestión en <strong>CURSANDO</strong> y abre
        sus 4 bimestres. A partir de ese momento los estudiantes ven su horario y se habilita el
        registro de calificaciones. Las inscripciones posteriores nacerán directamente en cursado.
      </Paragraph>

      <Flex>
        <ActionButton
          permiso="academico.calificacion.gestion_bimestres"
          accion="EDITAR"
          variant="primary"
          icon={<CheckCircleOutlined />}
          loading={iniciando}
          disabled={iniciada}
          onClick={onActivarCursado}
        >
          {iniciada ? 'Cursado ya activado' : 'Activar cursado / Iniciar gestión académica'}
        </ActionButton>
      </Flex>
    </Flex>
  </Card>
);

export default GestionActualCard;
