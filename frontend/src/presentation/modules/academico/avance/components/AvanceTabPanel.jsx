/**
 * Pestaña «Avance» de ACA-AVANCE — listado estudiante × plan con % de avance.
 *
 * Panel "dumb": recibe TODO el estado desde la página (patrón PlanesTabPanel);
 * no hace fetch. El filtro de carrera y la búsqueda operan en cliente (ver
 * useAvanceAcademicoPage); la exportación de la página delega el mismo
 * `carreraId` al servidor.
 */

import { useMemo } from 'react';
import { Alert, Button, Flex, Select } from 'antd';
import { TableListView } from '@organisms';
import { Text } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { createAvanceTableColumns } from '../config/avanceTableColumns.jsx';

const TODAS_CARRERAS = '__TODAS__';

const AvanceTabPanel = ({
  filas = [],
  totalSinFiltrar = 0,
  resumen = null,
  isLoading = false,
  error = null,
  refetch,
  carreraId = null,
  setCarreraId,
  carreraOptions = [],
  searchText = '',
  setSearchText,
}) => {
  const tableColumns = useMemo(() => createAvanceTableColumns(), []);

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title="No se pudo cargar el avance académico"
        description={error}
        action={
          <Button size="small" onClick={refetch}>
            Reintentar
          </Button>
        }
      />
    );
  }

  const resumenLabel =
    resumen?.promedioPctAvance != null
      ? `Avance promedio general: ${Number(resumen.promedioPctAvance).toLocaleString('es-BO', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}%`
      : null;

  return (
    <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
      <Flex justify="space-between" align="center" gap={allSpacing.marginSM} wrap="wrap">
        <Flex gap={allSpacing.marginXS} align="center">
          <Text type="secondary">Carrera</Text>
          <Select
            value={carreraId ?? TODAS_CARRERAS}
            onChange={(value) => setCarreraId(value === TODAS_CARRERAS ? null : value)}
            style={{ minWidth: 240 }}
            loading={isLoading && carreraOptions.length === 0}
            options={[
              { value: TODAS_CARRERAS, label: 'Todas las carreras' },
              ...carreraOptions.map(({ value, label }) => ({ value, label })),
            ]}
            aria-label="Filtrar por carrera"
          />
        </Flex>
        {resumenLabel ? <Text type="secondary">{resumenLabel}</Text> : null}
      </Flex>

      <TableListView
        embedded
        data={filas}
        loading={isLoading}
        error={null}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por estudiante, código, carrera o plan..."
        columns={tableColumns}
        rowKey={(record) => `${record.estudianteId}-${record.planEstudioId}`}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} estudiantes`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando avance académico..."
        emptyText={
          totalSinFiltrar === 0
            ? 'Aún no hay estudiantes con historial académico registrado.'
            : 'Ningún estudiante coincide con los filtros aplicados.'
        }
      />
    </Flex>
  );
};

export default AvanceTabPanel;
