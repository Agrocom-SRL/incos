/**
 * EnrollmentsListPage — pantalla de listado de inscripciones (gemela de MatriculaListV2).
 *
 * Responsabilidad ÚNICA: RENDER. La lógica vive en useEnrollmentsList; los datos en
 * la api mock; las columnas en buildColumns. Compone moléculas/átomos compartidos.
 */
import { useMemo } from 'react';
import {
  HomeOutlined,
  PlusOutlined,
  DownloadOutlined,
  TeamOutlined,
  RiseOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Button, Table, Pagination, Select } from 'antd';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { staggerContainer, staggerItem, presenceSwap } from '@lib/motion/presets';
import { PageHeader } from '@ui/molecules/PageHeader/PageHeader';
import { KpiCard } from '@ui/molecules/KpiCard/KpiCard';
import { EmptyState } from '@ui/molecules/EmptyState/EmptyState';
import { ErrorState } from '@ui/molecules/ErrorState/ErrorState';
import { Chip } from '@ui/atoms/Chip/Chip';
import { useEnrollmentsList } from './useEnrollmentsList';
import { buildColumns } from './buildColumns';
import { FilterToolbar } from './FilterToolbar';
import { StudentCardGrid } from './StudentCardGrid';
import { ListSkeleton } from './ListSkeleton';
import './EnrollmentsListPage.css';

const MotionDiv = motion.div;

export function EnrollmentsListPage() {
  const { t } = useTranslation();
  const {
    loading,
    error,
    kpis,
    careers,
    filtered,
    paged,
    search,
    setSearch,
    careerFilter,
    setCareerFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    hasFilters,
    clearFilters,
    selectedRowKeys,
    setSelectedRowKeys,
    onBulkNotify,
    onBulkExport,
    onBulkDelete,
    tipoFilter,
    setTipoFilter,
    historyFilter,
    setHistoryFilter,
    viewMode,
    setViewMode,
    selectedCareerForExport,
    setSelectedCareerForExport,
    careerSelectOptions,
    onExport,
  } = useEnrollmentsList();

  const reduce = useReducedMotion();
  const noop = () => {};
  // Handlers de fila/tarjeta (mock: no-op hasta integrar backend/navegación).
  const rowHandlers = useMemo(
    () => ({ onOpen: noop, onView: noop, onEdit: noop, onPrint: noop, onEmail: noop, onReport: noop, onDelete: noop }),
    [],
  );
  const columns = useMemo(() => buildColumns(t, rowHandlers), [t, rowHandlers]);

  const breadcrumb = [
    { title: (<span><HomeOutlined /> {t('enrollments.breadcrumbHome')}</span>) },
    { title: t('enrollments.breadcrumbEnrollment') },
    { title: t('enrollments.breadcrumbList') },
  ];

  const pct = (n) => (kpis.total ? Math.round((n / kpis.total) * 100) : 0);

  // Color de la carrera elegida para teñir el botón Export (white-label vía token).
  const exportColor =
    careerSelectOptions.find((c) => c.value === selectedCareerForExport)?.color || 'var(--brand-600)';

  return (
    <div className="mat-page">
      <PageHeader
        breadcrumb={breadcrumb}
        title={t('enrollments.title')}
        subtitle={t('enrollments.subtitle', { term: t('topbar.term', { year: 2026 }) })}
        actions={
          <>
            <Select
              className="mat-export-select"
              placeholder={t('enrollments.actions.exportCareerPlaceholder')}
              showSearch
              allowClear
              optionFilterProp="label"
              value={selectedCareerForExport}
              onChange={setSelectedCareerForExport}
              options={careerSelectOptions}
            />
            <Button
              icon={<DownloadOutlined />}
              disabled={!selectedCareerForExport}
              className={selectedCareerForExport ? 'mat-export-btn--career' : ''}
              style={
                selectedCareerForExport
                  ? { '--export-color': exportColor }
                  : undefined
              }
              onClick={onExport}
            >
              {t('enrollments.actions.export')}
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              {t('enrollments.actions.newEnrollment')}
            </Button>
          </>
        }
      />

      <MotionDiv className="mat-kpis" variants={reduce ? undefined : staggerContainer} initial="hidden" animate="visible">
        <MotionDiv variants={reduce ? undefined : staggerItem}>
          <KpiCard label={t('enrollments.kpi.totalEnrolled')} value={kpis.total} icon={<TeamOutlined />}
            accent="var(--brand-600)" sub={t('topbar.term', { year: 2026 })} />
        </MotionDiv>
        <MotionDiv variants={reduce ? undefined : staggerItem}>
          <KpiCard label={t('enrollments.kpi.returningStudents')} value={kpis.returning} icon={<RiseOutlined />}
            accent="var(--accent-gold)" sub={t('enrollments.kpi.ofTotal', { pct: pct(kpis.returning) })} />
        </MotionDiv>
        <MotionDiv variants={reduce ? undefined : staggerItem}>
          <KpiCard label={t('enrollments.kpi.newEntries')} value={kpis.news} icon={<UserAddOutlined />}
            accent="var(--accent-sky)" sub={t('enrollments.kpi.firstTerm')} />
        </MotionDiv>
        <MotionDiv variants={reduce ? undefined : staggerItem}>
          <KpiCard label={t('enrollments.kpi.pendingRecords')} value={kpis.pending} icon={<ClockCircleOutlined />}
            accent="var(--accent-red)" sub={t('enrollments.kpi.needReview')} />
        </MotionDiv>
      </MotionDiv>

      <div className="mat-chips">
        <Chip label={t('enrollments.chips.all')} count={kpis.total} active={!careerFilter} showDot={false}
          onClick={() => setCareerFilter(null)} />
        {careers.map((c) => (
          <Chip key={c.id} label={c.name} count={c.count} color={c.color} active={careerFilter === c.id}
            onClick={() => setCareerFilter(careerFilter === c.id ? null : c.id)} />
        ))}
      </div>

      {error ? (
        <ErrorState title={t('enrollments.states.errorTitle')} description={error} />
      ) : null}

      <div className="mat-toolbar">
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          tipoFilter={tipoFilter}
          onTipoFilterChange={setTipoFilter}
          historyFilter={historyFilter}
          onHistoryFilterChange={setHistoryFilter}
          selectedCount={selectedRowKeys.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filtered.length}
          onBulkNotify={onBulkNotify}
          onBulkExport={onBulkExport}
          onBulkDelete={onBulkDelete}
        />
      </div>

      <div className="mat-table">
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <MotionDiv
              key="skeleton"
              variants={reduce ? undefined : presenceSwap}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ListSkeleton viewMode={viewMode} />
            </MotionDiv>
          ) : filtered.length === 0 ? (
            <MotionDiv
              key="empty"
              variants={reduce ? undefined : presenceSwap}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <EmptyState
                title={t('enrollments.states.emptyTitle')}
                hint={t('enrollments.states.emptyHint')}
              >
                {hasFilters ? (
                  <Button onClick={clearFilters}>{t('enrollments.states.clearFilters')}</Button>
                ) : (
                  <Button type="primary" icon={<PlusOutlined />}>
                    {t('enrollments.actions.newEnrollment')}
                  </Button>
                )}
              </EmptyState>
            </MotionDiv>
          ) : (
            <MotionDiv
              key={`data-${viewMode}`}
              variants={reduce ? undefined : presenceSwap}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
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
    </div>
  );
}

export default EnrollmentsListPage;
