/**
 * InscripcionesList — Listado de matrículas (solo UI).
 * Orquestación: useMatriculaListPage + InscripcionesListProvider.
 */

import { ClearOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Button as AntButton, Col, Row, Select, Space, Tag, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useMatriculaListPage } from '@application-inscripciones/hooks';

const InscripcionesList = () => {
  const {
    isSmall,
    puedeExportarLista,
    selectedCarreraId,
    setSelectedCarreraId,
    carrerasLoading,
    exportLoading,
    selectedCarrera,
    carreraColor,
    carreraSelectOptions,
    inscripciones,
    loading,
    error,
    searchText,
    setSearchText,
    handleNuevaInscripcion,
    handleExportLista,
    tableColumns,
    breadcrumbItems,
    listFilters,
    setListFilter,
    clearListFilters,
    hasActiveListFilters,
    listFilterOptions,
    paralelosForCarrera,
    tipoInscripcionOptions,
    historialEstadoOptions,
    totalBeforeFilters,
  } = useMatriculaListPage();

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Lista de Inscripciones"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Space wrap>
              {puedeExportarLista ? (
                <>
                  <Select
                    style={{ minWidth: isSmall ? 220 : 320 }}
                    className="inscripciones-carrera-select"
                    placeholder="Seleccione carrera para exportar"
                    loading={carrerasLoading}
                    value={selectedCarreraId}
                    onChange={(value) => setSelectedCarreraId(value)}
                    allowClear
                    status={selectedCarreraId ? 'success' : undefined}
                    optionFilterProp="label"
                    showSearch
                    options={carreraSelectOptions.map((c) => ({
                      value: c.value,
                      label: (
                        <Space size={10}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 999,
                              backgroundColor: c.color,
                              display: 'inline-block',
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{c.nombre}</span>
                          {c.codigo ? (
                            <Tag color={c.color} style={{ marginInlineStart: 0 }}>
                              {c.codigo}
                            </Tag>
                          ) : null}
                        </Space>
                      ),
                    }))}
                  />
                  <Button
                    variant={selectedCarreraId ? 'primary' : 'default'}
                    loading={exportLoading}
                    onClick={handleExportLista}
                    disabled={!selectedCarreraId}
                    icon={<DownloadOutlined />}
                    style={
                      selectedCarreraId
                        ? { backgroundColor: carreraColor, borderColor: carreraColor }
                        : undefined
                    }
                  >
                    {selectedCarreraId
                      ? `Descargar Excel${selectedCarrera?.codigo ? ` (${selectedCarrera.codigo})` : ''}`
                      : 'Seleccione carrera'}
                  </Button>
                </>
              ) : null}
              <Button variant="primary" icon={<PlusOutlined />} onClick={handleNuevaInscripcion}>
                Nueva Inscripción
              </Button>
            </Space>
          }
        />
      }
      sidebar={null}
    >
      {puedeExportarLista ? (
        <style>{`
          .inscripciones-carrera-select:not(.ant-select-focused):not(.ant-select-status-success):not(.ant-select-status-error) .ant-select-selector {
            border-color: #d9d9d9 !important;
          }
        `}</style>
      ) : null}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
            Carrera
          </Typography.Text>
          <Select
            allowClear
            placeholder="Todas"
            style={{ width: '100%' }}
            value={listFilters.carreraId}
            onChange={(v) => setListFilter('carreraId', v)}
            options={listFilterOptions.carreras.map((c) => ({
              value: c.id,
              label: c.codigo ? `${c.nombre} (${c.codigo})` : c.nombre,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
            Paralelo
          </Typography.Text>
          <Select
            allowClear
            placeholder="Todos"
            style={{ width: '100%' }}
            value={listFilters.paraleloId}
            onChange={(v) => setListFilter('paraleloId', v)}
            options={paralelosForCarrera.map((p) => ({ value: p.id, label: p.nombre }))}
            showSearch
            optionFilterProp="label"
            disabled={paralelosForCarrera.length === 0}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
            Periodo
          </Typography.Text>
          <Select
            allowClear
            placeholder="Todos"
            style={{ width: '100%' }}
            value={listFilters.periodoId}
            onChange={(v) => setListFilter('periodoId', v)}
            options={listFilterOptions.periodos.map((p) => ({ value: p.id, label: p.nombre }))}
            showSearch
            optionFilterProp="label"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
            Tipo
          </Typography.Text>
          <Select
            allowClear
            placeholder="Todos"
            style={{ width: '100%' }}
            value={listFilters.tipoInscripcion}
            onChange={(v) => setListFilter('tipoInscripcion', v)}
            options={tipoInscripcionOptions.map((t) => ({ value: t, label: t }))}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
            Historial previo
          </Typography.Text>
          <Select
            allowClear
            placeholder="Todos"
            style={{ width: '100%' }}
            value={listFilters.historialPrevioEstado}
            onChange={(v) => setListFilter('historialPrevioEstado', v)}
            options={historialEstadoOptions}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={1} style={{ display: 'flex', alignItems: 'flex-end' }}>
          {hasActiveListFilters ? (
            <AntButton
              type="text"
              icon={<ClearOutlined />}
              onClick={clearListFilters}
              title="Limpiar filtros"
            />
          ) : null}
        </Col>
      </Row>
      {hasActiveListFilters ? (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
          Mostrando {inscripciones.length} de {totalBeforeFilters} matrícula(s) con filtros aplicados
        </Typography.Text>
      ) : null}
      <TableListView
        data={inscripciones}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por estudiante, código, carrera..."
        columns={tableColumns}
        rowKey={(record) => record.id || record.enrollment?.id || Math.random()}
        tableClassName="data-table--inscripciones"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} inscripciones`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        defaultSort={{
          field: 'fechaInscripcion',
          order: 'descend',
        }}
        loadingTip="Cargando inscripciones..."
      />
    </PageTemplate>
  );
};

export default InscripcionesList;
