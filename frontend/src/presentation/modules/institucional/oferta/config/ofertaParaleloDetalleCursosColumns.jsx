import { TeamOutlined } from '@ant-design/icons';
import { ActionButton, StatusPill } from '@atoms';
import {
  ofertaCursoDocentePillClass,
  ofertaCursoEstadoPillClass,
} from '../utils/ofertaParaleloUi';

export function buildOfertaParaleloDetalleCursosColumns({
  faltantesDocenteIds,
  onAsignarDocente,
}) {
  return [
    {
      title: 'Materia',
      dataIndex: 'materiaNombre',
      key: 'materia',
      ellipsis: true,
      render: (nombre, row) => nombre ?? `Asignatura #${row.asignaturaPlanId ?? '—'}`,
    },
    {
      title: 'Sigla',
      dataIndex: 'materiaCodigo',
      key: 'sigla',
      width: 110,
      render: (codigo) => codigo || '—',
    },
    {
      title: 'Horas/sem',
      dataIndex: 'horasSemanales',
      key: 'horas',
      width: 96,
      align: 'right',
      render: (h) => (h != null && h !== '' ? h : '—'),
    },
    {
      title: 'Docente',
      key: 'docente',
      width: 120,
      render: (_, row) => {
        const pendiente = faltantesDocenteIds.has(Number(row.id));
        return (
          <StatusPill
            label={pendiente ? 'Pendiente' : 'Asignado'}
            className={ofertaCursoDocentePillClass(pendiente)}
          />
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (estado) => (
        <StatusPill
          label={estado ?? '—'}
          className={ofertaCursoEstadoPillClass(estado)}
        />
      ),
    },
    {
      title: '',
      key: 'acciones',
      width: 168,
      align: 'right',
      render: (_, row) => (
        <ActionButton
          permiso="docentes.asignar"
          accion="EDITAR"
          type="link"
          size="small"
          icon={<TeamOutlined />}
          className="oferta-paralelo-detalle__link-asignar"
          onClick={() => onAsignarDocente?.(row)}
        >
          Asignar docente
        </ActionButton>
      ),
    },
  ];
}
