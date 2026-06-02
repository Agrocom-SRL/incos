import { Button, Space, Tag } from 'antd';
import { ActionButton } from '@atoms';

export function buildOfertaGestionesTableColumns({ onMarcarVigente, onVerPlanes }) {
  return [
    {
      title: 'Código',
      key: 'codigo',
      render: (_, row) => row.codigo ?? row.nombre ?? row.name ?? `Gestión ${row.id}`,
    },
    {
      title: 'Año',
      dataIndex: 'anio',
      width: 90,
    },
    {
      title: 'Vigente',
      key: 'vigente',
      width: 100,
      render: (_, row) => (
        <Tag color={row.vigente ? 'success' : 'default'}>{row.vigente ? 'Sí' : 'No'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 280,
      render: (_, row) => (
        <Space size="small" wrap>
          <ActionButton
            permiso="institucional.oferta.gestion-plan"
            accion="ACTIVAR"
            size="small"
            disabled={row.vigente}
            onClick={() => onMarcarVigente(row.id)}
          >
            Marcar vigente
          </ActionButton>
          <Button type="link" size="small" onClick={() => onVerPlanes(row.id)}>
            Ver planes →
          </Button>
        </Space>
      ),
    },
  ];
}
