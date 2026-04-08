/**
 * PagosList - Página para listar pagos
 *
 * Single Responsibility: Orquestar la configuración específica de pagos
 *
 * Atomic Design: Page
 */

import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR_KEY_MAT_APORTES } from '@navigation-services/routeMapper';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { Grid, Select, Space, Tag } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { ActionButton, Button } from '@atoms';
import { usePagosListContext, useExportListaAportesPorCarreraExcel } from '@application-pagos/hooks';
import { useCarrerasApi } from '@application-configuracion/academico/carreras/hooks/useCarrerasApi';
import { useMessage } from '@application/utils';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { createPagosTableColumns } from '@pagos/config';

const PagosList = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const screens = Grid.useBreakpoint();
  const isSmall = !screens.lg;
  const showMessage = useMessage();

  const puedeExportarFinanzas = usePermiso('finanzas.pago.ver', 'EXPORTAR');
  const puedeExportarMatricula = usePermiso('matricula.pago.aporte.ver', 'EXPORTAR');
  const puedeExportarLista = puedeExportarFinanzas || puedeExportarMatricula;

  const [selectedCarreraId, setSelectedCarreraId] = useState(null);
  const { carreras = [], loading: carrerasLoading } = useCarrerasApi();
  const { exportar, loading: exportLoading } = useExportListaAportesPorCarreraExcel();
  const selectedCarrera = useMemo(() => {
    if (!selectedCarreraId) return null;
    return (carreras || []).find((c) => c.id === selectedCarreraId) || null;
  }, [carreras, selectedCarreraId]);
  const carreraColor = selectedCarrera?.colorHex || '#1677ff';

  const aportesMatriculaContext =
    pathname === '/matricula/aportes/listar' || pathname.startsWith('/matricula/aportes/');
  const aportesNavState = useMemo(() => {
    if (!aportesMatriculaContext) return undefined;
    return { menuSidebarKey: MENU_SIDEBAR_KEY_MAT_APORTES };
  }, [aportesMatriculaContext]);

  const {
    pagos = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    deletePago,
  } = usePagosListContext();

  const handleNuevoPago = () => {
    navigate(
      '/pagos/registrar',
      aportesNavState != null ? { state: aportesNavState } : undefined
    );
  };

  const handleExportLista = async () => {
    if (!selectedCarreraId) {
      showMessage('warning', 'Seleccione una carrera para exportar');
      return;
    }
    const result = await exportar({ carreraId: selectedCarreraId });
    if (!result.success) {
      showMessage('error', result.error || 'No se pudo exportar');
    } else {
      showMessage('success', 'Archivo generado');
    }
  };

  const tableColumns = useMemo(
    () =>
      createPagosTableColumns(navigate, refetch, deletePago, {
        viewNavigateState: aportesNavState,
      }),
    [navigate, refetch, deletePago, aportesNavState]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Pagos' },
    ],
    []
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Lista de Pagos"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Space wrap>
              {puedeExportarLista ? (
                <>
                  <Select
                    style={{ minWidth: isSmall ? 220 : 320 }}
                    className="pagos-carrera-select"
                    placeholder="Carrera para exportar estado de aporte"
                    loading={carrerasLoading}
                    value={selectedCarreraId}
                    onChange={(value) => setSelectedCarreraId(value)}
                    allowClear
                    status={selectedCarreraId ? 'success' : undefined}
                    optionFilterProp="label"
                    showSearch
                    options={(carreras || []).map((c) => {
                      const color = c.colorHex || '#1677ff';
                      return {
                        value: c.id,
                        label: (
                          <Space size={10}>
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 999,
                                backgroundColor: color,
                                display: 'inline-block',
                              }}
                            />
                            <span style={{ fontWeight: 600 }}>{c.nombre}</span>
                            {c.codigo ? (
                              <Tag color={color} style={{ marginInlineStart: 0 }}>
                                {c.codigo}
                              </Tag>
                            ) : null}
                          </Space>
                        ),
                      };
                    })}
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
                      ? `Excel aportes${selectedCarrera?.codigo ? ` (${selectedCarrera.codigo})` : ''}`
                      : 'Seleccione carrera'}
                  </Button>
                </>
              ) : null}
              <ActionButton
                permiso="finanzas.pago.registrar"
                accion="CREAR"
                variant="primary"
                icon={<PlusOutlined />}
                onClick={handleNuevoPago}
              >
                Nuevo Pago
              </ActionButton>
            </Space>
          }
        />
      }
      sidebar={null}
    >
      {puedeExportarLista ? (
        <style>{`
          .pagos-carrera-select:not(.ant-select-focused):not(.ant-select-status-success):not(.ant-select-status-error) .ant-select-selector {
            border-color: #d9d9d9 !important;
          }
        `}</style>
      ) : null}
      <TableListView
        data={pagos}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por estudiante, número de recibo, código de comprobante..."
        columns={tableColumns}
        rowKey={(record) => record.id || record.numeroRecibo || Math.random()}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} pagos`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        defaultSort={{
          field: 'fechaPago',
          order: 'descend',
        }}
        loadingTip="Cargando pagos..."
      />
    </PageTemplate>
  );
};

export default PagosList;
