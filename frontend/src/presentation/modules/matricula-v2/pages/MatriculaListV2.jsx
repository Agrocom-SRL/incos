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
  Table,
} from 'antd';
import { AnimatePresence, motion } from 'motion/react';
import CareerChip from '../components/CareerChip';
import FilterToolbar from '../components/FilterToolbar';
import KpiCard from '../components/KpiCard';
import MatriculaEmptyState from '../components/MatriculaEmptyState';
import MatriculaListSkeleton from '../components/MatriculaListSkeleton';
import MatriculaTableRowDetails from '../components/MatriculaTableRowDetails';
import StudentCardGrid from '../components/StudentCardGrid';
import { useCompactTableLayout } from '../hooks/useCompactTableLayout';
import { useMatriculaListV2 } from '../hooks/useMatriculaListV2';
import { buildMatriculaTableColumns } from '../utils/buildMatriculaTableColumns';
import { mv2SelectPopupProps } from '../theme/popupClass';

// Alias capitalizado: el linter cuenta el uso JSX por identificador, no por `motion.div`.
const MotionDiv = motion.div;

/**
 * Variantes de transición de vista (tabla ↔ tarjetas).
 * Asimétricas: enter con dirección+escala (0.26s), exit sin escala y más rápido (0.16s).
 * Reduced-motion: el bloque global en theme-vars.css neutraliza transforms/animaciones.
 */
const VIEW_VARIANTS = {
  hidden: { opacity: 0, y: 8, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.26, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] },
  },
};

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
    carreraColor,
    carreraSelectOptions,
    handleExportLista,
  } = useMatriculaListV2();

  const hasFilters = Boolean(search || careerFilter || historyFilter || tipoFilter !== 'todos');
  const handleClearFilters = () => {
    setSearch('');
    setCareerFilter(null);
    setHistoryFilter(null);
    setTipoFilter('todos');
  };

  const tableLayout = useCompactTableLayout();
  const { columns: tableColumns } = useMemo(
    () => buildMatriculaTableColumns({ handleView, handleEdit }, { layout: tableLayout }),
    [handleEdit, handleView, tableLayout],
  );

  const tableWrapClass =
    tableLayout === 'full'
      ? ''
      : ` matricula-v2-table-wrap--${tableLayout}`;

  const tableExpandable = useMemo(() => {
    if (tableLayout === 'full') return undefined;

    return {
      expandedRowRender: (record) => (
        <MatriculaTableRowDetails record={record} variant={tableLayout} />
      ),
      rowExpandable: () => true,
      expandRowByClick: false,
      columnWidth: 44,
    };
  }, [tableLayout]);


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
                  className={
                    selectedCarreraId ? 'matricula-v2-export-btn--career' : undefined
                  }
                  style={
                    selectedCarreraId
                      ? { '--career-color': carreraColor }
                      : undefined
                  }
                >
                  Exportar
                </Button>
              </>
            ) : null}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleNuevaInscripcion}>
              Nueva Inscripción
            </Button>
          </Space>
        </div>
      </div>

      <div className="matricula-v2-kpis">
        <KpiCard
          label="Total inscritos"
          value={totalCount}
          icon={<TeamOutlined />}
          accent="var(--brand-600)"
          sub={gestionLabel}
        />
        <KpiCard
          label="Estudiantes antiguos"
          value={antiguosCount}
          icon={<RiseOutlined />}
          accent="var(--accent-gold)"
          sub={totalCount ? `${Math.round((antiguosCount / totalCount) * 100)}% del total` : '—'}
        />
        <KpiCard
          label="Nuevos ingresos"
          value={nuevosCount}
          icon={<UserAddOutlined />}
          accent="var(--accent-sky)"
          sub="Primer semestre"
        />
        <KpiCard
          label="Historiales pendientes"
          value={pendientesCount}
          icon={<ClockCircleFilled />}
          accent="var(--accent-red)"
          sub="Requieren revisión"
        />
      </div>

      <div className="matricula-v2-career-chips">
        <CareerChip
          label="Todas"
          count={totalCount}
          active={!careerFilter}
          showDot={false}
          onClick={() => setCareerFilter(null)}
        />
        {careersForChips.map((c) => (
          <CareerChip
            key={c.id}
            label={c.name}
            color={c.color}
            count={careerCounts[c.id] || 0}
            active={careerFilter === c.id}
            onClick={() => setCareerFilter(careerFilter === c.id ? null : c.id)}
          />
        ))}
      </div>

      {error ? (
        <Alert
          type="error"
          showIcon
          title={<strong>No se pudo cargar la lista</strong>}
          description={error}
          className="matricula-v2-alert-error"
        />
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
        className={`matricula-v2-table-wrap${tableWrapClass}`}
      >
        {/* AnimatePresence mode="popLayout": solapa entrada y salida (sin hueco en blanco).
            Variantes asimétricas: enter más lento con y+scale, exit rápido y sin escala.
            Reduced-motion: solo crossfade (ver bloque global en theme-vars.css). */}
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <MotionDiv
              key="skeleton"
              variants={VIEW_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <MatriculaListSkeleton viewMode={viewMode} rows={pageSize > 10 ? 10 : pageSize} />
            </MotionDiv>
          ) : filtered.length === 0 ? (
            <MotionDiv
              key="empty"
              variants={VIEW_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <MatriculaEmptyState
                hasFilters={hasFilters}
                onClearFilters={handleClearFilters}
                onNew={handleNuevaInscripcion}
              />
            </MotionDiv>
          ) : (
            <MotionDiv
              key={`data-${viewMode}`}
              variants={VIEW_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {viewMode === 'table' ? (
                <div
                  className={`matricula-v2-table-scroll${tableLayout === 'full' ? ' matricula-v2-table-scroll--wide' : ''
                    }`}
                >
                  <Table
                    rowKey="id"
                    columns={tableColumns}
                    dataSource={paged}
                    pagination={false}
                    size="middle"
                    tableLayout={tableLayout === 'compact' ? 'auto' : 'fixed'}
                    expandable={tableExpandable}
                    scroll={
                      tableLayout === 'full'
                        ? { x: 880 }
                        : tableLayout === 'medium'
                          ? { x: 640 }
                          : tableLayout === 'narrow'
                            ? { x: 480 }
                            : undefined
                    }
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
                <StudentCardGrid students={paged} onOpen={handleView} onEdit={handleEdit} />
              )}
            </MotionDiv>
          )}
        </AnimatePresence>

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
