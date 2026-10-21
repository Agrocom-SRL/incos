/**
 * Molécula: checklist de requisitos de inscripción (CAP), compartida por el
 * paso «Horario y requisitos» del wizard y la ficha de la inscripción.
 *
 * Presentacional y controlada: recibe items `{id, descripcion, obligatorio,
 * checked}` y notifica `onToggle(id, checked)`. Cada fila lleva pill
 * Obligatorio/Opcional. Estado vacío cubierto.
 */

import { Checkbox, Empty, Flex } from 'antd';
import { StatusPill } from '@atoms';
import { allSpacing } from '@theme/tokens';

const PILL_OBLIGATORIO = 'cfg-materia-pill cfg-materia-pill--warning';
const PILL_OPCIONAL = 'cfg-materia-pill cfg-materia-pill--default';

const RequisitosChecklist = ({ items = [], onToggle, disabled = false }) => {
  if (items.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="El curso no exige requisitos de inscripción."
      />
    );
  }

  return (
    <Flex vertical gap={allSpacing.marginSM}>
      {items.map((item) => (
        <Flex key={item.id} align="center" gap={allSpacing.marginSM} wrap>
          <Checkbox
            checked={item.checked}
            disabled={disabled}
            onChange={(e) => onToggle?.(item.id, e.target.checked)}
          >
            {item.descripcion}
          </Checkbox>
          <StatusPill
            label={item.obligatorio ? 'Obligatorio' : 'Opcional'}
            className={item.obligatorio ? PILL_OBLIGATORIO : PILL_OPCIONAL}
          />
        </Flex>
      ))}
    </Flex>
  );
};

export default RequisitosChecklist;
