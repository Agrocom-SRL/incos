/**
 * Lista de matrículas v2 — UI rediseñada (aislada del listado clásico).
 */
import { useMemo } from 'react';
import {
  ClockCircleFilled,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  HomeOutlined,
  MailOutlined,
  MoreOutlined,
  PlusOutlined,
  PrinterOutlined,
  RiseOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Breadcrumb,
  Button,
  Dropdown,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import CareerChip from '../components/CareerChip';
import FilterToolbar from '../components/FilterToolbar';
import KpiCard from '../components/KpiCard';
import StatusPill from '../components/StatusPill';
import StudentCard from '../components/StudentCard';
import StudentCell from '../components/StudentCell';
import StudentDrawer from '../components/StudentDrawer';
import { useMatriculaListV2 } from '../hooks/useMatriculaListV2';
import { mv2DropdownPopupProps, mv2SelectPopupProps } from '../theme/popupClass';

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
    drawerStudent,
    setDrawerStudent,
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

  const columns = useMemo(
    () => [
      {
        title: 'Estudiante',
        key: 'student',
        width: 320,
        render: (_, r) => <StudentCell student={r} />,
      },
      {
        title: 'Carrera',
        key: 'career',
        width: 220,
        render: (_, r) => (
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              <span style={{ width: 4, height: 18, borderRadius: 2, background: r.career.color }} />
              {r.career.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 4, marginLeft: 12 }}>
              {r.semestre}° semestre · {r.materias} materias
            </div>
          </div>
        ),
      },
      {
        title: 'Tipo',
        key: 'tipo',
        width: 110,
        render: (_, r) => (
          <Tag
            style={{
              margin: 0,
              borderRadius: 999,
              padding: '1px 10px',
              background: r.isAntiguo ? 'var(--pill-warn-bg)' : 'var(--pill-ok-bg)',
              color: r.isAntiguo ? 'var(--pill-warn-fg)' : 'var(--pill-ok-fg)',
              border: 'none',
              fontWeight: 600,
              fontSize: 11,
            }}
          >
            {r.tipo}
          </Tag>
        ),
      },
      {
        title: 'Historial',
        key: 'history',
        width: 180,
        render: (_, r) => <StatusPill statusKey={r.historial} label={r.historyState?.label} />,
      },
      {
        title: 'Pago',
        key: 'pago',
        width: 110,
        render: (_, r) => (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color:
                r.estadoPago === 'Al día'
                  ? 'var(--success)'
                  : r.estadoPago === 'Pendiente'
                    ? 'var(--danger)'
                    : 'var(--info)',
            }}
          >
            {r.estadoPago}
          </span>
        ),
      },
      {
        title: 'Gestión',
        key: 'fecha',
        width: 130,
        render: (_, r) => (
          <div style={{ fontSize: 13, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            <div style={{ fontWeight: 600 }}>{r.gestion}</div>
            <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{r.fechaMatricula}</div>
          </div>
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 100,
        align: 'right',
        render: (_, r) => (
          <Space size={2} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Ver detalle">
              <Button
                type="text"
                size="small"
                className="matricula-v2-action-icon--info"
                icon={<EyeOutlined />}
                onClick={() => setDrawerStudent(r)}
              />
            </Tooltip>
            <Tooltip title="Editar">
              <Button
                type="text"
                size="small"
                className="matricula-v2-action-icon--warning"
                icon={<EditOutlined />}
                onClick={() => handleEdit(r)}
              />
            </Tooltip>
            <Dropdown
              {...mv2DropdownPopupProps}
              menu={{
                items: [
                  {
                    key: 'print',
                    icon: <PrinterOutlined style={{ color: 'var(--info)' }} />,
                    label: 'Imprimir comprobante',
                  },
                  {
                    key: 'mail',
                    icon: <MailOutlined style={{ color: 'var(--info)' }} />,
                    label: 'Enviar correo',
                  },
                  {
                    key: 'doc',
                    icon: <FileTextOutlined style={{ color: 'var(--info)' }} />,
                    label: 'Generar reporte',
                  },
                  { type: 'divider' },
                  { key: 'del', icon: <DeleteOutlined />, label: 'Eliminar', danger: true },
                ],
              }}
            >
              <Button
                type="text"
                size="small"
                className="matricula-v2-action-icon--muted"
                icon={<MoreOutlined />}
              />
            </Dropdown>
          </Space>
        ),
      },
    ],
    [handleEdit, setDrawerStudent],
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 22, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="matricula-v2-page-title">Lista de Inscripciones</h1>
          <p className="matricula-v2-page-subtitle">
            {gestionLabel} · Administra las matrículas de estudiantes activos del instituto.
          </p>
        </div>
        <Space wrap>
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

      <div className="matricula-v2-table-wrap">
        <Spin spinning={loading} tip="Cargando inscripciones...">
          <div>
            {viewMode === 'table' ? (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={paged}
                pagination={false}
                size="middle"
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }}
                onRow={(r) => ({
                  onClick: (e) => {
                    if (e.target.closest('button, .ant-checkbox-wrapper, .ant-dropdown')) return;
                    setDrawerStudent(r);
                  },
                  style: { cursor: 'pointer' },
                })}
              />
            ) : (
              <div className="matricula-v2-grid">
                {paged.map((s) => (
                  <StudentCard
                    key={s.id}
                    student={s}
                    onOpen={() => setDrawerStudent(s)}
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

      <StudentDrawer
        student={drawerStudent}
        open={!!drawerStudent}
        onClose={() => setDrawerStudent(null)}
        onEdit={() => {
          if (drawerStudent) handleEdit(drawerStudent);
        }}
      />
    </div>
  );
};

export default MatriculaListV2;
