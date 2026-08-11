/**
 * Organismo: línea de tiempo del trámite de pasantía (TIT), tarjeta de la
 * barra lateral de la ficha (`InfoSidebar` vía `PageTemplate`, extensión
 * 2026-08-11, mismo movimiento que `ProyectoGradoTimeline`). A diferencia de
 * Proyecto de grado, `pasantias` no tiene fecha por etapa ni tabla de
 * historial (decisión 2026-08-08): `Steps` vertical (columna angosta del
 * sidebar, ~300-350px) mostrando el camino según `tipo` con la etapa actual
 * resaltada, sin fechas intermedias reales. Mismo `cardShell` (radio +
 * shadowElevation2 + borde) que `ProyectoGradoTimeline` para no verse plana
 * junto al resto de tarjetas del sidebar. Slot `action` opcional (extensión
 * 2026-08-11): el botón "Transición de estado" vive en la misma tarjeta,
 * mismo patrón que `ProyectoGradoTimeline`.
 */

import { Card, Divider, Flex, Steps, Tag } from 'antd';
import { StatusPill } from '@atoms';
import { allColors, componentConfig, shadows } from '@theme/tokens';
import { buildPasantiaTimeline } from '@application-titulacion/pasantias/utils/pasantiaTimeline';

const cardShell = {
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
    backgroundColor: allColors.colorBgContainer,
  },
  styles: { body: { padding: `${componentConfig.Card.paddingLG}px` } },
};

const PasantiaTimeline = ({ pasantia, action = null }) => {
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
    <Card title="Línea de tiempo del trámite" {...cardShell}>
      <Steps orientation="vertical" size="small" items={items} />
      {action ? (
        <>
          <Divider style={{ margin: '16px 0 12px' }} />
          {action}
        </>
      ) : null}
    </Card>
  );
};

export default PasantiaTimeline;
