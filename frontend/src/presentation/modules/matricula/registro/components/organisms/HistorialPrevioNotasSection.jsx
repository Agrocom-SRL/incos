/**
 * Historial de notas del wizard (tabla historial_previo), agrupado por periodo.
 *
 * Un estudiante de nivelación arrastra materias de varios años, así que una
 * lista corrida no deja ver a qué año pertenece cada asignatura: aquí cada
 * periodo es un bloque con el mismo lenguaje de la planilla de materias
 * (cabecera-banda + tabla), con su contador de notas pendientes.
 *
 * Estados por fila (§4-C4): CONVALIDADO por defecto (sin nota) y APROBADO con
 * nota 0-100; al cambiar a Aprobado la nota se precarga con la nota mínima de
 * aprobación del contexto de matrícula.
 *
 * Estilos: theme/historial-notas.css (solo var(--…), dark-safe).
 */

import React, { useMemo } from 'react';
import { Typography } from 'antd';
import { CheckCircleFilled, ExclamationCircleOutlined, SwapOutlined } from '@ant-design/icons';
import HistorialEstadoSwitch from '../molecules/HistorialEstadoSwitch';
import HistorialNotaInput from '../molecules/HistorialNotaInput';
import '@matricula/registro/theme/historial-notas.css';

const { Text } = Typography;

const STATUS_LABELS = {
  APROBADO: 'Aprobado',
  CONVALIDADO: 'Convalidado',
};

/** Agrupa las filas por periodo conservando el orden de llegada (año ascendente). */
function agruparPorPeriodo(rows) {
  const grupos = new Map();
  for (const row of rows) {
    const key = row.periodId ?? row.periodName ?? 'sin-periodo';
    if (!grupos.has(key)) {
      grupos.set(key, {
        key,
        nombre: row.periodName || row.gestionAcademica || 'Periodo',
        numero: row.periodNumero ?? null,
        rows: [],
      });
    }
    grupos.get(key).rows.push(row);
  }
  return [...grupos.values()].map((grupo) => {
    const aprobadas = grupo.rows.filter((r) => r.status === 'APROBADO');
    return {
      ...grupo,
      totalMaterias: grupo.rows.length,
      totalAprobadas: aprobadas.length,
      totalConvalidadas: grupo.rows.length - aprobadas.length,
      notasPendientes: aprobadas.filter((r) => r.nota == null || r.nota === '').length,
    };
  });
}

function HistorialFila({ row, readOnly, invalido, onGradeChange, onStatusChange }) {
  const esAprobado = row.status === 'APROBADO';

  return (
    <tr
      className={`historial-planilla__row historial-planilla__row--${esAprobado ? 'aprobado' : 'convalidado'}${
        invalido ? ' historial-planilla__row--invalid' : ''
      }`}
    >
      <td className="historial-planilla__td-codigo">{row.materiaSigla || '—'}</td>
      <td className="historial-planilla__td-nombre" title={row.materiaNombre ?? undefined}>
        {row.materiaNombre || '—'}
      </td>
      <td className="historial-planilla__td-estado">
        {readOnly ? (
          <span
            className={`cfg-materia-pill ${
              esAprobado ? 'cfg-materia-pill--success' : 'cfg-materia-pill--warning'
            }`}
          >
            {STATUS_LABELS[row.status] ?? STATUS_LABELS.CONVALIDADO}
          </span>
        ) : (
          <HistorialEstadoSwitch
            aprobado={esAprobado}
            materia={row.materiaSigla ?? row.materiaNombre ?? null}
            onChange={(estado) => onStatusChange?.(row.key, estado)}
          />
        )}
      </td>
      <td className="historial-planilla__td-nota">
        {!esAprobado ? (
          <Text type="secondary" className="historial-nota-no-aplica">
            <SwapOutlined aria-hidden /> No aplica
          </Text>
        ) : readOnly ? (
          <Text strong>{row.nota ?? '—'}</Text>
        ) : (
          <HistorialNotaInput
            value={row.nota ?? null}
            invalido={invalido}
            materia={row.materiaSigla ?? row.materiaNombre ?? null}
            onChange={(val) => onGradeChange?.(row.key, val)}
          />
        )}
      </td>
    </tr>
  );
}

function HistorialPeriodo({ periodo, readOnly, invalidSet, onGradeChange, onStatusChange }) {
  return (
    <section className="historial-planilla__year" aria-label={periodo.nombre}>
      <header className="historial-planilla__year-head">
        <span className="historial-planilla__year-title">
          {String(periodo.nombre ?? '').toUpperCase()}
        </span>
        <span className="historial-planilla__year-resumen">
          {periodo.totalMaterias} {periodo.totalMaterias === 1 ? 'materia' : 'materias'}
        </span>
      </header>

      <div className="historial-planilla__year-meta">
        <span className="historial-planilla__meta-item historial-planilla__meta-item--aprobadas">
          <CheckCircleFilled aria-hidden /> {periodo.totalAprobadas} con nota
        </span>
        <span className="historial-planilla__meta-item">
          <SwapOutlined aria-hidden /> {periodo.totalConvalidadas} convalidadas
        </span>
        {periodo.notasPendientes > 0 ? (
          <span className="historial-planilla__meta-item historial-planilla__meta-item--pendiente">
            <ExclamationCircleOutlined aria-hidden /> {periodo.notasPendientes} sin nota
          </span>
        ) : null}
      </div>

      <div className="historial-planilla__year-body">
        <table className="historial-planilla__table">
          <colgroup>
            <col className="historial-planilla__col-codigo" />
            <col className="historial-planilla__col-nombre" />
            <col className="historial-planilla__col-estado" />
            <col className="historial-planilla__col-nota" />
          </colgroup>
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>ASIGNATURA</th>
              <th>ESTADO</th>
              <th>NOTA FINAL</th>
            </tr>
          </thead>
          <tbody>
            {periodo.rows.map((row) => (
              <HistorialFila
                key={row.key}
                row={row}
                readOnly={readOnly}
                invalido={invalidSet?.has(row.key) === true}
                onGradeChange={onGradeChange}
                onStatusChange={onStatusChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const HistorialPrevioNotasSection = ({
  rows = [],
  loading = false,
  onGradeChange,
  onStatusChange,
  readOnly = false,
  invalidGradeKeys = null,
}) => {
  const periodos = useMemo(() => agruparPorPeriodo(rows), [rows]);

  const invalidSet = useMemo(() => {
    if (invalidGradeKeys instanceof Set) return invalidGradeKeys;
    if (Array.isArray(invalidGradeKeys)) return new Set(invalidGradeKeys);
    return null;
  }, [invalidGradeKeys]);

  if (!rows.length) return null;

  return (
    <div className={`historial-planilla${loading ? ' historial-planilla--loading' : ''}`}>
      <Text type="secondary" className="historial-planilla__intro">
        Cada materia inicia como <strong>convalidada</strong> (sin nota); cambie a{' '}
        <strong>aprobada</strong> las que tienen nota y regístrela.
      </Text>

      <div className="historial-planilla__years">
        {periodos.map((periodo) => (
          <HistorialPeriodo
            key={periodo.key}
            periodo={periodo}
            readOnly={readOnly}
            invalidSet={invalidSet}
            onGradeChange={onGradeChange}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export default HistorialPrevioNotasSection;
