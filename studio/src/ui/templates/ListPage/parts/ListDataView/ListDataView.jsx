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
import { useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Table, Pagination } from 'antd';
import { AnimatePresence, motion } from 'motion/react';
import { EmptyState } from '@ui/molecules/EmptyState/EmptyState';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { presenceSwap, staggerContainer, staggerItem } from '@lib/motion/presets';
import { useElementWidth } from '@lib/hooks/useElementWidth';
import { ListSkeleton } from '../ListSkeleton/ListSkeleton';
import { useResponsiveColumns } from '../../useResponsiveColumns';
import { ListDensityProvider } from '../../ListDensityContext';
import { ResidualRow } from '../ResidualRow/ResidualRow';
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

  // Mide el ancho REAL del contenedor de la tabla (encoge con el sidebar), no el
  // del viewport: la tabla muestra lo que cabe en su propio espacio. Usamos una
  // callback-ref porque el nodo medido (`mat-table__measure`) vive dentro del
  // <AnimatePresence> y solo aparece cuando entran los datos (tras el 1.er render
  // con loading=true): la callback-ref se engancha exactamente cuando React monta
  // ese nodo, un `useRef`+`useEffect` no re-correría y no observaría nunca.
  const [tableRef, containerWidth] = useElementWidth();

  // Resultado anterior para la HISTÉRESIS: al arrastrar/colapsar el sidebar el
  // ancho cruza un umbral por valores intermedios; pasar { density, hiddenKeys }
  // previos a la función pura crea una banda muerta para que una columna o la
  // densidad NO oscilen encendido/apagado en el borde (anti-parpadeo).
  const prevDecisionRef = useRef(null);

  // Solo aplica a la vista tabla; en card no se mide (containerWidth → default).
  // useResponsiveColumns es una función PURA (no un hook): se invoca siempre para
  // respetar las reglas de hooks; con width 0 devuelve todo visible / 'full'.
  const { visibleColumns, hiddenColumns, density } = useResponsiveColumns(
    columns,
    viewMode === 'table' ? containerWidth : 0,
    prevDecisionRef.current,
  );

  // Memoriza la decisión para el siguiente render (input de la histéresis). Se
  // hace en el cuerpo (no en efecto) para que el render N+1 la vea sin desfase;
  // la función sigue siendo pura: el ref solo guarda su salida, no la altera.
  prevDecisionRef.current = {
    density,
    hiddenKeys: hiddenColumns.map((c) => c.key),
  };

  const hasHidden = hiddenColumns.length > 0;
  const hiddenCount = hiddenColumns.length;
  const expandable = hasHidden
    ? {
        expandedRowRender: (row) => (
          <div id={`residual-${getRowKey(row)}`}>
            <ResidualRow hiddenColumns={hiddenColumns} row={row} />
          </div>
        ),
        rowExpandable: () => true,
        columnWidth: 48, // ancho de la columna de toggle (layout), no breakpoint
        // El toggle es el ÚNICO acceso a las columnas plegadas en ancho estrecho:
        // touch target ≥44px (CSS), tinte de marca + conteo cuando hay campos
        // ocultos (descubribilidad), y aria-expanded/-controls para lectores.
        expandIcon: ({ expanded, onExpand, record }) => (
          <button
            type="button"
            className={`ant-table-row-expand-icon mat-expand mat-expand--has-hidden ant-table-row-expand-icon-${expanded ? 'expanded' : 'collapsed'}`}
            aria-label={t('common.hiddenFields', { count: hiddenCount })}
            aria-expanded={expanded}
            aria-controls={`residual-${getRowKey(record)}`}
            onClick={(e) => {
              e.stopPropagation();
              onExpand(record, e);
            }}
          >
            {!expanded ? <span className="mat-expand__count" aria-hidden>{hiddenCount}</span> : null}
          </button>
        ),
      }
    : undefined;

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
                    rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                    expandable={expandable}
                    onRow={(row) => ({
                      onClick: (e) => {
                        // Ignora clicks en controles de fila y en el toggle de expand.
                        if (
                          e.target.closest(
                            'button, a, input, .ant-checkbox, .ant-dropdown, .ant-table-row-expand-icon',
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
