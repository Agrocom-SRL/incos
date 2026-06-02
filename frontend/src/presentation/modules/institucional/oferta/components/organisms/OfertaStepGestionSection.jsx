import { Button, Flex, Select, Space, Tag, Typography } from 'antd';
import { ActionButton } from '@atoms';

const { Text } = Typography;

const OfertaStepGestionSection = ({
  gestiones,
  selectedGestionId,
  gestionSeleccionada,
  onSelectGestion,
  onMarcarVigente,
  onContinuar,
}) => (
  <Flex vertical gap="middle" className="oferta-step-section">
    <Text type="secondary">
      Seleccione la gestión académica donde habilitará planes y generará la oferta de cursos. La gestión{' '}
      <strong>vigente</strong> es la referencia para matrícula e inscripciones.
    </Text>
    <Select
      placeholder="Seleccione gestión"
      className="oferta-step-section__select"
      value={selectedGestionId}
      onChange={onSelectGestion}
      options={gestiones.map((g) => ({
        value: g.id,
        label: `${g.codigo ?? g.name ?? g.nombre ?? `Gestión ${g.id}`}${g.anio ? ` ${g.anio}` : ''}${
          g.vigente ? ' (vigente)' : ''
        }`,
      }))}
    />
    {gestionSeleccionada ? (
      <Flex gap="small" wrap="wrap" align="center">
        <Tag color={gestionSeleccionada.vigente ? 'success' : 'default'}>
          {gestionSeleccionada.vigente ? 'Vigente' : 'No vigente'}
        </Tag>
        {gestionSeleccionada.codigo ? <Text type="secondary">Código: {gestionSeleccionada.codigo}</Text> : null}
      </Flex>
    ) : null}
    <Space wrap>
      <ActionButton
        permiso="institucional.oferta.gestion-plan"
        accion="ACTIVAR"
        onClick={onMarcarVigente}
        disabled={!selectedGestionId}
      >
        Marcar vigente
      </ActionButton>
      <Button type="primary" disabled={!selectedGestionId} onClick={onContinuar}>
        Continuar a planes
      </Button>
    </Space>
  </Flex>
);

export default OfertaStepGestionSection;
