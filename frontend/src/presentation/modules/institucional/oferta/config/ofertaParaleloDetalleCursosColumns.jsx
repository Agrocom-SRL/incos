import { TeamOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { ActionButton, StatusPill } from '@atoms';
import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';
import {
  ofertaCursoDocentePillClass,
  ofertaCursoEstadoPillClass,
} from '../utils/ofertaParaleloUi';

const { Text } = Typography;

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
      render: (nombre, row) => {
        const label = nombre ?? `Asignatura #${row.asignaturaPlanId ?? '—'}`;
        const swatch =
          row.docenteId != null ? sanitizeDocenteColorHex(row.colorHex) : null;
        return (
          <Flex align="center" gap={8} style={{ minWidth: 0 }}>
            {swatch ? (
              <span
                className="cfg-carrera-titulo-dot__swatch"
                style={{ backgroundColor: swatch }}
                aria-hidden
              />
            ) : null}
            <Text ellipsis={{ tooltip: label }}>{label}</Text>
          </Flex>
        );
      },
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
      width: 200,
      ellipsis: true,
      render: (_, row) => {
        const pendiente = faltantesDocenteIds.has(Number(row.id));
        if (pendiente) {
          return (
            <StatusPill
              label="Sin docente"
              className={ofertaCursoDocentePillClass(true)}
            />
          );
        }
        return (
          <Text ellipsis={{ tooltip: row.docenteNombre }}>
            {row.docenteNombre || '—'}
          </Text>
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
