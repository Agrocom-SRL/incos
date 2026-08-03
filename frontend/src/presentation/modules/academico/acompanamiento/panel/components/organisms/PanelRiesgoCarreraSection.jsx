/**
 * Organismo: riesgo por carrera del panel de acompañamiento (ACA · vista 157).
 *
 * Una fila por carrera con `Progress` AntD (SIN librería de gráficos nueva):
 * el porcentaje de estudiantes en riesgo se pinta con el rojo SEMÁNTICO del
 * theme (`allColors.colorError`, token — nunca hex) y el detalle numérico al
 * costado. Estado vacío contextual.
 */

import { Empty, Flex, Progress, Typography } from 'antd';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { allColors, allSpacing } from '@theme/tokens';

const { Paragraph, Text } = Typography;

const PanelRiesgoCarreraSection = ({ porCarrera = [] }) => (
  <section className="cfg-academico-workspace">
    <header className="cfg-academico-workspace__header">
      <ListPanelHeader title="Riesgo por carrera" />
      <Paragraph type="secondary" className="cfg-academico-workspace__desc">
        Porcentaje de estudiantes con al menos una materia en riesgo, por carrera de la gestión
        vigente.
      </Paragraph>
    </header>

    <Flex vertical gap={allSpacing.margin} className="cfg-academico-tab-panel">
      {porCarrera.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Aún no hay notas registradas para calcular el riesgo por carrera."
        />
      ) : (
        porCarrera.map((carrera) => (
          <Flex
            key={carrera.carreraId ?? carrera.carreraNombre}
            vertical
            gap={allSpacing.marginXS}
          >
            <Flex justify="space-between" align="center" gap={allSpacing.marginSM} wrap>
              <Text strong>{carrera.carreraNombre}</Text>
              <Text type="secondary">
                {carrera.estudiantesEnRiesgo} de {carrera.totalEstudiantes} estudiantes en riesgo
              </Text>
            </Flex>
            <Progress
              percent={carrera.pctEstudiantesRiesgo}
              size="small"
              strokeColor={allColors.colorError}
              format={(percent) => `${percent}%`}
              aria-label={`Riesgo en ${carrera.carreraNombre}: ${carrera.pctEstudiantesRiesgo}%`}
            />
          </Flex>
        ))
      )}
    </Flex>
  </section>
);

export default PanelRiesgoCarreraSection;
