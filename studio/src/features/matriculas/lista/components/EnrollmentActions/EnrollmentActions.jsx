/**
 * EnrollmentActions — acciones de una inscripción (ver · editar · menú ⋮).
 * Molécula ÚNICA del feature: la usan TANTO la fila de tabla (buildColumns) como
 * la tarjeta (StudentCard), eliminando la duplicación previa. Sin estado propio;
 * los handlers se inyectan (DIP) y los textos salen de i18n.
 */
import {
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  PrinterOutlined,
  MailOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { IconButton } from '@ui/atoms/IconButton/IconButton';
import { useTranslation } from '@lib/i18n/useTranslation';

export function EnrollmentActions({
  row,
  className = 'mat-actions',
  primaryClassName,
  onView,
  onEdit,
  onPrint,
  onEmail,
  onReport,
  onDelete,
}) {
  const { t } = useTranslation();

  const menu = {
    items: [
      { key: 'print', icon: <PrinterOutlined />, label: t('enrollments.actions.print'), onClick: () => onPrint?.(row) },
      { key: 'email', icon: <MailOutlined />, label: t('enrollments.actions.email'), onClick: () => onEmail?.(row) },
      { key: 'report', icon: <FileTextOutlined />, label: t('enrollments.actions.report'), onClick: () => onReport?.(row) },
      { type: 'divider' },
      { key: 'delete', icon: <DeleteOutlined />, label: t('enrollments.actions.delete'), danger: true, onClick: () => onDelete?.(row) },
    ],
  };

  return (
    <div className={className} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <IconButton
        tone="info"
        icon={<EyeOutlined />}
        label={t('enrollments.actions.view')}
        className={primaryClassName}
        onClick={() => onView?.(row)}
      />
      <IconButton
        tone="warning"
        icon={<EditOutlined />}
        label={t('enrollments.actions.edit')}
        onClick={() => onEdit?.(row)}
      />
      <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
        <span>
          <IconButton tone="muted" icon={<MoreOutlined />} label={t('enrollments.actions.more')} />
        </span>
      </Dropdown>
    </div>
  );
}

export default EnrollmentActions;
