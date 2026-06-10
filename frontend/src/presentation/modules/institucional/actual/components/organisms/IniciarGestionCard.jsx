/**
 * Organismo: tarjeta de activación del ciclo lectivo (iniciar gestión académica).
 * Habilita el inicio de clases cuando la gestión aún no está iniciada.
 */

import { Card, Flex, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { formatFechaCorta } from '@application-institucional/actual/utils/bimestresTimeline.js';
import IniciarGestionProgressModal from './IniciarGestionProgressModal.jsx';

const { Paragraph } = Typography;

const IniciarGestionCard = ({ iniciada, fase, iniciando, onIniciarGestion }) => (
  <Card title="Iniciar gestión académica" size="small">
    <Flex vertical gap="middle">
      <Paragraph type="secondary" style={{ margin: 0 }}>
        Pone las matrículas de la gestión en CURSANDO y abre los 4 bimestres. A partir de aquí los
        estudiantes ven su horario y los docentes registran calificaciones.
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
          disabled={iniciada || iniciando || (fase?.fase === 'PRE_INICIO' && fase?.ventanaAbierta === false)}
          onClick={onIniciarGestion}
        >
          {iniciada ? 'Cursado ya activado' : 'Habilitar inicio de clases'}
        </ActionButton>
      </Flex>
    </Flex>

    <IniciarGestionProgressModal key={iniciando ? 'on' : 'off'} open={iniciando} />
  </Card>
);

export default IniciarGestionCard;
