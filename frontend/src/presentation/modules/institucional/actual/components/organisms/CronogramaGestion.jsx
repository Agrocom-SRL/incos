import { createElement } from 'react';
import { Card, Collapse, Empty, Flex, Tag, Timeline, Typography } from 'antd';
import { CalendarOutlined, SettingOutlined, StarFilled } from '@ant-design/icons';
import { allColors, allSpacing } from '@theme/tokens';
import { ActionButton, StatusPill } from '@atoms';
import { getActivityIconComponent } from '@config/icons';
import { estadoDot } from '@application-institucional/actual/utils/cronogramaGestion.js';
import {
  getActividadTipoLabel,
  getActividadTipoPillClass,
} from '@application-institucional/actual/config/actividadPill.js';
import '@institucional/actual/styles/cronograma.css';

const { Text } = Typography;

/** Elemento de icono de una actividad (createElement evita crear componentes en render). */
const renderActividadIcono = (icono) =>
  createElement(getActivityIconComponent(icono), {
    style: { color: allColors.colorTextSecondary },
  });

/** Línea de tiempo de actividades de un periodo (antd Timeline). */
const actividadesTimeline = (actividades = []) => (
  <Timeline
    items={actividades.map((a) => ({
      color: estadoDot(a.estado),
      content: (
        <Flex vertical gap={allSpacing.marginXS}>
          <Flex align="center" gap="small" wrap>
            {renderActividadIcono(a.icono)}
            {a.esDestacada ? <StarFilled style={{ color: allColors.colorWarning }} /> : null}
            <Text strong={a.estado === 'vigente'}>{a.nombre}</Text>
            <StatusPill label={getActividadTipoLabel(a.tipo)} className={getActividadTipoPillClass(a.tipo)} />
            {a.estado === 'vigente' ? <Tag color="processing">En curso</Tag> : null}
          </Flex>
          <Text type="secondary">{a.rango}</Text>
        </Flex>
      ),
    }))}
  />
);

/**
 * Cronograma / calendario académico de la gestión vigente.
 * Agrupa las actividades por periodo (planificación, bimestres, clausura) en un
 * Collapse; abre por defecto el/los periodo(s) con actividad vigente.
 */
const CronogramaGestion = ({ periodos = [], proximas = [], onGestionar }) => {
  const gestionarBtn = onGestionar ? (
    <ActionButton
      permiso="institucional.gestion.cronograma"
      accion="LISTAR"
      variant="info"
      icon={<SettingOutlined />}
      onClick={onGestionar}
    >
      Gestionar
    </ActionButton>
  ) : null;

  if (!periodos.length) {
    return (
      <Card title="Cronograma académico" extra={gestionarBtn}>
        <Empty description="No hay actividades de calendario para la gestión vigente" />
      </Card>
    );
  }

  const periodoTieneVigente = (p) => p.actividades.some((a) => a.estado === 'vigente');
  const vigentes = periodos.filter(periodoTieneVigente).map((p) => String(p.periodoAcademicoId));
  const defaultActiveKey = vigentes.length
    ? vigentes
    : [String(periodos[0].periodoAcademicoId)];

  const items = periodos.map((p) => ({
    key: String(p.periodoAcademicoId),
    label: (
      <Flex align="center" justify="space-between" gap="small" wrap style={{ width: '100%' }}>
        <Flex align="center" gap="small" wrap>
          <Text strong>{p.nombre}</Text>
          <Tag>{p.totalActividades}</Tag>
          {periodoTieneVigente(p) ? <Tag color="processing">Periodo actual</Tag> : null}
        </Flex>
        <Text type="secondary">{p.rango}</Text>
      </Flex>
    ),
    children: actividadesTimeline(p.actividades),
  }));

  return (
    <Card
      title={
        <Flex align="center" gap="small">
          <CalendarOutlined />
          <span>Cronograma académico</span>
        </Flex>
      }
      extra={gestionarBtn}
    >
      <Flex vertical gap="middle" style={{ width: '100%' }}>
        {proximas.length ? (
          <Flex
            vertical
            gap={allSpacing.marginXS}
            style={{
              background: allColors.colorBgLayout,
              borderRadius: allSpacing.borderRadius,
              padding: allSpacing.paddingSM,
            }}
          >
            <Text strong>Próximas fechas clave</Text>
            <Flex vertical gap={allSpacing.marginXS}>
              {proximas.slice(0, 5).map((a) => (
                <Flex key={a.id} align="center" gap="small" wrap>
                  <Text type="secondary" style={{ minWidth: 150 }}>
                    {a.rango}
                  </Text>
                  {renderActividadIcono(a.icono)}
                  <Text>{a.nombre}</Text>
                  <StatusPill
                    label={getActividadTipoLabel(a.tipo)}
                    className={getActividadTipoPillClass(a.tipo)}
                  />
                </Flex>
              ))}
            </Flex>
          </Flex>
        ) : null}

        <Collapse items={items} defaultActiveKey={defaultActiveKey} />
      </Flex>
    </Card>
  );
};

export default CronogramaGestion;
