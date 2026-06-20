/**
 * FilterToolbar — barra de filtros del listado (dentro de la card).
 *
 * Organismo LOCAL del feature matrícula. Render puro: buscador + Segmented de tipo
 * + Select de historial + zona derecha que alterna (AnimatePresence mode="wait")
 * entre la barra de acciones masivas y el contador + toggle lista/tarjetas.
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
import { HISTORY_FILTER_OPTIONS } from './historyStates';
import { BulkActionsBar } from './BulkActionsBar';
import './FilterToolbar.css';

const MotionDiv = motion.div;

export function FilterToolbar({
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
}) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const variants = reduce ? undefined : presenceWait;

  const historyOptions = HISTORY_FILTER_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }));

  return (
    <div className="mat-toolbar__inner">
      <Input
        className="mat-toolbar__search"
        prefix={<SearchOutlined className="mat-toolbar__search-icon" />}
        placeholder={t('topbar.searchPlaceholder')}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
      />
      <div className="mat-toolbar__filters">
        <Segmented
          value={tipoFilter}
          onChange={onTipoFilterChange}
          options={[
            { label: t('enrollments.filters.all'), value: 'todos' },
            { label: t('enrollments.filters.returning'), value: 'antiguos' },
            { label: t('enrollments.filters.news'), value: 'nuevos' },
          ]}
        />
        <Select
          className="mat-toolbar__history"
          placeholder={t('enrollments.filters.historyPlaceholder')}
          value={historyFilter}
          onChange={onHistoryFilterChange}
          allowClear
          options={historyOptions}
        />
      </div>
      <div className="mat-toolbar__spacer" />
      <AnimatePresence mode="wait" initial={false}>
        {selectedCount > 0 ? (
          <MotionDiv
            key="bulk"
            variants={variants}
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
            className="mat-toolbar__actions"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span className="mat-toolbar__count">
              {t('enrollments.filters.results', { count: filteredCount })}
            </span>
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
      </AnimatePresence>
    </div>
  );
}

export default FilterToolbar;
