/**
 * Columnas de las planillas de «Renovación de oferta académica»:
 * planes habilitados de la gestión origen (con checkbox vía rowSelection)
 * y resumen por plan tras el POST de renovación.
 */

import { Typography } from 'antd';
import IdentidadCelda from '@atoms/IdentidadCelda';
import StatusPill from '@atoms/StatusPill';
import { planDisplayLabel } from '@application-institucional/oferta/hooks/state/ofertaStateShared.js';

const { Text } = Typography;

/** Estado del plan habilitado (gestiones_planes.estado) → variante de pill. */
const ESTADO_PLAN_PILL = {
  VIGENTE: 'success',
  APROBADO: 'info',
  PROPUESTO: 'warning',
  CERRADO: 'default',
  CANCELADO: 'danger',
};

function estadoPlanPill(estado) {
  const key = String(estado ?? '').toUpperCase();
  const variant = ESTADO_PLAN_PILL[key] ?? 'default';
  return (
    <StatusPill
      label={key || '—'}
      className={`cfg-materia-pill cfg-materia-pill--${variant}`}
    />
  );
}

/** Planilla «Qué renovar»: planes habilitados de la gestión origen. */
export function buildRenovarPlanesColumns() {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index) => index + 1,
    },
    {
      title: 'Plan de estudio',
      key: 'plan',
      render: (_, row) => (
        <IdentidadCelda
          codigo={row.carreraCodigo}
          nombre={planDisplayLabel(row).toUpperCase()}
        />
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 140,
      align: 'center',
      render: (estado) => estadoPlanPill(estado),
    },
  ];
}

/** Planilla «Resultado»: contadores copiados por plan (paralelos/ofertas/asignaciones/bloques). */
export function buildRenovarResumenColumns() {
  const contador = (title, dataIndex) => ({
    title,
    dataIndex,
    width: 110,
    align: 'center',
    render: (value) => <Text>{Number(value ?? 0)}</Text>,
  });

  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index) => index + 1,
    },
    {
      title: 'Plan de estudio',
      key: 'plan',
      render: (_, row) => (
        <IdentidadCelda codigo={row.carreraCodigo} nombre={row.label.toUpperCase()} />
      ),
    },
    {
      title: 'Resultado',
      dataIndex: 'creado',
      width: 130,
      align: 'center',
      render: (creado) => (
        <StatusPill
          label={creado ? 'CREADO' : 'OMITIDO'}
          className={`cfg-materia-pill cfg-materia-pill--${creado ? 'success' : 'warning'}`}
        />
      ),
    },
    contador('Paralelos', 'paralelos'),
    contador('Cursos', 'ofertas'),
    contador('Asignaciones', 'asignaciones'),
    contador('Bloques', 'bloques'),
    {
      title: 'Advertencias',
      dataIndex: 'advertencias',
      width: 130,
      align: 'center',
      render: (advertencias) =>
        advertencias?.length ? (
          <StatusPill
            label={String(advertencias.length)}
            className="cfg-materia-pill cfg-materia-pill--warning"
          />
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];
}
