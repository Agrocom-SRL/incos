/**
 * InscripcionesList — Listado de matrículas (solo UI).
 * Orquestación: useMatriculaListPage + InscripcionesListProvider.
 */

import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Flex, Select, Space, Tag, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { Button, ActionButton } from '@atoms';
import { useMatriculaListPage } from '@application-inscripciones/hooks';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

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
    tablePagination,
  } = useMatriculaListPage();

  // Exportar → nivel PageHeader (toolbar de la página); crear → dentro del workspace.
  const exportActions = puedeExportarLista ? (
    <Space wrap>
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
    </Space>
  ) : null;

  const crearAction = (
    <ActionButton
      permiso="matricula.inscribir"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleNuevaInscripcion}
    >
      Nueva Inscripción
    </ActionButton>
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Lista de Inscripciones"
          breadcrumbItems={breadcrumbItems}
          actions={exportActions}
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
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Lista de inscripciones" actions={crearAction} />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Matrículas de los estudiantes por gestión: estudiante, carrera, tipo de inscripción
              y estado. Registra nuevas inscripciones y exporta el listado por carrera.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={inscripciones}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={(e) => setSearchText(e.target.value)}
              searchPlaceholder="Buscar por estudiante, código, carrera..."
              columns={tableColumns}
              rowKey={(record) => record.id || record.enrollment?.id || Math.random()}
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              tableClassName="data-table--inscripciones"
              pagination={tablePagination}
              defaultSort={{
                field: 'fechaInscripcion',
                order: 'descend',
              }}
              loadingTip="Cargando inscripciones..."
            />
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default InscripcionesList;
