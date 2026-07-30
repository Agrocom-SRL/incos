/**
 * Pestaña «Deserción» de ACA-AVANCE — métrica institucional ANUAL de abandono.
 *
 * Panel "dumb" (recibe el estado desde la página): agregado carrera × gestión
 * (vista 173) arriba y drill de desertores (vista 172) abajo; los Selects de
 * gestión/carrera filtran AMBAS tablas y el resumen. Distinta del riesgo
 * pedagógico por notas de TUT: aquí se cuenta el abandono consumado.
 */

import { useMemo } from 'react';
import { Alert, Button, Flex, Select, Typography } from 'antd';
import { TableListView } from '@organisms';
import { Text } from '@atoms';
import { allColors, allSpacing } from '@theme/tokens';
import {
  createDesercionCarrerasColumns,
  createDesercionDesertoresColumns,
} from '../config/desercionTableColumns.jsx';

const { Title } = Typography;

const TODAS = '__TODAS__';

/** % con 1 decimal (es-BO) del resumen global filtrado. */
const formatPct = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

const DesercionTabPanel = ({
  carreras = [],
  desertores = [],
  resumen = null,
  isLoading = false,
  error = null,
  refetch,
  gestionId = null,
  setGestionId,
  gestionOptions = [],
  carreraId = null,
  setCarreraId,
  carreraOptions = [],
}) => {
  const carrerasColumns = useMemo(() => createDesercionCarrerasColumns(), []);
  const desertoresColumns = useMemo(() => createDesercionDesertoresColumns(), []);

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title="No se pudo cargar la deserción estudiantil"
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
    resumen && resumen.totalEstudiantes > 0 ? (
      <Text type="secondary">
        {resumen.estudiantesDesercion} de {resumen.totalEstudiantes} estudiantes con deserción (
        <Text
          strong
          style={
            (resumen.estudiantesDesercion ?? 0) > 0 ? { color: allColors.colorError } : undefined
          }
        >
          {formatPct(resumen.pctEstudiantesDesercion)}
        </Text>
        )
      </Text>
    ) : null;

  return (
    <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
      <Flex justify="space-between" align="center" gap={allSpacing.marginSM} wrap="wrap">
        <Flex gap={allSpacing.marginSM} align="center" wrap="wrap">
          <Flex gap={allSpacing.marginXS} align="center">
            <Text type="secondary">Gestión</Text>
            <Select
              value={gestionId ?? TODAS}
              onChange={(value) => setGestionId(value === TODAS ? null : value)}
              style={{ minWidth: 180 }}
              loading={isLoading && gestionOptions.length === 0}
              options={[
                { value: TODAS, label: 'Todas las gestiones' },
                ...gestionOptions.map(({ value, label }) => ({ value, label })),
              ]}
              aria-label="Filtrar por gestión"
            />
          </Flex>
          <Flex gap={allSpacing.marginXS} align="center">
            <Text type="secondary">Carrera</Text>
            <Select
              value={carreraId ?? TODAS}
              onChange={(value) => setCarreraId(value === TODAS ? null : value)}
              style={{ minWidth: 240 }}
              loading={isLoading && carreraOptions.length === 0}
              options={[
                { value: TODAS, label: 'Todas las carreras' },
                ...carreraOptions.map(({ value, label }) => ({ value, label })),
              ]}
              aria-label="Filtrar por carrera"
            />
          </Flex>
        </Flex>
        {resumenLabel}
      </Flex>

      <TableListView
        embedded
        showSearch={false}
        data={carreras}
        loading={isLoading}
        error={null}
        columns={carrerasColumns}
        rowKey={(record) => `${record.gestionId}-${record.carreraId}`}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} carreras × gestión`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando deserción estudiantil..."
        emptyText="No hay matrículas registradas en el universo seleccionado."
      />

      <Title level={5} style={{ margin: 0 }}>
        Detalle de desertores
      </Title>

      <TableListView
        embedded
        showSearch={false}
        data={desertores}
        loading={isLoading}
        error={null}
        columns={desertoresColumns}
        rowKey={(record) => record.matriculaMateriaId}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} matrículas con deserción`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando desertores..."
        emptyText="No se registran abandonos ni retiros en el universo seleccionado."
      />
    </Flex>
  );
};

export default DesercionTabPanel;
