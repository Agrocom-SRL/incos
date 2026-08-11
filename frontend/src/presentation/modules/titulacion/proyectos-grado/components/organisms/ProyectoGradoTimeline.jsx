/**
 * Organismo: etapas del proyecto de grado (TIT), tarjeta de la barra lateral
 * de la ficha (`InfoSidebar` vía `PageTemplate`, extensión 2026-08-11). Antes
 * vivía como "Línea de tiempo del proyecto" bajo la cabecera de la ficha: se
 * renombró y se movió para no leerse como una barra de progreso/avance — ese
 * vocabulario ya lo ocupa el % de avance de bitácora/avances_proyecto, un
 * concepto distinto a la etapa (estado) del proyecto. Mismo patrón que
 * `BimestresTimeline.jsx` (Gestión actual): `Card` + antd `Steps` vertical,
 * `Tag`/`StatusPill` de color por etapa. Slot `action` opcional: el botón
 * "Aprobar etapa"/"Registrar acta de defensa" vive en la misma tarjeta.
 * Elevación: mismo `cardShell` (radio + shadowElevation2 + borde) que
 * `HorariosParalelosPorTurnoSidebar`/`PoliticaInstitucionalSidebarResumen —
 * la tarjeta se veía plana sin sombra ni borde propios (pedido del usuario).
 *
 * Color por etapa (extensión 2026-08-11, pedido explícito del usuario): la
 * etapa ACTUAL se marca en verde primario (`colorPrimary`, la más notoria) y
 * las etapas ANTERIORES ya completadas en verde claro (`colorPrimaryBg`) —
 * antes era al revés (la completada salía sólida y la vigente casi sin
 * color, por el estilo por defecto de antd `Steps`). AntD 6 calcula el color
 * del ícono de `Steps` con variables CSS internas difíciles de sobreescribir
 * de forma confiable, así que en vez de pelear con esas clases se reemplaza
 * el ícono de los pasos "completado"/"actual" por un nodo propio (mismos
 * tokens que `cardShell`); el paso final (aprobado/reprobado/cancelado, con
 * `pillClass`) no se toca — ya usa su propio StatusPill.
 */

import { CheckOutlined } from '@ant-design/icons';
import { Card, Divider, Flex, Steps, Tag, Typography } from 'antd';
import { StatusPill } from '@atoms';
import { allColors, componentConfig, shadows } from '@theme/tokens';
import { buildProyectoGradoTimeline } from '@application-titulacion/proyectos-grado/utils/proyectoGradoTimeline';

const { Text } = Typography;

const cardShell = {
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
    backgroundColor: allColors.colorBgContainer,
  },
  styles: { body: { padding: `${componentConfig.Card.paddingLG}px` } },
};

const etapaIconBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: '50%',
  fontSize: 12,
  fontWeight: 600,
};

/** Etapa anterior ya completada: verde claro (recede frente a la actual). */
const etapaIconCompletadoStyle = {
  ...etapaIconBase,
  backgroundColor: allColors.colorPrimaryBg,
  color: allColors.colorPrimaryHover,
};

/** Etapa actual (vigente): verde primario sólido — la más notoria. */
const etapaIconActualStyle = {
  ...etapaIconBase,
  backgroundColor: allColors.colorPrimary,
  color: allColors.colorTextOnDark,
};

const ProyectoGradoTimeline = ({ proyecto, action = null }) => {
  const timeline = buildProyectoGradoTimeline(proyecto);
  if (!timeline.length) return null;

  const items = timeline.map((etapa, index) => {
    const esEtapaBase = !etapa.pillClass;
    const esCompletada = esEtapaBase && etapa.stepStatus === 'finish';
    const esActual = esEtapaBase && etapa.stepStatus === 'process';

    let icon;
    if (esCompletada) {
      icon = (
        <span style={etapaIconCompletadoStyle}>
          <CheckOutlined />
        </span>
      );
    } else if (esActual) {
      icon = <span style={etapaIconActualStyle}>{index + 1}</span>;
    }

    return {
      status: etapa.stepStatus,
      icon,
      title: (
        <Flex align="center" gap="small" wrap>
          <span>{etapa.titulo}</span>
          {etapa.pillClass ? (
            <StatusPill label={etapa.pillLabel} className={etapa.pillClass} />
          ) : (
            <Tag color={esActual ? allColors.colorPrimary : etapa.tag.color}>
              {etapa.tag.label}
            </Tag>
          )}
        </Flex>
      ),
      content: etapa.fecha ? <Text type="secondary">{etapa.fecha}</Text> : null,
    };
  });

  return (
    <Card title="Etapas del proyecto" {...cardShell}>
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

export default ProyectoGradoTimeline;
