/**
 * Barra de filtros del listado v2.
 */
import {
  AppstoreOutlined,
  DeleteOutlined,
  DownloadOutlined,
  MailOutlined,
  MoreOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, Segmented, Select } from 'antd';
import { motion } from 'motion/react';
import { HISTORY_FILTER_OPTIONS } from '../utils/historyStates';
import { mv2DropdownPopupProps, mv2SelectPopupProps } from '../theme/popupClass';
import PresenceSwap from '@presentation/components/atoms/motion/PresenceSwap';
import { variants } from '@presentation/motion/presets';

// Alias capitalizado (linter JSX)
const MotionDiv = motion.div;

function BulkActionsBar({ selectedCount, onBulkNotify, onBulkExport, onBulkDelete }) {
  const menu = {
    items: [
      {
        key: 'notify',
        icon: <MailOutlined />,
        label: 'Notificar',
        onClick: onBulkNotify,
      },
      {
        key: 'export',
        icon: <DownloadOutlined />,
        label: 'Exportar',
        onClick: onBulkExport,
      },
      { type: 'divider' },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Eliminar',
        danger: true,
        onClick: onBulkDelete,
      },
    ],
  };

  return (
    <div className="matricula-v2-bulk-actions">
      <span className="matricula-v2-bulk-actions__count">
        <strong>{selectedCount}</strong> seleccionados
      </span>
      <div className="matricula-v2-bulk-actions__buttons">
        <Button
          size="small"
          icon={<MailOutlined />}
          className="matricula-v2-btn matricula-v2-btn--ghost"
          onClick={onBulkNotify}
        >
          Notificar
        </Button>
        <Button
          size="small"
          icon={<DownloadOutlined />}
          className="matricula-v2-btn matricula-v2-btn--ghost"
          onClick={onBulkExport}
        >
          Exportar
        </Button>
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          className="matricula-v2-btn matricula-v2-btn--danger"
          onClick={onBulkDelete}
        >
          Eliminar
        </Button>
      </div>
      <Dropdown {...mv2DropdownPopupProps} menu={menu} trigger={['click']}>
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          className="matricula-v2-bulk-actions__menu-btn"
          aria-label="Acciones de selección"
        />
      </Dropdown>
    </div>
  );
}

/**
 * @param {object} props
 */
const FilterToolbar = ({
  search,
  onSearchChange,
  tipoFilter,
  onTipoFilterChange,
  historyFilter,
  onHistoryFilterChange,
  selectedCount,
  viewMode,
  onViewModeChange,
  filteredCount,
  onBulkNotify,
  onBulkExport,
  onBulkDelete,
}) => (
  <div className="matricula-v2-toolbar-inner">
    <Input
      className="matricula-v2-toolbar-search"
      prefix={<SearchOutlined style={{ color: 'var(--text-soft)' }} />}
      placeholder="Buscar por nombre, código, CI..."
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      allowClear
    />
    <div className="matricula-v2-toolbar-filters">
      <Segmented
        className="matricula-v2-toolbar-segmented"
        value={tipoFilter}
        onChange={onTipoFilterChange}
        options={[
          { label: 'Todos', value: 'todos' },
          { label: 'Antiguos', value: 'antiguos' },
          { label: 'Nuevos', value: 'nuevos' },
        ]}
      />
      <Select
        {...mv2SelectPopupProps}
        className="matricula-v2-toolbar-history"
        placeholder="Historial"
        value={historyFilter}
        onChange={onHistoryFilterChange}
        allowClear
        style={{ width: 170 }}
        options={HISTORY_FILTER_OPTIONS}
      />
    </div>
    <div className="matricula-v2-toolbar-spacer" />
    {/* PresenceSwap mode="wait": swap bulk/actions con variants.presenceWait (presets, sin literales). */}
    <PresenceSwap mode="wait">
      {selectedCount > 0 ? (
        <MotionDiv
          key="bulk"
          variants={variants.presenceWait}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ minWidth: 0 }}
        >
          <BulkActionsBar
            selectedCount={selectedCount}
            onBulkNotify={onBulkNotify}
            onBulkExport={onBulkExport}
            onBulkDelete={onBulkDelete}
          />
        </MotionDiv>
      ) : (
        <MotionDiv
          key="actions"
          className="matricula-v2-toolbar-actions"
          variants={variants.presenceWait}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <span className="matricula-v2-toolbar-actions__count">{filteredCount} resultados</span>
          <Segmented
            value={viewMode}
            onChange={onViewModeChange}
            options={[
              { value: 'table', icon: <UnorderedListOutlined /> },
              { value: 'grid', icon: <AppstoreOutlined /> },
            ]}
          />
        </MotionDiv>
      )}
    </PresenceSwap>
  </div>
);

export default FilterToolbar;
