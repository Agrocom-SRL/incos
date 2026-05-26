/**
 * Grilla bimestre cerrado: Nro | Estudiante | Bimestre (Práctico, Teórico, Total).
 */

import { Table, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import ComponenteNotaCell from './ComponenteNotaCell.jsx';
import CeldaEstudiante from './CeldaEstudiante.jsx';

const ANCHO_COL_NRO = 44;
const ANCHO_COL_ESTUDIANTE = 300;
const ANCHO_COL_COMP = 88;

const renderEstudiante = (nombre, row) => (
  <CeldaEstudiante nombre={nombre ?? '—'} codigo={row.codigo ?? row.codigoEstudiante} />
);

const puntosComponente = (editVal, rowVal) => {
  const v = editVal !== undefined ? editVal : rowVal;
  if (v == null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const componenteSinDato = (editVal, rowVal) => {
  const v = editVal !== undefined ? editVal : rowVal;
  return v == null || v === '' || !Number.isFinite(Number(v)) || Number(v) <= 0;
};

const celdaTotal = (row, { vacioSiCero = false } = {}) => {
  const t = row.total ?? 0;
  if (vacioSiCero && t <= 0) {
    return <span className="cal-bimestre-consolidado__total cal-bimestre-consolidado__total--vacio">—</span>;
  }
  return (
    <span className="cal-bimestre-consolidado__total">
      <strong>{t}</strong>
    </span>
  );
};

const BimestreConsolidadoGrid = ({
  estudiantes = [],
  bimestreTitulo = 'Bimestre',
  cuotaTeorico = 30,
  cuotaPractico = 70,
  soloLectura = true,
  valoresEdit = {},
  onCambioComponente,
  evaluacionesCount = 0,
}) => {
  const thEst = () => ({ className: 'cal-notas-grid__th-est' });
  const thSub = () => ({ className: 'cal-notas-grid__th-sub cal-notas-grid__th-sub--eval' });

  const grupoBimestre = {
    title: (
      <div className="cal-bimestre-consolidado__bim-head">
        <span className="cal-bimestre-consolidado__bim-titulo">{bimestreTitulo}</span>
        <Tooltip
          title={`Resumen de ${evaluacionesCount} actividad(es). Sin nota cuenta como 0. Cuotas: práctico ${cuotaPractico}, teórico ${cuotaTeorico}.`}
        >
          <InfoCircleOutlined className="cal-bimestre-consolidado__bim-info" aria-hidden />
        </Tooltip>
        {!soloLectura ? (
          <Tag color="orange" className="cal-bimestre-consolidado__modo-tag">
            Edición administrativa
          </Tag>
        ) : null}
      </div>
    ),
    className: 'cal-notas-grid__th-bim cal-notas-grid__th-bim--activo',
    onHeaderCell: () => ({ className: 'cal-notas-grid__th-bim cal-notas-grid__th-bim--activo' }),
    children: [
      {
        title: `Práctico (${cuotaPractico} pts)`,
        key: 'practico',
        width: ANCHO_COL_COMP,
        align: 'center',
        className: 'cal-bimestre-consolidado__col-comp',
        onHeaderCell: thSub,
        onCell: () => ({ className: 'cal-bimestre-consolidado__col-comp' }),
        render: (_, row) => {
          const edit = valoresEdit[row.id];
          const valor = edit?.practico !== undefined ? edit.practico : row.practico;
          return (
            <ComponenteNotaCell
              valor={valor}
              max={cuotaPractico}
              soloLectura={soloLectura}
              etiqueta="Práctico"
              onChange={(v) => onCambioComponente?.(row.id, 'practico', v)}
            />
          );
        },
      },
      {
        title: `Teórico (${cuotaTeorico} pts)`,
        key: 'teorico',
        width: ANCHO_COL_COMP,
        align: 'center',
        className: 'cal-bimestre-consolidado__col-comp',
        onHeaderCell: thSub,
        onCell: () => ({ className: 'cal-bimestre-consolidado__col-comp' }),
        render: (_, row) => {
          const edit = valoresEdit[row.id];
          const valor = edit?.teorico !== undefined ? edit.teorico : row.teorico;
          return (
            <ComponenteNotaCell
              valor={valor}
              max={cuotaTeorico}
              soloLectura={soloLectura}
              etiqueta="Teórico"
              onChange={(v) => onCambioComponente?.(row.id, 'teorico', v)}
            />
          );
        },
      },
      {
        title: 'Total',
        key: 'total',
        width: ANCHO_COL_COMP + 8,
        align: 'center',
        className: 'cal-bimestre-consolidado__col-total',
        onHeaderCell: thSub,
        onCell: () => ({ className: 'cal-bimestre-consolidado__col-total' }),
        render: (_, row) => {
          if (!soloLectura) {
            const edit = valoresEdit[row.id];
            const sinPractico = componenteSinDato(edit?.practico, row.practico);
            const sinTeorico = componenteSinDato(edit?.teorico, row.teorico);
            if (sinPractico && sinTeorico) {
              return celdaTotal(row, { vacioSiCero: true });
            }
            const p = puntosComponente(edit?.practico, row.practico);
            const t = puntosComponente(edit?.teorico, row.teorico);
            const total =
              Math.round(p * 100) / 100 + Math.round(t * 100) / 100;
            return (
              <span className="cal-bimestre-consolidado__total">
                <strong>{Math.round(total * 100) / 100}</strong>
              </span>
            );
          }
          return celdaTotal(row);
        },
      },
    ],
  };

  const columns = [
    {
      title: 'Nro',
      dataIndex: 'nro',
      key: 'nro',
      width: ANCHO_COL_NRO,
      fixed: 'left',
      align: 'center',
      className: 'cal-notas-grid__col-nro',
      onHeaderCell: thEst,
      onCell: () => ({ className: 'cal-notas-grid__col-nro' }),
    },
    {
      title: 'Estudiante',
      dataIndex: 'nombre',
      key: 'estudiante',
      width: ANCHO_COL_ESTUDIANTE,
      fixed: 'left',
      className: 'cal-notas-grid__col-estudiante',
      onHeaderCell: thEst,
      onCell: () => ({ className: 'cal-notas-grid__col-estudiante' }),
      render: renderEstudiante,
    },
    grupoBimestre,
  ];

  const anchoMinimo = ANCHO_COL_NRO + ANCHO_COL_ESTUDIANTE + ANCHO_COL_COMP * 3;

  return (
    <div className="cal-notas-grid-wrap cal-bimestre-consolidado-wrap">
      <Table
        className="cal-notas-grid cal-notas-grid--consolidado-style cal-bimestre-consolidado-grid"
        columns={columns}
        dataSource={estudiantes.map((e) => ({ ...e, key: e.id }))}
        pagination={false}
        size="small"
        bordered
        tableLayout="fixed"
        scroll={{ x: anchoMinimo }}
        locale={{ emptyText: 'Sin estudiantes matriculados en el curso' }}
      />
    </div>
  );
};

export default BimestreConsolidadoGrid;
