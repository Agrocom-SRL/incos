/**
 * EnrollmentDataView — superficie de datos del listado (organismo local).
 * Encapsula el switch carga / vacío / (tabla ↔ tarjetas) con AnimatePresence y el
 * footer (conteo + paginación). Estado y handlers por props (DIP); no hace fetch.
 */
import { PlusOutlined } from '@ant-design/icons';
import { Button, Table, Pagination } from 'antd';
import { AnimatePresence, motion } from 'motion/react';
import { EmptyState } from '@ui/molecules/EmptyState/EmptyState';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { presenceSwap } from '@lib/motion/presets';
import { StudentCardGrid } from '../StudentCardGrid';
import { ListSkeleton } from '../ListSkeleton';
import './EnrollmentDataView.css';

const MotionDiv = motion.div;

export function EnrollmentDataView({
  loading,
  columns,
  paged,
  filtered,
  viewMode,
  selectedRowKeys,
  setSelectedRowKeys,
  rowHandlers,
  hasFilters,
  onClearFilters,
  onNew,
  page,
  pageSize,
  setPage,
  setPageSize,
}) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const swap = reduce ? undefined : presenceSwap;

  return (
    <div className="mat-table">
      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <MotionDiv key="skeleton" variants={swap} initial="hidden" animate="visible" exit="exit">
            <ListSkeleton viewMode={viewMode} />
          </MotionDiv>
        ) : filtered.length === 0 ? (
          <MotionDiv key="empty" variants={swap} initial="hidden" animate="visible" exit="exit">
            <EmptyState title={t('enrollments.states.emptyTitle')} hint={t('enrollments.states.emptyHint')}>
              {hasFilters ? (
                <Button onClick={onClearFilters}>{t('enrollments.states.clearFilters')}</Button>
              ) : (
                <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
                  {t('enrollments.actions.newEnrollment')}
                </Button>
              )}
            </EmptyState>
          </MotionDiv>
        ) : (
          <MotionDiv key={`data-${viewMode}`} variants={swap} initial="hidden" animate="visible" exit="exit">
            {viewMode === 'table' ? (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={paged}
                pagination={false}
                size="middle"
                rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                onRow={(row) => ({
                  onClick: (e) => {
                    if (e.target.closest('button, a, input, .ant-checkbox, .ant-dropdown')) return;
                    rowHandlers.onOpen(row);
                  },
                })}
              />
            ) : (
              <StudentCardGrid rows={paged} handlers={rowHandlers} />
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
          pageSizeOptions={['10', '20', '50']}
          onChange={(p, s) => {
            setPage(p);
            if (s) setPageSize(s);
          }}
        />
      </div>
    </div>
  );
}

export default EnrollmentDataView;
