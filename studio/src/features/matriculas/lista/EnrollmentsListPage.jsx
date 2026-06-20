/**
 * EnrollmentsListPage — pantalla de listado de inscripciones (gemela de MatriculaListV2).
 *
 * Responsabilidad ÚNICA: COMPONER. Inyecta el hook de estado en las secciones
 * (PageHeader/HeaderActions, KPIs, CareerChips, FilterToolbar, DataView). Sin lógica
 * de negocio ni render de detalle: cada sección es responsable de lo suyo.
 */
import { useMemo } from 'react';
import { HomeOutlined } from '@ant-design/icons';
import { useTranslation } from '@lib/i18n/useTranslation';
import { PageHeader } from '@ui/molecules/PageHeader/PageHeader';
import { ErrorState } from '@ui/molecules/ErrorState/ErrorState';
import { useEnrollmentsList } from './useEnrollmentsList';
import { buildColumns } from './buildColumns';
import { FilterToolbar } from './FilterToolbar';
import { EnrollmentKpis } from './sections/EnrollmentKpis';
import { CareerChips } from './sections/CareerChips';
import { EnrollmentHeaderActions } from './sections/EnrollmentHeaderActions';
import { EnrollmentDataView } from './sections/EnrollmentDataView';

const noop = () => {};

export function EnrollmentsListPage() {
  const { t } = useTranslation();
  const list = useEnrollmentsList();

  // Handlers de fila/tarjeta (mock: no-op hasta integrar backend/navegación).
  const rowHandlers = useMemo(
    () => ({ onOpen: noop, onView: noop, onEdit: noop, onPrint: noop, onEmail: noop, onReport: noop, onDelete: noop }),
    [],
  );
  const columns = useMemo(() => buildColumns(t, rowHandlers), [t, rowHandlers]);

  const termLabel = t('topbar.term', { year: 2026 });
  const breadcrumb = [
    { title: (<span><HomeOutlined /> {t('enrollments.breadcrumbHome')}</span>) },
    { title: t('enrollments.breadcrumbEnrollment') },
    { title: t('enrollments.breadcrumbList') },
  ];

  return (
    <div className="mat-page">
      <PageHeader
        breadcrumb={breadcrumb}
        title={t('enrollments.title')}
        subtitle={t('enrollments.subtitle', { term: termLabel })}
        actions={
          <EnrollmentHeaderActions
            careerSelectOptions={list.careerSelectOptions}
            selectedCareerForExport={list.selectedCareerForExport}
            onSelectCareer={list.setSelectedCareerForExport}
            onExport={list.onExport}
            onNew={noop}
          />
        }
      />

      <EnrollmentKpis kpis={list.kpis} termLabel={termLabel} />

      <CareerChips
        careers={list.careers}
        total={list.kpis.total}
        value={list.careerFilter}
        onChange={list.setCareerFilter}
      />

      {list.error ? <ErrorState title={t('enrollments.states.errorTitle')} description={list.error} /> : null}

      <div className="mat-toolbar">
        <FilterToolbar
          search={list.search}
          onSearchChange={list.setSearch}
          tipoFilter={list.tipoFilter}
          onTipoFilterChange={list.setTipoFilter}
          historyFilter={list.historyFilter}
          onHistoryFilterChange={list.setHistoryFilter}
          selectedCount={list.selectedRowKeys.length}
          viewMode={list.viewMode}
          onViewModeChange={list.setViewMode}
          filteredCount={list.filtered.length}
          onBulkNotify={list.onBulkNotify}
          onBulkExport={list.onBulkExport}
          onBulkDelete={list.onBulkDelete}
        />
      </div>

      <EnrollmentDataView
        loading={list.loading}
        columns={columns}
        paged={list.paged}
        filtered={list.filtered}
        viewMode={list.viewMode}
        selectedRowKeys={list.selectedRowKeys}
        setSelectedRowKeys={list.setSelectedRowKeys}
        rowHandlers={rowHandlers}
        hasFilters={list.hasFilters}
        onClearFilters={list.clearFilters}
        onNew={noop}
        page={list.page}
        pageSize={list.pageSize}
        setPage={list.setPage}
        setPageSize={list.setPageSize}
      />
    </div>
  );
}

export default EnrollmentsListPage;
