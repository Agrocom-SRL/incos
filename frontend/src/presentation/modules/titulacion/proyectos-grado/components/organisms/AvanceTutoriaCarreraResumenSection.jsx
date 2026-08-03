/**
 * Organismo: resumen por carrera del reporte de avance de tutorías (TIT,
 * Requisito 2 — extensión 2026-07-31, vista 179).
 *
 * Mismo lenguaje visual que `PanelRiesgoCarreraSection` (Acompañamiento):
 * una fila por carrera con `Progress` AntD (SIN librería de gráficos nueva) y
 * el detalle numérico al costado — aquí el color es SIEMPRE el primario
 * institucional (no hay semántica de riesgo, es avance de tutoría).
 */

import { Empty, Flex, Progress, Typography } from 'antd';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { StatusPill } from '@atoms';
import { allSpacing } from '@theme/tokens';

const { Paragraph, Text } = Typography;

const AvanceTutoriaCarreraResumenSection = ({ resumenPorCarrera = [] }) => (
  <section className="cfg-academico-workspace">
    <header className="cfg-academico-workspace__header">
      <ListPanelHeader title="Resumen por carrera" />
      <Paragraph type="secondary" className="cfg-academico-workspace__desc">
        Promedio de avance de tutoría y proyectos con observaciones pendientes, por carrera de la
        gestión seleccionada.
      </Paragraph>
    </header>

    <Flex vertical gap={allSpacing.margin} className="cfg-academico-tab-panel">
      {resumenPorCarrera.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Aún no hay proyectos de grado registrados para calcular el avance por carrera."
        />
      ) : (
        resumenPorCarrera.map((carrera) => (
          <Flex key={carrera.carreraId ?? carrera.carreraNombre} vertical gap={allSpacing.marginXS}>
            <Flex justify="space-between" align="center" gap={allSpacing.marginSM} wrap>
              <Text strong>{carrera.carreraNombre}</Text>
              <Flex gap={allSpacing.marginSM} align="center" wrap>
                <Text type="secondary">
                  {carrera.totalProyectos} proyecto{carrera.totalProyectos === 1 ? '' : 's'}
                </Text>
                {carrera.proyectosConObservacionesPendientes > 0 ? (
                  <StatusPill
                    label={`${carrera.proyectosConObservacionesPendientes} con observaciones`}
                    className="cfg-materia-pill cfg-materia-pill--warning"
                  />
                ) : (
                  <StatusPill label="Al día" className="cfg-materia-pill cfg-materia-pill--success" />
                )}
              </Flex>
            </Flex>
            <Progress
              percent={carrera.promedioAvance ?? 0}
              size="small"
              format={(percent) => `${percent}%`}
              aria-label={`Avance de tutoría en ${carrera.carreraNombre}: ${carrera.promedioAvance ?? 0}%`}
            />
          </Flex>
        ))
      )}
    </Flex>
  </section>
);

export default AvanceTutoriaCarreraResumenSection;
