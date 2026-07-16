/**
 * Columnas del transcript de Historial académico (FORM-SIE-ITT-04).
 *
 * Una fila por (asignatura × gestión) de TODAS las gestiones. Columnas del
 * contrato (`docs/plan/HISTORIAL-ACADEMICO.md`): N°, GESTIÓN ACADÉMICA, CARGA
 * HORARIA, SEMESTRE/AÑO, CÓDIGO, ASIGNATURA, PRE REQUISITO, NOTA, PRUEBA RECUP.,
 * OBSERVACIONES.
 *
 * SOLO LECTURA. El color semántico de la nota y del estado usa clases CSS que
 * consumen tokens de estado (var(--color-success/error)); nada de hex inline.
 */

import { Tag } from 'antd';

/** Muestra un valor o "—" cuando está vacío. */
const dash = (value) => (value == null || value === '' ? '—' : value);

/**
 * Resuelve el Tag de estado (color AntD por theme) y el modificador de clase de
 * la nota: aprobado (success), reprobado (error), convalidado (processing),
 * abandono/retirado (default).
 */
const resolverEstado = (estado) => {
  const value = String(estado || '').toUpperCase();
  if (value.includes('REPROB')) return { tag: 'error', mod: 'reprobado' };
  if (value.includes('APROB')) return { tag: 'success', mod: 'aprobado' };
  if (value.includes('CONVAL')) return { tag: 'processing', mod: 'convalidado' };
  if (value.includes('ABANDON') || value.includes('RETIR')) {
    return { tag: 'default', mod: 'inactivo' };
  }
  return { tag: 'default', mod: null };
};

export const historialColumns = [
  {
    title: 'N°',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_, record, index) => record.nro ?? index + 1,
  },
  {
    title: 'Gestión',
    key: 'gestionAnio',
    width: 96,
    align: 'center',
    render: (_, record) => dash(record.gestionAnio),
  },
  {
    title: 'Carga horaria',
    key: 'cargaHoraria',
    width: 108,
    align: 'center',
    render: (_, record) => (
      <span className="historial-transcript-grid__num">{dash(record.cargaHoraria)}</span>
    ),
  },
  {
    title: 'Semestre / Año',
    key: 'periodoNombre',
    width: 128,
    align: 'center',
    render: (_, record) => dash(record.periodoNombre),
  },
  {
    title: 'Sigla',
    key: 'asignaturaSigla',
    width: 96,
    render: (_, record) => (
      <span className="historial-transcript-grid__sigla">{dash(record.asignaturaSigla)}</span>
    ),
  },
  {
    title: 'Asignatura',
    key: 'asignaturaNombre',
    width: 260,
    ellipsis: true,
    render: (_, record) => dash(record.asignaturaNombre),
  },
  {
    title: 'Pre requisito',
    key: 'prerrequisitoSigla',
    width: 120,
    align: 'center',
    render: (_, record) => dash(record.prerrequisitoSigla),
  },
  {
    title: 'Nota',
    key: 'notaFinal',
    width: 84,
    align: 'center',
    render: (_, record) => {
      const { mod } = resolverEstado(record.estado);
      const className = mod
        ? `historial-transcript-grid__nota historial-transcript-grid__nota--${mod}`
        : 'historial-transcript-grid__nota';
      return <span className={className}>{dash(record.notaFinal)}</span>;
    },
  },
  {
    title: 'Prueba recup.',
    key: 'notaRecuperacion',
    width: 108,
    align: 'center',
    render: (_, record) => (
      <span className="historial-transcript-grid__num">{dash(record.notaRecuperacion)}</span>
    ),
  },
  {
    title: 'Observaciones',
    key: 'estado',
    width: 140,
    render: (_, record) => {
      if (!record.estado) return '—';
      const { tag } = resolverEstado(record.estado);
      return (
        <Tag color={tag} style={{ margin: 0 }}>
          {record.estado}
        </Tag>
      );
    },
  },
];

export default historialColumns;
