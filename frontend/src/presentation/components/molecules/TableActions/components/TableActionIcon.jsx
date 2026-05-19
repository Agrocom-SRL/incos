import { Tooltip } from 'antd';
import { IconButton } from '@atoms';

/**
 * Botón de acción con tooltip (átomo IconButton + Ant Design Tooltip).
 */
const TableActionIcon = ({
  title,
  icon,
  variant = 'default',
  onClick,
  disabled = false,
}) => (
  <Tooltip title={title}>
    <IconButton
      icon={icon}
      variant={variant}
      onClick={onClick}
      disabled={disabled}
    />
  </Tooltip>
);

export default TableActionIcon;
