/**
 * Organismo: línea de tiempo del proyecto de grado (TIT), siempre visible en
 * la ficha (no oculta en una tab) — responde al pedido del usuario de un
 * flujo de estados más fluido, con colores que indiquen el historial de
 * cambios. Mismo patrón que `BimestresTimeline.jsx` (Gestión actual): `Card`
 * + antd `Steps` vertical, `Tag`/`StatusPill` de color por etapa.
 */

import { Card, Flex, Steps, Tag, Typography } from 'antd';
import { StatusPill } from '@atoms';
import { buildProyectoGradoTimeline } from '@application-titulacion/proyectos-grado/utils/proyectoGradoTimeline';

const { Text } = Typography;

const ProyectoGradoTimeline = ({ proyecto }) => {
  const timeline = buildProyectoGradoTimeline(proyecto);
  if (!timeline.length) return null;

  const items = timeline.map((etapa) => ({
    status: etapa.stepStatus,
    title: (
      <Flex align="center" gap="small" wrap>
        <span>{etapa.titulo}</span>
        {etapa.pillClass ? (
          <StatusPill label={etapa.pillLabel} className={etapa.pillClass} />
        ) : (
          <Tag color={etapa.tag.color}>{etapa.tag.label}</Tag>
        )}
      </Flex>
    ),
    content: etapa.fecha ? <Text type="secondary">{etapa.fecha}</Text> : null,
  }));

  return (
    <Card title="Línea de tiempo del proyecto">
      <Steps orientation="vertical" size="small" items={items} />
    </Card>
  );
};

export default ProyectoGradoTimeline;
