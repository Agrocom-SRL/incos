/**
 * Columnas de tablas en la ficha de matrícula (presentación).
 */

import { Tag } from 'antd';
import {
  getSubjectStatusColor,
  getSubjectStatusLabel,
} from '@application-matricula/registro/utils/inscripcionDetailHelpers';

const historialEstadoTag = (estado) => {
  const e = String(estado ?? '').toUpperCase();
  const color = e === 'CONVALIDADO' ? 'gold' : e === 'APROBADO' ? 'success' : 'default';
  const label = e === 'CONVALIDADO' ? 'Convalidado' : e === 'APROBADO' ? 'Aprobado' : estado || '—';
  return estado ? <Tag color={color}>{label}</Tag> : '—';
};

export const createMateriasInscritasColumns = () => [
  {
    title: 'Sigla',
    dataIndex: 'materiaSigla',
    key: 'materiaSigla',
    width: 110,
    render: (v) => v || '—',
  },
  {
    title: 'Materia',
    dataIndex: 'materiaNombre',
    key: 'materiaNombre',
    render: (v) => v || '—',
  },
  {
    title: 'Estado',
    dataIndex: 'status',
    key: 'status',
    width: 130,
    render: (status) =>
      status ? <Tag color={getSubjectStatusColor(status)}>{getSubjectStatusLabel(status)}</Tag> : '—',
  },
  {
    title: 'Paralelo',
    key: 'paralelo',
    width: 120,
    render: (_, row) => row.paralelo?.nombre ?? '—',
  },
  {
    title: 'Turno',
    key: 'turno',
    width: 100,
    render: (_, row) => row.paralelo?.turno ?? '—',
  },
  {
    title: 'Docente',
    key: 'docente',
    render: (_, row) => row.docente?.nombreCompleto || 'Sin docente asignado',
  },
  {
    title: 'Horarios',
    key: 'horarios',
    width: 180,
    render: (_, row) => {
      const total = Array.isArray(row.horarios) ? row.horarios.length : 0;
      return total > 0 ? `${total} bloque(s)` : 'Sin bloques';
    },
  },
];

export const createHistorialPrevioColumns = () => [
  {
    title: 'Gestión académica',
    key: 'gestionAcademica',
    width: 150,
    render: (_, row) =>
      row.periodoNombre ??
      row.periodName ??
      row.periodo?.nombre ??
      (row.periodoNumero != null ? `Periodo ${row.periodoNumero}` : '—'),
  },
  {
    title: 'Sigla',
    dataIndex: 'materiaSigla',
    key: 'materiaSigla',
    width: 100,
    render: (v, row) => v ?? row.materia?.sigla ?? '—',
  },
  {
    title: 'Materia',
    key: 'materia',
    render: (_, row) => row.materiaNombre ?? row.materia?.nombre ?? '—',
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    key: 'estado',
    width: 130,
    render: (estado, row) => historialEstadoTag(estado ?? row.status),
  },
  {
    title: 'Nota',
    key: 'nota',
    width: 90,
    render: (_, row) => {
      const estado = String(row.estado ?? row.status ?? '').toUpperCase();
      if (estado === 'CONVALIDADO') {
        return <span style={{ color: 'var(--ant-color-text-secondary)' }}>—</span>;
      }
      const nota = row.notaFinal ?? row.finalGrade ?? row.final_grade;
      return nota != null && nota !== '' ? Number(nota) : '—';
    },
  },
];
