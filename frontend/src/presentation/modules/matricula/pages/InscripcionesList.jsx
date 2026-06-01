/**
 * InscripcionesList — Listado de matrículas (solo UI).
 * Orquestación: useMatriculaListPage + InscripcionesListProvider.
 */

import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Select, Space, Tag } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { Button, ActionButton } from '@atoms';
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
              <ActionButton
                permiso="matricula.inscribir"
                accion="CREAR"
                variant="primary"
                icon={<PlusOutlined />}
                onClick={handleNuevaInscripcion}
              >
                Nueva Inscripción
              </ActionButton>
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
