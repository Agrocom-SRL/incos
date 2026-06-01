import { Button, Flex, Progress, Select, Space, Typography } from 'antd';
import DocenteColorBar from '@docentes/components/atoms/DocenteColorBar';

const { Text } = Typography;

function renderCargaBadge(docenteId, cargaPorDocente) {
  if (!docenteId) return '—';
  const carga = cargaPorDocente.get(Number(docenteId));
  if (!carga) return '—';
  const { cargaSemana, maxSemana } = carga;
  const sobrecarga = cargaSemana > maxSemana;
  return (
    <span className={sobrecarga ? 'asignacion-docente-carga--sobrecarga' : undefined}>
      {cargaSemana}/{maxSemana} hrs{sobrecarga ? ' ⚠' : ' ✓'}
    </span>
  );
}

export function buildAsignacionDocenteColumns({
  docenteOptions,
  cargaPorDocente,
  savingOfertaId,
  onSelectDocente,
  onQuitarAsignacion,
  onAssignColor,
  canEditar,
  canEliminar,
  canColor,
}) {
  return [
    {
      title: 'Materia',
      dataIndex: 'materiaLabel',
      key: 'materia',
      ellipsis: true,
    },
    {
      title: 'Horas',
      dataIndex: 'horasPlan',
      key: 'horas',
      width: 80,
      render: (v) => (v != null ? `${v} h` : '—'),
    },
    {
      title: 'Docente',
      key: 'docente',
      width: 280,
      render: (_, row) => (
        <Select
          showSearch
          allowClear
          placeholder="Sin asignar"
          optionFilterProp="label"
          style={{ width: '100%' }}
          value={row.docenteId ?? undefined}
          disabled={!canEditar || savingOfertaId === row.ofertaCursoId}
          loading={savingOfertaId === row.ofertaCursoId}
          options={docenteOptions}
          onChange={(value) => {
            if (value == null) {
              if (row.asignacionId) onQuitarAsignacion(row.asignacionId);
              return;
            }
            const opt = docenteOptions.find((o) => o.value === value);
            onSelectDocente(row.ofertaCursoId, value, opt?.label);
          }}
        />
      ),
    },
    {
      title: 'Color',
      key: 'color',
      width: 72,
      render: (_, row) => (
        <Flex align="center" gap={8}>
          <DocenteColorBar hex={row.colorHex} />
          {!row.colorHex && row.docenteId && canColor ? (
            <Button type="link" size="small" onClick={() => onAssignColor(row.docenteId, row.docenteNombre)}>
              Color
            </Button>
          ) : null}
        </Flex>
      ),
    },
    {
      title: 'Carga docente',
      key: 'carga',
      width: 130,
      render: (_, row) => renderCargaBadge(row.docenteId, cargaPorDocente),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      render: (_, row) =>
        row.asignacionId && canEliminar ? (
          <Button
            type="link"
            danger
            size="small"
            disabled={savingOfertaId === row.ofertaCursoId}
            onClick={() => onQuitarAsignacion(row.asignacionId)}
          >
            Quitar
          </Button>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];
}

export function buildCargaDocentesColumns({ onVerDetalle, onAssignColor, canColor, canDetalle }) {
  return [
    {
      title: 'Docente',
      key: 'nombre',
      render: (_, row) => (
        <Space>
          <DocenteColorBar hex={row.color_hex} />
          <span>{row.nombre}</span>
        </Space>
      ),
    },
    {
      title: 'Carga semanal',
      key: 'carga',
      width: 220,
      render: (_, row) => {
        const carga = Number(row.carga_semana) || 0;
        const max = Number(row.max_semana) || 20;
        const pct = max > 0 ? Math.round((carga / max) * 100) : 0;
        const sobrecarga = carga > max;
        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <span className={sobrecarga ? 'asignacion-docente-carga--sobrecarga' : undefined}>
              {carga}/{max} hrs
            </span>
            <Progress
              percent={Math.min(100, pct)}
              size="small"
              status={sobrecarga ? 'exception' : carga >= max ? 'normal' : 'active'}
              showInfo={false}
            />
          </Space>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 200,
      render: (_, row) => (
        <Space>
          {canDetalle ? (
            <Button type="link" size="small" onClick={() => onVerDetalle(row)}>
              Ver detalles
            </Button>
          ) : null}
          {!row.color_hex && canColor ? (
            <Button type="link" size="small" onClick={() => onAssignColor(row.docente_id, row.nombre)}>
              Asignar color
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];
}
