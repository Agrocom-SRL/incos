/**
 * Átomo: campo etiqueta/valor (patrón sd-field — fichas de detalle).
 */

import { Typography } from 'antd';

const DetailField = ({ label, children, span = 1 }) => (
  <div className={`sd-field sd-field--span-${span}`}>
    <Typography.Text className="sd-field__label" type="secondary">
      {label}
    </Typography.Text>
    <span className="sd-field__value">{children ?? '—'}</span>
  </div>
);

export default DetailField;
