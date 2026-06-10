import { Card, Empty, Flex, Steps, Tag, Typography } from 'antd';

const { Text } = Typography;

/**
 * Línea de tiempo de los bimestres de la gestión (fechas + estado).
 * Solo lectura: refleja `estado` (cerrado/vigente/futuro) de cada bimestre.
 */
const BimestresTimeline = ({ timeline = [] }) => {
  if (!timeline.length) {
    return (
      <Card title="Línea de tiempo de bimestres">
        <Empty description="No hay bimestres configurados para la gestión vigente" />
      </Card>
    );
  }

  const items = timeline.map((b) => ({
    status: b.stepStatus,
    title: (
      <Flex align="center" gap="small" wrap>
        <span>{b.nombre || `Bimestre ${b.numero}`}</span>
        <Tag color={b.tag.color}>{b.tag.label}</Tag>
      </Flex>
    ),
    description: <Text type="secondary">{b.rango}</Text>,
  }));

  return (
    <Card title="Línea de tiempo de bimestres">
      <Steps direction="vertical" size="small" items={items} />
    </Card>
  );
};

export default BimestresTimeline;
