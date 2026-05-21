/**
 * Chip de estado para evaluaciones finales institucionales (aplica / no aplica al curso).
 */

import { CheckOutlined } from '@ant-design/icons';

const EstadoEvaluacionChip = ({ aplica }) => (
  <span
    className={[
      'cal-estado-eval-chip',
      aplica ? 'cal-estado-eval-chip--aplica' : 'cal-estado-eval-chip--no-aplica',
    ].join(' ')}
  >
    {aplica ? <CheckOutlined className="cal-estado-eval-chip__icon" aria-hidden /> : null}
    {aplica ? 'Aplica a este curso' : 'No aplica a este curso'}
  </span>
);

export default EstadoEvaluacionChip;
