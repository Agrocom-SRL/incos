/**
 * Columnas del boletín del estudiante (portal del estudiante · Mi boletín).
 *
 * SOLO LECTURA: una fila por asignatura con notas por bimestre, promedio anual,
 * nota final y estado. Los nulos se muestran como "—".
 */

import { Tag } from 'antd';

/** Muestra una nota numérica o "—" cuando no hay valor. */
const nota = (value) => (value == null || value === '' ? '—' : value);

/** Color del Tag de estado de la asignatura, derivado del token de estado. */
const estadoTagColor = (estado) => {
  const value = String(estado || '').toUpperCase();
  if (value.includes('REPROB') || value.includes('REPROBAD')) return 'error';
  if (value.includes('APROB')) return 'success';
  if (value.includes('CURS') || value.includes('PEND')) return 'processing';
  return 'default';
};

export const miBoletinColumns = [
  {
    title: 'Sigla',
    key: 'asignaturaSigla',
    width: 90,
    fixed: 'left',
    render: (_, record) => record.asignaturaSigla || '—',
  },
  {
    title: 'Asignatura',
    key: 'asignaturaNombre',
    width: 220,
    fixed: 'left',
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
    title: 'Bim 1',
    key: 'bim1',
    width: 76,
    align: 'center',
    render: (_, record) => nota(record.bim1),
  },
  {
    title: 'Bim 2',
    key: 'bim2',
    width: 76,
    align: 'center',
    render: (_, record) => nota(record.bim2),
  },
  {
    title: 'Bim 3',
    key: 'bim3',
    width: 76,
    align: 'center',
    render: (_, record) => nota(record.bim3),
  },
  {
    title: 'Bim 4',
    key: 'bim4',
    width: 76,
    align: 'center',
    render: (_, record) => nota(record.bim4),
  },
  {
    title: 'Promedio anual',
    key: 'promedioAnual',
    width: 120,
    align: 'center',
    render: (_, record) => nota(record.promedioAnual),
  },
  {
    title: 'Nota final',
    key: 'notaFinal',
    width: 100,
    align: 'center',
    render: (_, record) => <strong>{nota(record.notaFinal)}</strong>,
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 130,
    render: (_, record) =>
      record.estado ? (
        <Tag color={estadoTagColor(record.estado)} style={{ margin: 0 }}>
          {record.estado}
        </Tag>
      ) : (
        '—'
      ),
  },
];

export default miBoletinColumns;
