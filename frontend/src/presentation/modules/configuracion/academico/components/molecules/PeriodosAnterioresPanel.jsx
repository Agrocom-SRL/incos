/**
 * Molécula: panel colapsable con las asignaturas de periodos ANTERIORES al
 * que se edita — única fuente de arrastre para el Flujo B (prerrequisito
 * cross-periodo, ver `PlanPeriodoAsignaturasPage.jsx`). Compacto por diseño:
 * no es la columna «Otros periodos» (esa listaba TODOS los periodos); aquí
 * solo entran los válidos como prerrequisito.
 */

import { Collapse, Empty, Typography } from 'antd';
import PlanBuilderAsignaturaChip from '../atoms/PlanBuilderAsignaturaChip';

const { Text } = Typography;

const PeriodosAnterioresPanel = ({ grupos = [], disabled = false }) => {
  const items = [
    {
      key: 'anteriores',
      label: `Periodos anteriores (${grupos.reduce((acc, g) => acc + g.asignaturas.length, 0)})`,
      children:
        grupos.length === 0 ? (
          <Empty description="Sin asignaturas en periodos anteriores" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="cfg-plan-builder__grupos">
            {grupos.map((grupo) => (
              <div key={grupo.periodoId} className="cfg-plan-builder__grupo">
                <Text strong>{grupo.periodoNombre}</Text>
                <div className="cfg-plan-builder__chip-list">
                  {grupo.asignaturas.map((asignatura) => (
                    <PlanBuilderAsignaturaChip
                      key={asignatura.id}
                      asignatura={asignatura}
                      disabled={disabled}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ),
    },
  ];

  return (
    <Collapse
      className="cfg-plan-builder__anteriores-collapse"
      defaultActiveKey={grupos.length ? ['anteriores'] : []}
      items={items}
    />
  );
};

export default PeriodosAnterioresPanel;
