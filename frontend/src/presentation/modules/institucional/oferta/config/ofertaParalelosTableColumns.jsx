import { Select, Space, Tag } from 'antd';
import { ActionButton } from '@atoms';
import { OfertaBadge } from '../components/atoms';

export function buildOfertaParalelosTableColumns({
  turnos,
  aulas,
  validacionPorId,
  onCambiarTurno,
  onUpdateAula,
  onGenerarOferta,
  onOpenDrawer,
  onPasarOfertado,
}) {
  return [
    {
      title: 'Paralelo',
      dataIndex: 'paraleloNombre',
      key: 'paralelo',
    },
    {
      title: 'Turno',
      key: 'turno',
      width: 140,
      render: (_, row) => (
        <Select
          size="small"
          className="oferta-paralelos-table__select"
          value={row.turno}
          options={turnos.map((t) => ({ value: t, label: t }))}
          onClick={(e) => e.stopPropagation()}
          onChange={(val) => onCambiarTurno(row.id, val)}
          disabled={row.estado !== 'BORRADOR' && row.estado !== 'OFERTADO'}
        />
      ),
    },
    {
      title: 'Aula',
      key: 'aula',
      width: 180,
      render: (_, row) => (
        <Select
          size="small"
          allowClear
          placeholder="Sin asignar"
          className="oferta-paralelos-table__select oferta-paralelos-table__select--aula"
          value={row.aulaId ?? undefined}
          options={aulas.map((a) => ({
            value: a.id,
            label: a.codigo ? `${a.codigo} — ${a.nombre}` : a.nombre,
          }))}
          onClick={(e) => e.stopPropagation()}
          onChange={(val) => onUpdateAula(row.id, val ?? null)}
        />
      ),
    },
    {
      title: 'Cupos',
      key: 'cupos',
      width: 90,
      render: (_, row) => `${row.cupoMaximo ?? '—'}`,
    },
    {
      title: 'Oferta',
      key: 'oferta',
      width: 110,
      render: (_, row) => (
        <OfertaBadge validacion={validacionPorId[row.id]} ofertaActual={row.ofertaActual} />
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 110,
      render: (estado) => <Tag>{estado}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 260,
      render: (_, row) => {
        const v = validacionPorId[row.id];
        const puedeOfertar = row.estado === 'BORRADOR' && row.aulaId && v?.valido;
        return (
          <Space size="small" wrap>
            <ActionButton
              permiso="institucional.oferta.cursos"
              accion="CREAR"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onGenerarOferta(row.id);
              }}
            >
              Generar oferta
            </ActionButton>
            <ActionButton
              permiso="institucional.oferta.paralelo-gestion"
              accion="DETALLE"
              size="small"
              type="link"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDrawer(row.id);
              }}
            >
              Detalle
            </ActionButton>
            {puedeOfertar ? (
              <ActionButton
                permiso="institucional.oferta.paralelo-gestion"
                accion="EDITAR"
                size="small"
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPasarOfertado(row.id);
                }}
              >
                → OFERTADO
              </ActionButton>
            ) : null}
          </Space>
        );
      },
    },
  ];
}
