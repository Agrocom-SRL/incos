import { Space, Table } from 'antd';
import { ActionButton } from '@atoms';
import { buildOfertaParalelosTableColumns } from '../../config/ofertaParalelosTableColumns';

const OfertaStepParalelosSection = ({
  loading,
  paralelosGestion,
  planSeleccionado,
  columnsCtx,
  onGenerarParalelos,
  onPasarTodosOfertado,
  onOpenDrawer,
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
        onClick: () => onOpenDrawer(row.id),
        style: { cursor: 'pointer' },
      })}
      locale={{
        emptyText: planSeleccionado
          ? 'No hay paralelos de gestión. Genere paralelos desde plantillas del catálogo.'
          : 'Seleccione un plan habilitado en el paso anterior.',
      }}
    />
    <Space wrap style={{ marginTop: 16 }}>
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
    </Space>
  </>
);

export default OfertaStepParalelosSection;
