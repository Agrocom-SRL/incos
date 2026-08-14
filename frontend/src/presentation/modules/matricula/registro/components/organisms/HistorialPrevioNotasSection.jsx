/**
 * Tabla editable de historial de notas (historial_previo).
 *
 * Estados por fila (§4-C4): CONVALIDADO por defecto (sin nota) y APROBADO con
 * nota 0-100; al cambiar a Aprobado la nota se precarga con la nota mínima de
 * aprobación del contexto de matrícula.
 */

import React from 'react';
import { InputNumber, Segmented, Table, Typography } from 'antd';
import '@matricula/registro/theme/historial-notas.css';

const STATUS_LABELS = {
  APROBADO: 'Aprobado',
  CONVALIDADO: 'Convalidado',
};

const HistorialPrevioNotasSection = ({
  rows = [],
  loading = false,
  onGradeChange,
  onStatusChange,
  readOnly = false,
  invalidGradeKeys = null,
}) => {
  if (!rows.length) return null;

  const invalidSet =
    invalidGradeKeys instanceof Set
      ? invalidGradeKeys
      : Array.isArray(invalidGradeKeys)
        ? new Set(invalidGradeKeys)
        : null;

  const columns = [
    {
      title: 'Gestión académica',
      dataIndex: 'gestionAcademica',
      key: 'gestionAcademica',
      width: 150,
      render: (v, record) => v || record.periodName || '—',
    },
    {
      title: 'Sigla',
      dataIndex: 'materiaSigla',
      key: 'materiaSigla',
      width: 100,
      render: (v) => v || '—',
    },
    {
      title: 'Materia',
      dataIndex: 'materiaNombre',
      key: 'materiaNombre',
    },
    {
      title: 'Estado',
      key: 'status',
      width: 220,
      render: (_, record) =>
        readOnly ? (
          STATUS_LABELS[record.status] ?? STATUS_LABELS.CONVALIDADO
        ) : (
          <Segmented
            size="small"
            className={`historial-estado-segmented historial-estado-segmented--${
              record.status === 'APROBADO' ? 'aprobado' : 'convalidado'
            }`}
            value={record.status}
            options={[
              { label: 'Aprobado', value: 'APROBADO' },
              { label: 'Convalidado', value: 'CONVALIDADO' },
            ]}
            onChange={(val) => onStatusChange?.(record.key, val)}
          />
        ),
    },
    {
      title: 'Nota final',
      key: 'nota',
      width: 120,
      render: (_, record) => {
        if (record.status !== 'APROBADO') {
          return (
            <Typography.Text type="secondary" className="historial-nota-no-aplica">
              No aplica
            </Typography.Text>
          );
        }
        if (readOnly) {
          return record.nota ?? '—';
        }
        const hasError = invalidSet?.has(record.key);
        return (
          <InputNumber
            step={0.01}
            precision={2}
            value={record.nota ?? undefined}
            onChange={(val) => onGradeChange?.(record.key, val)}
            placeholder="Nota"
            status={hasError ? 'error' : undefined}
            className={hasError ? 'historial-nota-input--error' : undefined}
            style={{ width: '100%' }}
          />
        );
      },
    },
  ];

  return (
    <div className="step-historial-notas-table">
      <Typography.Paragraph type="secondary" className="historial-notas-descripcion">
        Las materias de periodos anteriores inician como <strong>convalidadas</strong> (sin
        nota); cambie a <strong>aprobada</strong> las que tienen nota y ajústela si corresponde.
      </Typography.Paragraph>
      <Table
        size="small"
        rowKey="key"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        scroll={{ x: 760 }}
      />
    </div>
  );
};

export default HistorialPrevioNotasSection;
