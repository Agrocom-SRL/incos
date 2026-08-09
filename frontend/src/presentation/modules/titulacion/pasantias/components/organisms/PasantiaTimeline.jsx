/**
 * Organismo: línea de tiempo del trámite de pasantía (TIT), siempre visible
 * en la ficha. A diferencia de Proyecto de grado, `pasantias` no tiene fecha
 * por etapa ni tabla de historial (decisión 2026-08-08): `Steps` horizontal
 * mostrando el camino según `tipo` con la etapa actual resaltada, sin fechas
 * intermedias reales.
 */

import { Card, Flex, Steps, Tag } from 'antd';
import { StatusPill } from '@atoms';
import { buildPasantiaTimeline } from '@application-titulacion/pasantias/utils/pasantiaTimeline';

const PasantiaTimeline = ({ pasantia }) => {
  const timeline = buildPasantiaTimeline(pasantia);
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
  }));

  return (
    <Card title="Línea de tiempo del trámite">
      <Steps orientation="horizontal" size="small" items={items} />
    </Card>
  );
};

export default PasantiaTimeline;
