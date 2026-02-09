/**
 * SelectableDataList: Lista de datos con selección múltiple (click o checkboxes)
 *
 * - showCheckboxes: si false (default), solo filas clickeables para toggle
 * - showSelectAll: si true, muestra checkbox "Marcar todos / Desmarcar todos" arriba de la lista
 */

import { Empty, Flex, Space, Checkbox } from 'antd';
import { Spinner, ListItem } from '@atoms';

const SelectableDataList = ({
  data = [],
  loading = false,
  emptyMessage = 'No se encontraron datos',
  renderItem,
  selectedIds = [],
  onSelectionChange = null,
  getItemId = (item) => item?.id,
  loadingText = 'Cargando...',
  className = '',
  disabled = false,
  showCheckboxes = false,
  showSelectAll = false,
  selectAllLabel = 'Marcar todos',
  selectNoneLabel = 'Desmarcar todos',
}) => {
  if (loading) {
    return (
      <Flex vertical align="center" justify="center" className="data-list-loading">
        <Spinner size="large" text={loadingText} />
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty
        description={emptyMessage}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const listClassName = className ? `data-list selectable-data-list ${className}`.trim() : 'data-list selectable-data-list';
  const allIds = data.map((item) => getItemId(item)).filter((id) => id != null);
  const allSelected = allIds.length > 0 && selectedIds.length >= allIds.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < allIds.length;

  const handleToggle = (item, checked) => {
    if (disabled || !onSelectionChange) return;
    const id = getItemId(item);
    if (id == null) return;
    const next = checked
      ? [...selectedIds, id]
      : selectedIds.filter((i) => i !== id);
    onSelectionChange(next);
  };

  const handleSelectAll = (checked) => {
    if (disabled || !onSelectionChange) return;
    onSelectionChange(checked ? [...allIds] : []);
  };

  return (
    <Flex vertical className={listClassName} gap={0}>
      {showSelectAll && !disabled && (
        <div className="selectable-data-list__select-all">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            {allSelected ? selectNoneLabel : selectAllLabel}
          </Checkbox>
        </div>
      )}
      <Space orientation="vertical" size={0} style={{ width: '100%' }}>
        {data.map((item, index) => {
          const itemProps = renderItem ? renderItem(item, index) : { title: String(getItemId(item) ?? index) };
          const id = getItemId(item);
          const checked = disabled || (Array.isArray(selectedIds) && selectedIds.includes(id));

          const rowContent = (
            <div
              className="selectable-data-list__item"
              style={{ flex: 1, minWidth: 0 }}
              onClick={() => !disabled && handleToggle(item, !checked)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!disabled) handleToggle(item, !checked);
                }
              }}
            >
              <ListItem {...itemProps} active={!!checked} onClick={null} />
            </div>
          );

          return (
            <Flex
              key={id ?? index}
              align="center"
              gap={showCheckboxes ? 'middle' : 0}
              className="selectable-data-list__row"
            >
              {showCheckboxes && (
                <Checkbox
                  checked={!!checked}
                  disabled={disabled}
                  onChange={(e) => handleToggle(item, e.target.checked)}
                />
              )}
              {rowContent}
            </Flex>
          );
        })}
      </Space>
    </Flex>
  );
};

export default SelectableDataList;
