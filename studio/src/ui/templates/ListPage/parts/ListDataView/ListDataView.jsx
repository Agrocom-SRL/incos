/**
 * ListDataView — superficie de datos del listado (genérica).
 *
 * Encapsula el switch carga / vacío / error-vacío / (tabla ↔ tarjetas) con
 * AnimatePresence (mode="popLayout") y el footer (conteo + paginación). Estado y
 * handlers por props (DIP); no hace fetch. Generaliza sections/EnrollmentDataView.
 *
 * Vocabulario de vista UNIFICADO a 'table' | 'card': el grid de tarjetas se pinta
 * cuando viewMode !== 'table'; el skeleton recibe EXACTAMENTE el mismo valor.
 */
import { PlusOutlined } from '@ant-design/icons';
import { Button, Table, Pagination } from 'antd';
import { AnimatePresence, motion } from 'motion/react';
import { EmptyState } from '@ui/molecules/EmptyState/EmptyState';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { presenceSwap, staggerContainer, staggerItem } from '@lib/motion/presets';
import { ListSkeleton } from '../ListSkeleton/ListSkeleton';
import { ListDensityProvider } from '../../ListDensityContext';
import { useResponsiveTable } from '../../hooks/useResponsiveTable';
import { useResidualExpandable } from '../../hooks/useResidualExpandable';
import './ListDataView.css';

const MotionDiv = motion.div;

/** Grid de tarjetas genérico con entrada en cascada (stagger gateado). */
function CardGrid({ rows, getRowKey, renderCard, reduce }) {
  return (
    <MotionDiv
      className="mat-grid"
      variants={reduce ? undefined : staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {rows.map((row) => (
        <MotionDiv key={getRowKey(row)} variants={reduce ? undefined : staggerItem}>
          {renderCard(row)}
        </MotionDiv>
      ))}
    </MotionDiv>
  );
}

export function ListDataView({
  loading,
  columns,
  paged,
  filtered,
  viewMode,
  getRowKey,
  renderCard,
  selectedRowKeys,
  setSelectedRowKeys,
  onRowOpen,
  hasFilters,
  onClearFilters,
  onNew,
  newLabelKey,
  emptyTitleKey,
  emptyHintKey,
  clearFiltersLabelKey,
  page,
  pageSize,
  setPage,
  setPageSize,
  pageSizeOptions = ['10', '20', '50'],
  renderSkeleton,
}) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const swap = reduce ? undefined : presenceSwap;

  // Medición + histéresis + decisión de columnas (qué cabe y con qué densidad en
  // el ancho REAL del contenedor). Toda la mecánica anti-parpadeo vive en el hook.
  const { tableRef, visibleColumns, hiddenColumns, density } = useResponsiveTable(columns, viewMode);

  // API de expansión (fila residual con las columnas ocultas + toggle a11y/i18n).
  // `undefined` cuando no hay columnas ocultas → la Table no pinta el toggle.
  const expandable = useResidualExpandable({ hiddenColumns, getRowKey });

  const skeleton = renderSkeleton ? renderSkeleton(viewMode) : <ListSkeleton viewMode={viewMode} />;

  return (
    <div className="mat-table">
      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <MotionDiv key="skeleton" variants={swap} initial="hidden" animate="visible" exit="exit">
            {skeleton}
          </MotionDiv>
        ) : filtered.length === 0 ? (
          <MotionDiv key="empty" variants={swap} initial="hidden" animate="visible" exit="exit">
            <EmptyState title={t(emptyTitleKey)} hint={t(emptyHintKey)}>
              {hasFilters ? (
                <Button onClick={onClearFilters}>{t(clearFiltersLabelKey)}</Button>
              ) : onNew ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
                  {t(newLabelKey)}
                </Button>
              ) : null}
            </EmptyState>
          </MotionDiv>
        ) : (
          <MotionDiv key={`data-${viewMode}`} variants={swap} initial="hidden" animate="visible" exit="exit">
            {viewMode === 'table' ? (
              <div ref={tableRef} className="mat-table__measure">
                <ListDensityProvider value={density}>
                  <Table
                    rowKey={getRowKey}
                    columns={visibleColumns}
                    dataSource={paged}
                    pagination={false}
                    size="middle"
                    // scroll.x activa el anclaje sticky de la columna `fixed:'right'`
                    // (acciones). No genera scroll real: useResponsiveColumns ya ajusta
                    // las columnas visibles al ancho medido, así que '100%' solo habilita
                    // el modo fixed sin desbordar el wrapper.
                    scroll={{ x: '100%' }}
                    rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                    expandable={expandable}
                    onRow={(row) => ({
                      onClick: (e) => {
                        // Ignora clicks en controles de fila y en el toggle de expand.
                        if (
                          e.target.closest(
                            'button, a, input, .ant-checkbox, .ant-dropdown, .mat-expand, .ant-table-row-expand-icon',
                          )
                        )
                          return;
                        onRowOpen?.(row);
                      },
                    })}
                  />
                </ListDensityProvider>
              </div>
            ) : (
              <CardGrid rows={paged} getRowKey={getRowKey} renderCard={renderCard} reduce={reduce} />
            )}
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className="mat-footer">
        <span className="mat-footer__count">
          {t('common.showing', {
            from: filtered.length === 0 ? 0 : (page - 1) * pageSize + 1,
            to: Math.min(page * pageSize, filtered.length),
            total: filtered.length,
          })}
        </span>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filtered.length}
          showSizeChanger
          pageSizeOptions={pageSizeOptions}
          onChange={(p, s) => {
            setPage(p);
            if (s) setPageSize(s);
          }}
        />
      </div>
    </div>
  );
}

export default ListDataView;
