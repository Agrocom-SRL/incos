/**
 * Organismo: drawer de detalle de riesgo por estudiante (módulo TUT · A3,
 * dataKey `alertaEstudiante`). Se abre desde la fila de la lista institucional
 * de alertas; el estado (open/cargar/limpiar) lo gobierna
 * `useAlertasRiesgoListPage` — este componente solo pinta.
 *
 * Cabecera con identidad del estudiante + pill de resumen, y tabla compacta
 * con TODAS sus materias de la gestión (no solo las de riesgo) para que quien
 * acompaña vea el cuadro completo. Estados de carga/error/vacío cubiertos.
 */

import { useMemo } from 'react';
import { Alert, Drawer, Empty, Flex, Spin, Table, Typography } from 'antd';
import { IdcardOutlined, ReadOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { RIESGO_PILL_CLASS, SIN_RIESGO_PILL_CLASS } from '@application-academico/acompanamiento/utils/acompanamientoPills';
import { createAlertaEstudianteMateriasColumns } from '@academico/acompanamiento/alertas/config/alertaEstudianteMateriasColumns';
import { allSpacing } from '@theme/tokens';

const { Text, Title } = Typography;

const AlertaEstudianteDrawer = ({ open, onCerrar, detalle, loading, error }) => {
  const columns = useMemo(() => createAlertaEstudianteMateriasColumns(), []);

  const materiasEnRiesgo = detalle?.materiasEnRiesgo ?? 0;

  return (
    <Drawer
      title="Detalle de riesgo del estudiante"
      open={open}
      onClose={onCerrar}
      size={640}
      destroyOnHidden
    >
      <Spin spinning={loading} tip="Cargando detalle…">
        <Flex vertical gap={allSpacing.marginLG}>
          {!loading && error ? (
            <Alert
              type="error"
              showIcon
              title="No se pudo cargar el detalle"
              description={error}
            />
          ) : null}

          {!loading && !error && !detalle ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No se encontró información de riesgo para el estudiante."
            />
          ) : null}

          {detalle ? (
            <>
              <Flex vertical gap={allSpacing.marginXS}>
                <Title level={5} style={{ margin: 0 }}>
                  {(detalle.estudianteNombre || 'Sin nombre').toUpperCase()}
                </Title>
                <Flex gap={allSpacing.marginSM} align="center" wrap>
                  {detalle.ci ? (
                    <Text type="secondary">
                      <IdcardOutlined /> C.I. {detalle.ci}
                    </Text>
                  ) : null}
                  {detalle.carreraNombre ? (
                    <Text type="secondary">
                      <ReadOutlined /> {detalle.carreraNombre}
                    </Text>
                  ) : null}
                  {materiasEnRiesgo > 0 ? (
                    <StatusPill
                      label={`${materiasEnRiesgo} materia${materiasEnRiesgo === 1 ? '' : 's'} en riesgo`}
                      className={RIESGO_PILL_CLASS}
                    />
                  ) : (
                    <StatusPill label="Sin materias en riesgo" className={SIN_RIESGO_PILL_CLASS} />
                  )}
                </Flex>
              </Flex>

              <Table
                size="small"
                columns={columns}
                dataSource={detalle.materias}
                rowKey={(record) => record.matriculaMateriaId ?? `${record.materiaId}`}
                pagination={false}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="El estudiante no tiene notas registradas en la gestión."
                    />
                  ),
                }}
              />

              <Text type="secondary">
                Se considera en riesgo la materia con nota menor al umbral en el último bimestre
                registrado o en el promedio de la gestión.
              </Text>
            </>
          ) : null}
        </Flex>
      </Spin>
    </Drawer>
  );
};

export default AlertaEstudianteDrawer;
