/**
 * Sección del paso Periodo y materias: notas de materias ya concluidas (historial_previo).
 */

import React from 'react';
import { Alert, InputNumber, Table, Tag, Typography } from 'antd';

const statusTag = (status) => {
  if (status === 'CONVALIDADO') {
    return <Tag color="gold">Convalidado</Tag>;
  }
  return <Tag color="green">Aprobado</Tag>;
};

const HistorialPrevioNotasSection = ({
  rows = [],
  loading = false,
  tipoAdmision = null,
  onGradeChange,
  readOnly = false,
}) => {
  if (!rows.length) return null;

  const tipo = String(tipoAdmision ?? '').toUpperCase();
  const description =
    tipo === 'TRASPASO' || tipo === 'TRANSITABILIDAD'
      ? 'Ingrese la nota de cada materia ya cursada o convalidada en el instituto de origen. Se registrarán en el historial previo como CONVALIDADO.'
      : 'Ingrese la nota de cada materia de periodos anteriores al que inscribe en esta gestión. Se registrarán en el historial previo como APROBADO.';

  const columns = [
    {
      title: 'Periodo',
      dataIndex: 'periodName',
      key: 'periodName',
      width: 140,
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
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s) => statusTag(s),
    },
    {
      title: 'Nota final',
      key: 'nota',
      width: 120,
      render: (_, record) =>
        readOnly ? (
          record.nota ?? '—'
        ) : (
          <InputNumber
            min={0}
            max={100}
            step={1}
            precision={0}
            value={record.nota ?? undefined}
            onChange={(val) => onGradeChange?.(record.key, val)}
            placeholder="0–100"
            style={{ width: '100%' }}
          />
        ),
    },
  ];

  return (
    <div className="step2-historial-previo" style={{ marginBottom: 24 }}>
      <Alert
        type="warning"
        showIcon
        title="Materias concluidas (historial previo)"
        description={description}
        style={{ marginBottom: 16, borderRadius: 8 }}
      />
      <Typography.Title level={5} style={{ marginBottom: 12 }}>
        Notas de materias ya concluidas ({rows.length})
      </Typography.Title>
      <Table
        size="small"
        rowKey="key"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        scroll={{ x: 640 }}
      />
    </div>
  );
};

export default HistorialPrevioNotasSection;
