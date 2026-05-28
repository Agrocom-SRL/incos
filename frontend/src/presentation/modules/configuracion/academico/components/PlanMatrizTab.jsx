/**
 * Tab matriz — grilla materia × periodo con edición inline y fila TOTAL.
 */

import { useMemo } from 'react';
import { Alert, InputNumber, Select, Spin, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { MODALIDAD_ASIGNATURA_OPTIONS } from '@application-configuracion/academico/config/planEstudioConstants';

const { Text } = Typography;

const PlanMatrizTab = ({
  periodos,
  matrizRows,
  planMeta,
  validacionPorPeriodo,
  savingCellId,
  onCellChange,
  puedeEditar,
}) => {
  const horasEsperadas = Number(planMeta?.horas_semana ?? 0);

  const columns = useMemo(() => {
    const base = [
      {
        title: 'Materia',
        key: 'materia',
        fixed: 'left',
        width: 200,
        render: (_, row) => (
          <div>
            <Text strong style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {row.materia?.sigla}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.materia?.nombre}
            </Text>
          </div>
        ),
      },
    ];

    const periodCols = (periodos ?? []).map((periodo) => ({
      title: (
        <div>
          <div>{periodo.nombre ?? `Periodo ${periodo.numero}`}</div>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
            P{periodo.numero}
          </Text>
        </div>
      ),
      key: `p-${periodo.id}`,
      width: 150,
      render: (_, row) => {
        const cell = row.cells?.[periodo.id];
        if (!cell) {
          return <span className="cfg-plan-matriz-cell cfg-plan-matriz-cell--empty">—</span>;
        }
        const saving = savingCellId === cell.id;
        if (!puedeEditar) {
          return (
            <div className="cfg-plan-matriz-cell">
              <Text strong>{cell.materia?.sigla}</Text>
              <br />
              <Text type="secondary">{cell.horas_semanales}h · {cell.modalidad}</Text>
            </div>
          );
        }
        return (
          <Spin spinning={saving} size="small">
            <div className="cfg-plan-matriz-cell">
              <InputNumber
                min={1}
                max={200}
                size="small"
                value={cell.horas_semanales}
                style={{ width: '100%', marginBottom: 4 }}
                onChange={(v) => onCellChange(cell.id, 'horas_semanales', v)}
              />
              <Select
                size="small"
                value={cell.modalidad || 'REGULAR'}
                options={MODALIDAD_ASIGNATURA_OPTIONS}
                style={{ width: '100%' }}
                onChange={(v) => onCellChange(cell.id, 'modalidad', v)}
              />
            </div>
          </Spin>
        );
      },
    }));

    return [...base, ...periodCols];
  }, [onCellChange, periodos, puedeEditar, savingCellId]);

  const dataSource = matrizRows;

  if (!periodos?.length) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Sin periodos en el plan"
        description="Defina periodos en el plan antes de armar la matriz (API periodos del Sprint 1)."
      />
    );
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Matriz del plan"
        description={`Cada periodo debe sumar ${horasEsperadas || '—'} horas semanales. Los cambios se guardan automáticamente.`}
      />
      <Table
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={false}
        rowKey="key"
        columns={columns}
        dataSource={dataSource}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row className="cfg-plan-total-row">
              <Table.Summary.Cell index={0}>
                <Text strong>TOTAL por periodo</Text>
              </Table.Summary.Cell>
              {(periodos ?? []).map((periodo, idx) => {
                const v = validacionPorPeriodo.get(periodo.id);
                const ok = v?.ok;
                const asignadas = v?.horas_asignadas ?? periodo.horas_total ?? 0;
                const esperadas = v?.horas_esperadas ?? horasEsperadas;
                return (
                  <Table.Summary.Cell key={periodo.id} index={idx + 1} align="center">
                    <span className={ok ? 'cfg-plan-total-ok' : 'cfg-plan-total-error'}>
                      {ok ? <CheckCircleOutlined /> : <CloseCircleOutlined />}{' '}
                      {asignadas}/{esperadas}h
                    </span>
                    {!ok && esperadas > 0 ? (
                      <Tag color="error" style={{ marginLeft: 4 }}>
                        Revisar
                      </Tag>
                    ) : null}
                  </Table.Summary.Cell>
                );
              })}
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
      {validacionPorPeriodo.size === 0 ? (
        <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          Validación no disponible; recargue la página.
        </Text>
      ) : null}
    </>
  );
};

export default PlanMatrizTab;
