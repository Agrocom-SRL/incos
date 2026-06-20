/**
 * BulkActionsBar — barra de acciones masivas para la selección de filas.
 *
 * Organismo LOCAL del feature matrícula. Render puro: cuenta seleccionados y
 * expone Notificar/Exportar/Eliminar + un Dropdown "⋮". Textos vía i18n.
 */
import {
  MailOutlined,
  DownloadOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { useTranslation } from '@lib/i18n/useTranslation';
import './BulkActionsBar.css';

export function BulkActionsBar({ selectedCount, onBulkNotify, onBulkExport, onBulkDelete }) {
  const { t } = useTranslation();

  const menu = {
    items: [
      { key: 'notify', icon: <MailOutlined />, label: t('enrollments.bulk.notify'), onClick: onBulkNotify },
      { key: 'export', icon: <DownloadOutlined />, label: t('enrollments.bulk.export'), onClick: onBulkExport },
      { type: 'divider' },
      { key: 'delete', icon: <DeleteOutlined />, label: t('enrollments.bulk.delete'), danger: true, onClick: onBulkDelete },
    ],
  };

  return (
    <div className="mat-bulk">
      <span className="mat-bulk__count">
        {t('enrollments.bulk.selected', { count: selectedCount })}
      </span>
      <div className="mat-bulk__buttons">
        <Button size="small" icon={<MailOutlined />} onClick={onBulkNotify}>
          {t('enrollments.bulk.notify')}
        </Button>
        <Button size="small" icon={<DownloadOutlined />} onClick={onBulkExport}>
          {t('enrollments.bulk.export')}
        </Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={onBulkDelete}>
          {t('enrollments.bulk.delete')}
        </Button>
      </div>
      <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          className="mat-bulk__menu-btn"
          aria-label={t('enrollments.bulk.more')}
        />
      </Dropdown>
    </div>
  );
}

export default BulkActionsBar;
