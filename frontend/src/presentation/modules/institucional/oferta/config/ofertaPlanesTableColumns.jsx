import { Button, Tag } from 'antd';

export function buildOfertaPlanesTableColumns({ onSelectPlan }) {
  return [
    {
      title: 'Plan / Carrera',
      key: 'plan',
      render: (_, row) =>
        row.carreraNombre
          ? `${row.carreraNombre} — ${row.nombre ?? `Plan #${row.planEstudioId}`}`
          : row.nombre ?? `Plan #${row.planEstudioId}`,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 120,
      render: (estado) => <Tag>{estado}</Tag>,
    },
    {
      title: '',
      key: 'go',
      width: 180,
      render: (_, row) => (
        <Button type="link" onClick={() => onSelectPlan(row.id)}>
          Configurar oferta →
        </Button>
      ),
    },
  ];
}
