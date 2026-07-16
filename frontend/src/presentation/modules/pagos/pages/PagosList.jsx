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
import { Flex, Grid, Select, Space, Tag, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, Button } from '@atoms';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';
import { usePagosListContext, useExportListaAportesPorCarreraExcel } from '@application-pagos/hooks';
import { useCarrerasCatalogApi } from '@application-shared/hooks';
import { useMessage } from '@application/utils';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { createPagosTableColumns } from '@pagos/config';

const { Paragraph } = Typography;

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
  const { carreras = [], loading: carrerasLoading } = useCarrerasCatalogApi();
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
    tablePagination,
  } = usePagosListContext();

  const handleNuevoPago = () => {
    navigate('/pagos/registrar/seleccionar-estudiante', {
      state: {
        ...(aportesNavState || {}),
        returnListPath: pathname,
      },
    });
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
        returnListPath: pathname,
      }),
    [navigate, refetch, deletePago, aportesNavState, pathname]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Pagos' },
    ],
    []
  );

  // Exportar → nivel PageHeader (toolbar de la página); crear → dentro del workspace.
  const exportActions = puedeExportarLista ? (
    <Space wrap>
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
    </Space>
  ) : null;

  const crearAction = (
    <ActionButton
      permiso="finanzas.pago.registrar"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleNuevoPago}
    >
      Nuevo pago
    </ActionButton>
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Lista de pagos"
          breadcrumbItems={breadcrumbItems}
          actions={exportActions}
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
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Lista de pagos" actions={crearAction} />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Aportes académicos y su estado de pago: estudiante, número de recibo, monto y
              comprobante. Registre nuevos pagos y exporte el estado de aporte por carrera.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={pagos}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={(e) => setSearchText(e.target.value)}
              searchPlaceholder="Buscar por estudiante, número de recibo, código de comprobante..."
              columns={tableColumns}
              rowKey={(record) => record.id || record.numeroRecibo || Math.random()}
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              pagination={tablePagination}
              defaultSort={{
                field: 'fechaPago',
                order: 'descend',
              }}
              loadingTip="Cargando pagos..."
            />
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default PagosList;
