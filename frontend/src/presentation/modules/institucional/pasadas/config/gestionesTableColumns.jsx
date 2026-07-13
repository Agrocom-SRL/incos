import IdentidadCelda from '@atoms/IdentidadCelda';
import StatusPill from '@atoms/StatusPill';
import { ActionButton } from '@atoms';
import { EditOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import GestionPlanesResumenCell from '../components/atoms/GestionPlanesResumenCell';

const { Text } = Typography;

export function buildGestionesTableColumns({
  onVerPlanes,
  onHabilitarPlan,
  onEditarGestion,
  planesResumenByGestionId = {},
  planesResumenLoading = false,
  habilitandoPlanes = false,
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
      width: 260,
      align: 'right',
      render: (_, row) => {
        const resumen = planesResumenByGestionId[row.id];
        const planesCount = resumen?.count ?? 0;
        const resumenListo = resumen != null;

        // La acción de planes depende del resumen; Editar está siempre
        // disponible (fail-closed por permiso), incluida la gestión vigente.
        let planesAction = null;
        if (resumenListo && row.vigente && planesCount === 0 && onHabilitarPlan) {
          planesAction = (
            <ActionButton
              permiso="institucional.oferta.gestion-plan"
              accion="CREAR"
              variant="primary"
              size="small"
              loading={habilitandoPlanes}
              onClick={() => onHabilitarPlan(row.id)}
            >
              Habilitar planes
            </ActionButton>
          );
        } else if (resumenListo && planesCount > 0) {
          planesAction = (
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
        }

        return (
          <Flex gap="small" justify="flex-end" wrap="wrap">
            {onEditarGestion ? (
              <ActionButton
                permiso="institucional.oferta.gestion-plan"
                accion="EDITAR"
                variant="warning"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditarGestion(row.id)}
              >
                Editar
              </ActionButton>
            ) : null}
            {planesAction}
          </Flex>
        );
      },
    },
  ];
}
