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
import { Button, Input, Table, Pagination } from 'antd';
import { motion } from 'motion/react';
import { useTranslation } from '@lib/i18n/useTranslation';
import { staggerContainer, staggerItem } from '@lib/motion/presets';
import { PageHeader } from '@ui/molecules/PageHeader/PageHeader';
import { KpiCard } from '@ui/molecules/KpiCard/KpiCard';
import { EmptyState } from '@ui/molecules/EmptyState/EmptyState';
import { ErrorState } from '@ui/molecules/ErrorState/ErrorState';
import { Chip } from '@ui/atoms/Chip/Chip';
import { Skeleton } from '@ui/atoms/Skeleton/Skeleton';
import { useEnrollmentsList } from './useEnrollmentsList';
import { buildColumns } from './buildColumns';
import './EnrollmentsListPage.css';

const MotionDiv = motion.div;

function ListSkeleton() {
  return (
    <div className="mat-skeleton">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} height={56} radius="0" />
      ))}
    </div>
  );
}

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
  } = useEnrollmentsList();

  const noop = () => {};
  const columns = useMemo(() => buildColumns(t, { onView: noop, onEdit: noop }), [t]);

  const breadcrumb = [
    { title: (<span><HomeOutlined /> {t('enrollments.breadcrumbHome')}</span>) },
    { title: t('enrollments.breadcrumbEnrollment') },
    { title: t('enrollments.breadcrumbList') },
  ];

  const pct = (n) => (kpis.total ? Math.round((n / kpis.total) * 100) : 0);

  return (
    <div className="mat-page">
      <PageHeader
        breadcrumb={breadcrumb}
        title={t('enrollments.title')}
        subtitle={t('enrollments.subtitle', { term: t('topbar.term', { year: 2026 }) })}
        actions={
          <>
            <Button icon={<DownloadOutlined />}>{t('enrollments.actions.export')}</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              {t('enrollments.actions.newEnrollment')}
            </Button>
          </>
        }
      />

      <MotionDiv className="mat-kpis" variants={staggerContainer} initial="hidden" animate="visible">
        <MotionDiv variants={staggerItem}>
          <KpiCard label={t('enrollments.kpi.totalEnrolled')} value={kpis.total} icon={<TeamOutlined />}
            accent="var(--brand-600)" sub={t('topbar.term', { year: 2026 })} />
        </MotionDiv>
        <MotionDiv variants={staggerItem}>
          <KpiCard label={t('enrollments.kpi.returningStudents')} value={kpis.returning} icon={<RiseOutlined />}
            accent="var(--accent-gold)" sub={t('enrollments.kpi.ofTotal', { pct: pct(kpis.returning) })} />
        </MotionDiv>
        <MotionDiv variants={staggerItem}>
          <KpiCard label={t('enrollments.kpi.newEntries')} value={kpis.news} icon={<UserAddOutlined />}
            accent="var(--accent-sky)" sub={t('enrollments.kpi.firstTerm')} />
        </MotionDiv>
        <MotionDiv variants={staggerItem}>
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
        <Input.Search
          className="mat-toolbar__search"
          placeholder={t('topbar.searchPlaceholder')}
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mat-table">
        {loading ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title={t('enrollments.states.emptyTitle')} hint={t('enrollments.states.emptyHint')}>
            {hasFilters ? <Button onClick={clearFilters}>{t('enrollments.states.clearFilters')}</Button> : null}
          </EmptyState>
        ) : (
          <Table rowKey="id" columns={columns} dataSource={paged} pagination={false} size="middle" />
        )}

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
