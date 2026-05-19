/**
 * Barra de filtros del listado v2.
 */
import {
  AppstoreOutlined,
  DeleteOutlined,
  DownloadOutlined,
  MailOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Input, Segmented, Select, Space } from 'antd';
import { HISTORY_FILTER_OPTIONS } from '../utils/historyStates';

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
      prefix={<SearchOutlined style={{ color: 'var(--text-soft)' }} />}
      placeholder="Buscar por nombre, código, CI..."
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      style={{ maxWidth: 320, borderRadius: 8 }}
      allowClear
    />
    <Segmented
      value={tipoFilter}
      onChange={onTipoFilterChange}
      options={[
        { label: 'Todos', value: 'todos' },
        { label: 'Antiguos', value: 'antiguos' },
        { label: 'Nuevos', value: 'nuevos' },
      ]}
    />
    <Select
      placeholder="Historial"
      value={historyFilter}
      onChange={onHistoryFilterChange}
      allowClear
      style={{ width: 170 }}
      options={HISTORY_FILTER_OPTIONS}
    />
    <div style={{ flex: 1 }} />
    {selectedCount > 0 ? (
      <Space wrap>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--brand-700)' }}>{selectedCount}</strong> seleccionados
        </span>
        <Button size="small" icon={<MailOutlined />} onClick={onBulkNotify}>
          Notificar
        </Button>
        <Button size="small" icon={<DownloadOutlined />} onClick={onBulkExport}>
          Exportar
        </Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={onBulkDelete}>
          Eliminar
        </Button>
      </Space>
    ) : (
      <Space wrap>
        <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>{filteredCount} resultados</span>
        <Segmented
          value={viewMode}
          onChange={onViewModeChange}
          options={[
            { value: 'table', icon: <UnorderedListOutlined /> },
            { value: 'grid', icon: <AppstoreOutlined /> },
          ]}
        />
      </Space>
    )}
  </div>
);

export default FilterToolbar;
