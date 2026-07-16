/**
 * Organismo: tab "Horarios" de la ficha de curso (CAP).
 *
 * Tabla simple de bloques (vista 154: bloqueEtiqueta ya formateada y diaOrden
 * para ordenar). Estado vacío cubierto. Recibe props ya mapeadas; no llama hooks.
 */

import { Empty, Table } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';

const columns = [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index) => index + 1,
  },
  { title: 'Día', dataIndex: 'dia', width: 140, render: (dia) => dia || '—' },
  {
    title: 'Horario',
    key: 'horario',
    width: 160,
    render: (_, record) =>
      record.horaInicio && record.horaFin
        ? `${record.horaInicio} – ${record.horaFin}`
        : record.bloqueEtiqueta || '—',
  },
  { title: 'Bloque', dataIndex: 'bloqueEtiqueta', render: (v) => v || '—' },
  { title: 'Aula', dataIndex: 'aulaLabel', width: 200, render: (v) => v || 'Sin aula' },
];

const CursoHorariosSection = ({ horarios = [] }) => {
  // La vista 154 ya entrega dia_orden; se respeta ese orden semanal.
  const dataSource = [...horarios].sort(
    (a, b) => (a.diaOrden ?? 99) - (b.diaOrden ?? 99) || (a.horaInicio || '').localeCompare(b.horaInicio || ''),
  );

  return (
    <div className="sd-tab-body">
      <DetailInfoCard
        title={`Bloques de horario (${horarios.length})`}
        icon={<ClockCircleOutlined />}
        cols={1}
      >
        {dataSource.length > 0 ? (
          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey={(record) => record.capacitacionHorarioId ?? record.horarioId}
            size="small"
            pagination={false}
          />
        ) : (
          <Empty description="El curso aún no tiene bloques de horario asignados." />
        )}
      </DetailInfoCard>
    </div>
  );
};

export default CursoHorariosSection;
