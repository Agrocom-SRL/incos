import IdentidadCelda from '@atoms/IdentidadCelda';
import StatusPill from '@atoms/StatusPill';
import { ActionButton } from '@atoms';
import { Typography } from 'antd';
import GestionPlanesResumenCell from '../components/atoms/GestionPlanesResumenCell';

const { Text } = Typography;

export function buildGestionesTableColumns({
  onVerPlanes,
  planesResumenByGestionId = {},
  planesResumenLoading = false,
}) {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Gestión',
      key: 'gestion',
      fixed: 'left',
      ellipsis: true,
      render: (_, row) => (
        <IdentidadCelda
          codigo={row.codigo ?? `G-${row.id}`}
          nombre={(row.nombre ?? row.name ?? 'Sin nombre').toUpperCase()}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => {
        const labelA = a.codigo ?? a.nombre ?? a.name ?? '';
        const labelB = b.codigo ?? b.nombre ?? b.name ?? '';
        return labelA.localeCompare(labelB, 'es', { sensitivity: 'base' });
      },
    },
    {
      title: 'Año',
      dataIndex: 'anio',
      align: 'center',
      sorter: true,
      sortCompare: (a, b) => (a.anio ?? 0) - (b.anio ?? 0),
      defaultSortOrder: 'descend',
      render: (anio, row) => {
        const label = anio != null ? String(anio) : '—';
        if (row.vigente) {
          return (
            <StatusPill label={label} className="cfg-materia-pill cfg-materia-pill--activa" />
          );
        }
        return <Text>{label}</Text>;
      },
    },
    {
      title: 'Planes habilitados',
      key: 'planes',
      width: 440,
      ellipsis: false,
      render: (_, row) => (
        <GestionPlanesResumenCell
          resumen={planesResumenByGestionId[row.id]}
          loading={planesResumenLoading}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => {
        const ca = planesResumenByGestionId[a.id]?.count ?? -1;
        const cb = planesResumenByGestionId[b.id]?.count ?? -1;
        return ca - cb;
      },
    },
    {
      title: '',
      key: 'acciones',
      width: 140,
      fixed: 'right',
      align: 'right',
      render: (_, row) => {
        const resumen = planesResumenByGestionId[row.id];
        const planesCount = resumen?.count ?? 0;
        const resumenListo = resumen != null;

        if (!resumenListo || planesCount === 0) {
          return null;
        }

        return (
          <ActionButton
            permiso="institucional.oferta.gestion-plan"
            accion="LISTAR"
            variant="primary"
            size="small"
            onClick={() => onVerPlanes(row.id)}
          >
            Ver planes
          </ActionButton>
        );
      },
    },
  ];
}
