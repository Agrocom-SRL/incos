import { Flex, Table, Typography } from 'antd';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { buildOfertaParalelosTableColumns } from '../../config/ofertaParalelosTableColumns';

const { Text } = Typography;

const OfertaStepParalelosSection = ({
  loading,
  paralelosGestion,
  planSeleccionado,
  columnsCtx,
  onGenerarParalelos,
  onPasarTodosOfertado,
  onOpenDrawer,
  onNavigateDetalle,
  onRowClick,
}) => (
  <>
    <Table
      rowKey="id"
      loading={loading}
      dataSource={paralelosGestion}
      columns={buildOfertaParalelosTableColumns(columnsCtx)}
      pagination={false}
      scroll={{ x: 960 }}
      className="oferta-paralelos-table"
      onRow={(row) => ({
        onClick: () => {
          if (onRowClick) onRowClick(row.id);
          else if (onNavigateDetalle) onNavigateDetalle(row.id);
          else if (onOpenDrawer) onOpenDrawer(row.id);
        },
        style: { cursor: 'pointer' },
      })}
      locale={{
        emptyText: planSeleccionado
          ? 'No hay paralelos de gestión. Genere paralelos desde plantillas del catálogo.'
          : 'Seleccione un plan habilitado en el paso anterior.',
      }}
    />
    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: allSpacing.marginSM }}>
      Clic en una fila para ver detalle y asignar docentes
    </Text>
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      style={{ marginTop: allSpacing.marginMD, gap: allSpacing.marginSM }}
    >
      <ActionButton
        permiso="institucional.oferta.paralelo-gestion"
        accion="CREAR"
        onClick={onGenerarParalelos}
        disabled={!planSeleccionado}
      >
        Generar paralelos de gestión
      </ActionButton>
      <ActionButton
        permiso="institucional.oferta.paralelo-gestion"
        accion="EDITAR"
        onClick={onPasarTodosOfertado}
        disabled={!paralelosGestion.length}
      >
        Cambiar todos a OFERTADO
      </ActionButton>
    </Flex>
  </>
);

export default OfertaStepParalelosSection;

// ✅ Bugs corregidos: (ninguno)
// ✅ Mejoras aplicadas: pie de tabla hint; Flex en acciones inferiores con tokens de espaciado
