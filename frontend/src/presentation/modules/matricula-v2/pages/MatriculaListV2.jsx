/**
 * Lista de matrículas v2 — UI rediseñada (aislada del listado clásico).
 */
import { useMemo } from 'react';
import {
  ClockCircleFilled,
  DownloadOutlined,
  HomeOutlined,
  PlusOutlined,
  RiseOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Breadcrumb,
  Button,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
} from 'antd';
import CareerChip from '../components/CareerChip';
import FilterToolbar from '../components/FilterToolbar';
import KpiCard from '../components/KpiCard';
import MatriculaTableRowDetails from '../components/MatriculaTableRowDetails';
import StudentCard from '../components/StudentCard';
import { useCompactTableLayout } from '../hooks/useCompactTableLayout';
import { useMatriculaListV2 } from '../hooks/useMatriculaListV2';
import { buildMatriculaTableColumns } from '../utils/buildMatriculaTableColumns';
import { mv2SelectPopupProps } from '../theme/popupClass';

const MatriculaListV2 = () => {
  const {
    loading,
    error,
    filtered,
    paged,
    totalCount,
    antiguosCount,
    nuevosCount,
    pendientesCount,
    gestionLabel,
    careersForChips,
    careerCounts,
    search,
    setSearch,
    careerFilter,
    setCareerFilter,
    tipoFilter,
    setTipoFilter,
    historyFilter,
    setHistoryFilter,
    selectedRowKeys,
    setSelectedRowKeys,
    page,
    setPage,
    pageSize,
    setPageSize,
    viewMode,
    setViewMode,
    handleNuevaInscripcion,
    handleEdit,
    handleView,
    handleBulkNotify,
    handleBulkExport,
    handleBulkDelete,
    breadcrumbItems,
    puedeExportarLista,
    selectedCarreraId,
    setSelectedCarreraId,
    carrerasLoading,
    exportLoading,
    selectedCarrera,
    carreraColor,
    carreraSelectOptions,
    handleExportLista,
  } = useMatriculaListV2();

  const compactTable = useCompactTableLayout();
  const { fullColumns, compactColumns } = useMemo(
    () => buildMatriculaTableColumns({ handleView, handleEdit }, { menuOnly: compactTable }),
    [handleEdit, handleView, compactTable],
  );
  const tableColumns = compactTable ? compactColumns : fullColumns;

  const tableExpandable = useMemo(
    () =>
      compactTable
        ? {
            expandedRowRender: (record) => <MatriculaTableRowDetails record={record} />,
            rowExpandable: () => true,
            expandRowByClick: false,
            columnWidth: 44,
          }
        : undefined,
    [compactTable],
  );


  return (
    <div className="matricula-v2-root">
      <div className="matricula-v2-page-header">
      <Breadcrumb
        className="matricula-v2-breadcrumb"
        items={breadcrumbItems.map((item, i) => ({
          title:
            item.href && i === 0 ? (
              <span>
                <HomeOutlined style={{ marginRight: 4 }} />
                <a href={item.href}>{item.title}</a>
              </span>
            ) : item.href ? (
              <a href={item.href}>{item.title}</a>
            ) : (
              item.title
            ),
        }))}
      />
      <div className="matricula-v2-page-header-row">
        <div className="matricula-v2-page-header-main">
          <h1 className="matricula-v2-page-title">Lista de Inscripciones</h1>
          <p className="matricula-v2-page-subtitle">
            {gestionLabel} · Administra las matrículas de estudiantes activos del instituto.
          </p>
        </div>
        <Space wrap className="matricula-v2-page-header-actions">
          {puedeExportarLista ? (
            <>
              <Select
                {...mv2SelectPopupProps}
                placeholder="Carrera para exportar"
                style={{ width: 220 }}
                loading={carrerasLoading}
                value={selectedCarreraId}
                onChange={setSelectedCarreraId}
                allowClear
                showSearch
                optionFilterProp="label"
                options={carreraSelectOptions.map((c) => ({
                  value: c.value,
                  label: c.nombre,
                }))}
              />
              <Button
                icon={<DownloadOutlined />}
                loading={exportLoading}
                disabled={!selectedCarreraId}
                onClick={handleExportLista}
                style={
                  selectedCarreraId
                    ? { backgroundColor: carreraColor, borderColor: carreraColor, color: '#fff' }
                    : undefined
                }
              >
                Exportar
              </Button>
            </>
          ) : null}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNuevaInscripcion}
            style={{ background: 'var(--brand-700)', borderColor: 'var(--brand-700)' }}
          >
            Nueva Inscripción
          </Button>
        </Space>
      </div>
      </div>

      <div className="matricula-v2-kpis">
        <KpiCard
          label="Total inscritos"
          value={totalCount}
          delta={12}
          icon={<TeamOutlined />}
          accent="#0a6532"
          sub={gestionLabel}
        />
        <KpiCard
          label="Estudiantes antiguos"
          value={antiguosCount}
          delta={8}
          icon={<RiseOutlined />}
          accent="#b8860b"
          sub={totalCount ? `${Math.round((antiguosCount / totalCount) * 100)}% del total` : '—'}
        />
        <KpiCard
          label="Nuevos ingresos"
          value={nuevosCount}
          delta={24}
          icon={<UserAddOutlined />}
          accent="#2f7fb8"
          sub="Primer semestre"
        />
        <KpiCard
          label="Historiales pendientes"
          value={pendientesCount}
          delta={-5}
          icon={<ClockCircleFilled />}
          accent="#b8312a"
          sub="Requieren revisión"
        />
      </div>

      <div className="matricula-v2-career-chips">
        <div
          role="button"
          tabIndex={0}
          className="matricula-v2-chip-todas"
          onClick={() => setCareerFilter(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setCareerFilter(null);
          }}
          style={{
            background: !careerFilter ? 'var(--brand-700)' : 'var(--surface)',
            color: !careerFilter ? 'white' : 'var(--text-2)',
            borderColor: !careerFilter ? 'var(--brand-700)' : 'var(--border)',
          }}
        >
          Todas{' '}
          <span
            style={{
              background: !careerFilter ? 'rgba(255,255,255,0.25)' : 'var(--surface-alt)',
              color: !careerFilter ? 'white' : 'var(--text-muted)',
              padding: '1px 8px',
              borderRadius: 8,
              fontSize: 11,
              marginLeft: 6,
            }}
          >
            {totalCount}
          </span>
        </div>
        {careersForChips.map((c) => (
          <CareerChip
            key={c.id}
            career={c}
            count={careerCounts[c.id] || 0}
            active={careerFilter === c.id}
            onClick={() => setCareerFilter(careerFilter === c.id ? null : c.id)}
          />
        ))}
      </div>

      {error ? (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      <div className="matricula-v2-toolbar-wrap">
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
          onBulkNotify={handleBulkNotify}
          onBulkExport={handleBulkExport}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      <div
        className={`matricula-v2-table-wrap${compactTable ? ' matricula-v2-table-wrap--compact' : ''}`}
      >
        <Spin spinning={loading} tip="Cargando inscripciones...">
          <div>
            {viewMode === 'table' ? (
              <div
                className={`matricula-v2-table-scroll${compactTable ? '' : ' matricula-v2-table-scroll--wide'}`}
              >
                <Table
                  rowKey="id"
                  columns={tableColumns}
                  dataSource={paged}
                  pagination={false}
                  size="middle"
                  tableLayout={compactTable ? 'auto' : 'fixed'}
                  expandable={tableExpandable}
                  scroll={compactTable ? undefined : { x: 900 }}
                  rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                  }}
                  onRow={(r) => ({
                    onClick: (e) => {
                      if (
                        e.target.closest(
                          'button, .ant-checkbox-wrapper, .ant-dropdown, .ant-table-row-expand-icon',
                        )
                      ) {
                        return;
                      }
                      handleView(r);
                    },
                    style: { cursor: 'pointer' },
                  })}
                />
              </div>
            ) : (
              <div className="matricula-v2-grid">
                {paged.map((s) => (
                  <StudentCard
                    key={s.id}
                    student={s}
                    onOpen={() => handleView(s)}
                    onEdit={() => handleEdit(s)}
                  />
                ))}
              </div>
            )}
          </div>
        </Spin>

        <div className="matricula-v2-footer">
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Mostrando {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filtered.length)} de {filtered.length}
          </div>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(p, s) => {
              setPage(p);
              if (s) setPageSize(s);
            }}
            onShowSizeChange={(_, s) => {
              setPage(1);
              setPageSize(s);
            }}
            showSizeChanger={{ ...mv2SelectPopupProps }}
            pageSizeOptions={['10', '20', '50', '100']}
            locale={{ items_per_page: '/ página' }}
          />
        </div>
      </div>

    </div>
  );
};

export default MatriculaListV2;
