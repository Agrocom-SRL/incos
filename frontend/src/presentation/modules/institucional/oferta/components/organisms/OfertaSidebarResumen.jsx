import { BookOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import { allColors, allSpacing, componentConfig, gradients, shadows, typography } from '@theme/tokens';

const { Text, Title } = Typography;

const sidebarCard = (gradient, { etiqueta, icon, titulo, valor, detalle }) => (
  <Card
    className="oferta-sidebar-resumen-stat"
    style={{
      background: gradient,
      borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
      boxShadow: shadows.shadowPrimary,
      border: 'none',
    }}
  >
    <Flex vertical style={{ minWidth: 0 }}>
      <Flex justify="space-between" align="flex-start" wrap="nowrap">
        <Text
          style={{
            color: allColors.colorTextSecondaryOnDark,
            fontSize: `${typography.fontSizeSM}px`,
            margin: 0,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {etiqueta}
        </Text>
        <span style={{ color: allColors.colorTextOnDark, fontSize: 22, opacity: 0.95 }} aria-hidden>
          {icon}
        </span>
      </Flex>
      <Title
        level={3}
        style={{
          color: allColors.colorTextOnDark,
          fontSize: 36,
          fontWeight: typography.fontWeightStrong,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {valor}
      </Title>
      <Title
        level={5}
        style={{
          color: allColors.colorTextOnDark,
          fontSize: `${typography.fontSizeHeading5}px`,
          fontWeight: typography.fontWeightStrong,
          margin: 0,
          lineHeight: 1.35,
        }}
      >
        {titulo}
      </Title>
      <Text style={{ color: allColors.colorTextTertiaryOnDark, fontSize: typography.fontSizeSM }}>{detalle}</Text>
    </Flex>
  </Card>
);

const OfertaSidebarResumen = ({ gestionSeleccionada, planSeleccionado, kpis, step }) => {
  const gestionLabel =
    gestionSeleccionada?.codigo ??
    gestionSeleccionada?.nombre ??
    gestionSeleccionada?.name ??
    (gestionSeleccionada ? `Gestión ${gestionSeleccionada.id}` : '—');

  const planLabel = planSeleccionado
    ? planSeleccionado.carreraNombre
      ? `${planSeleccionado.carreraNombre} — ${planSeleccionado.nombre ?? `Plan #${planSeleccionado.planEstudioId}`}`
      : planSeleccionado.nombre ?? `Plan #${planSeleccionado.planEstudioId}`
    : 'Sin plan seleccionado';

  return (
    <Flex vertical gap={allSpacing.marginMD} style={{ width: '100%', minWidth: 0 }}>
      {sidebarCard(gradients.gradientPrimary, {
        etiqueta: 'Gestión',
        icon: <CalendarOutlined />,
        titulo: gestionLabel,
        valor: gestionSeleccionada?.anio ?? '—',
        detalle: gestionSeleccionada?.vigente ? 'Gestión vigente' : 'No marcada como vigente',
      })}

      {step >= 1
        ? sidebarCard(gradients.gradientInfo, {
            etiqueta: 'Plan habilitado',
            icon: <BookOutlined />,
            titulo: planLabel,
            valor: kpis.planesHabilitados ?? kpis.total ?? 0,
            detalle:
              step >= 2
                ? `${kpis.ofertados ?? 0} OFERTADO · ${kpis.publicados ?? 0} PUBLICADO`
                : `${kpis.planesHabilitados ?? 0} plan(es) en la gestión`,
          })
        : null}

      {step >= 2 && (kpis.listosOfertado > 0 || kpis.ofertados > 0 || kpis.publicados > 0)
        ? sidebarCard(gradients.gradientSuccess, {
            etiqueta: 'Avance oferta',
            icon: <CheckCircleOutlined />,
            titulo: 'Paralelos listos',
            valor: kpis.listosOfertado + kpis.ofertados + (kpis.publicados ?? 0),
            detalle:
              (kpis.publicados ?? 0) > 0
                ? `${kpis.publicados} PUBLICADO(s) — plan bloqueado en armado`
                : `${kpis.ofertados} OFERTADO(s) — continúe en horarios`,
          })
        : null}
    </Flex>
  );
};

export default OfertaSidebarResumen;
