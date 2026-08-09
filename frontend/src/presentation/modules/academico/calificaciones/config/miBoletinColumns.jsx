/**
 * Columnas del boletín del estudiante (portal del estudiante · Mi boletín).
 *
 * SOLO LECTURA: una fila por asignatura con notas por bimestre (agrupadas),
 * promedio anual, nota final destacada y estado. Replica el look del cuaderno de
 * notas (notas centradas en cifras tabulares, nota final como titular de la fila
 * y Tag de estado por aprobado/reprobado/cursando).
 *
 * El color semántico de la nota final usa los MISMOS acentos del cuaderno vía
 * clases CSS (`mi-boletin-grid__nota-final--*` → var(--color-success/error) y
 * var(--bimestre-vigente-text)); no se inyectan colores inline.
 */

import { Tag } from 'antd';

/** Muestra una nota numérica o "—" cuando no hay valor. */
const nota = (value) => (value == null || value === '' ? '—' : value);

/** Celda de nota con cifras tabulares (alineación uniforme entre columnas). */
const celdaNota = (value) => (
  <span className="mi-boletin-grid__nota">{nota(value)}</span>
);

/**
 * Resuelve el Tag de estado (color AntD por theme) + el modificador de clase de
 * la nota final: aprobado (success/verde), reprobado (error/rojo), cursando o
 * pendiente (processing / verde vigente del cuaderno).
 */
const resolverEstado = (estado) => {
  const value = String(estado || '').toUpperCase();
  if (value.includes('REPROB')) return { tag: 'error', mod: 'reprobado' };
  if (value.includes('APROB')) return { tag: 'success', mod: 'aprobado' };
  if (value.includes('ABANDON') || value.includes('RETIRAD')) {
    return { tag: 'warning', mod: 'abandono' };
  }
  if (value.includes('CURS') || value.includes('PEND')) {
    return { tag: 'processing', mod: 'cursando' };
  }
  return { tag: 'default', mod: null };
};

/** Columna de un bimestre dentro del grupo "Notas por bimestre". */
const colBimestre = (titulo, key) => ({
  title: titulo,
  key,
  width: 72,
  align: 'center',
  render: (_, record) => celdaNota(record[key]),
});

export const miBoletinColumns = [
  {
    title: 'Sigla',
    key: 'asignaturaSigla',
    width: 84,
    render: (_, record) => record.asignaturaSigla || '—',
  },
  {
    title: 'Asignatura',
    key: 'asignaturaNombre',
    width: 220,
    ellipsis: true,
    render: (_, record) => record.asignaturaNombre || '—',
  },
  {
    title: 'Docente',
    key: 'docenteNombre',
    width: 200,
    ellipsis: true,
    render: (_, record) => record.docenteNombre || '—',
  },
  {
    title: 'Notas por bimestre',
    key: 'bimestres',
    align: 'center',
    children: [
      colBimestre('Bim 1', 'bim1'),
      colBimestre('Bim 2', 'bim2'),
      colBimestre('Bim 3', 'bim3'),
      colBimestre('Bim 4', 'bim4'),
    ],
  },
  {
    title: 'Promedio anual',
    key: 'promedioAnual',
    width: 120,
    align: 'center',
    render: (_, record) => celdaNota(record.promedioAnual),
  },
  {
    title: 'Nota final',
    key: 'notaFinal',
    width: 104,
    align: 'center',
    render: (_, record) => {
      const { mod } = resolverEstado(record.estado);
      const className = mod
        ? `mi-boletin-grid__nota-final mi-boletin-grid__nota-final--${mod}`
        : 'mi-boletin-grid__nota-final';
      return <span className={className}>{nota(record.notaFinal)}</span>;
    },
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 130,
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

export default miBoletinColumns;
