/**
 * ListFilterBar — barra de filtros del listado (dentro de la card), genérica.
 *
 * Render puro: buscador + filtros declarativos (Segmented/Select desde config) +
 * zona derecha que alterna (AnimatePresence mode="wait") entre las acciones masivas
 * (slot `bulkSlot`) y el contador + toggle de vista. Generaliza FilterToolbar.
 *
 * Vocabulario de vista UNIFICADO a 'table' | 'card' (antes 'grid' suelto en mv2).
 */
import {
  SearchOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { Input, Segmented, Select } from 'antd';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { presenceWait } from '@lib/motion/presets';
import './ListFilterBar.css';

const MotionDiv = motion.div;

/** Render de un filtro declarativo (segmented | select). */
function FilterControl({ filter, value, onChange, t }) {
  const options = filter.options.map((o) => ({ value: o.value, label: t(o.labelKey) }));
  if (filter.type === 'segmented') {
    return <Segmented value={value} onChange={onChange} options={options} />;
  }
  return (
    <Select
      className="mat-toolbar__history"
      placeholder={filter.placeholderKey ? t(filter.placeholderKey) : undefined}
      value={value}
      onChange={onChange}
      allowClear={filter.allowClear ?? true}
      options={options}
    />
  );
}

export function ListFilterBar({
  search,
  onSearchChange,
  searchPlaceholderKey,
  filters = [],
  filterValues,
  onFilterChange,
  selectedCount,
  bulkSlot,
  showViewToggle = false,
  viewMode,
  onViewModeChange,
  filteredCount,
  resultsLabelKey = 'common.results',
}) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const variants = reduce ? undefined : presenceWait;

  return (
    <div className="mat-toolbar__inner">
      <Input
        className="mat-toolbar__search"
        prefix={<SearchOutlined className="mat-toolbar__search-icon" />}
        placeholder={searchPlaceholderKey ? t(searchPlaceholderKey) : undefined}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
      />
      {filters.length ? (
        <div className="mat-toolbar__filters">
          {filters.map((f) => (
            <FilterControl
              key={f.key}
              filter={f}
              value={filterValues[f.key]}
              onChange={(v) => onFilterChange(f.key, v)}
              t={t}
            />
          ))}
        </div>
      ) : null}
      <div className="mat-toolbar__spacer" />
      <AnimatePresence mode="wait" initial={false}>
        {selectedCount > 0 && bulkSlot ? (
          <MotionDiv
            key="bulk"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ minWidth: 0 }}
          >
            {bulkSlot}
          </MotionDiv>
        ) : (
          <MotionDiv
            key="actions"
            className="mat-toolbar__actions"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span className="mat-toolbar__count">
              {t(resultsLabelKey, { count: filteredCount })}
            </span>
            {showViewToggle ? (
              <Segmented
                value={viewMode}
                onChange={onViewModeChange}
                options={[
                  { value: 'table', icon: <UnorderedListOutlined /> },
                  { value: 'card', icon: <AppstoreOutlined /> },
                ]}
              />
            ) : null}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ListFilterBar;
