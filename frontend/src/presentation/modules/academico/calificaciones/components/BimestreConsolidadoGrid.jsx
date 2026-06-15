/**
 * Grilla bimestre cerrado (solo lectura): Nro | Estudiante | Bimestre (Práctico, Teórico, Total).
 */

import { Table, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import ComponenteNotaCell from './ComponenteNotaCell.jsx';
import CeldaEstudiante from './CeldaEstudiante.jsx';

const ANCHO_COL_NRO = 44;
const ANCHO_COL_ESTUDIANTE = 300;
const ANCHO_COL_COMP = 88;

const renderEstudiante = (nombre, row) => (
  <CeldaEstudiante nombre={nombre ?? '—'} codigo={row.codigo ?? row.codigoEstudiante} />
);

const celdaTotal = (row) => {
  const t = row.total ?? 0;
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
        render: (_, row) => (
          <ComponenteNotaCell valor={row.practico} max={cuotaPractico} soloLectura etiqueta="Práctico" />
        ),
      },
      {
        title: `Teórico (${cuotaTeorico} pts)`,
        key: 'teorico',
        width: ANCHO_COL_COMP,
        align: 'center',
        className: 'cal-bimestre-consolidado__col-comp',
        onHeaderCell: thSub,
        onCell: () => ({ className: 'cal-bimestre-consolidado__col-comp' }),
        render: (_, row) => (
          <ComponenteNotaCell valor={row.teorico} max={cuotaTeorico} soloLectura etiqueta="Teórico" />
        ),
      },
      {
        title: 'Total',
        key: 'total',
        width: ANCHO_COL_COMP + 8,
        align: 'center',
        className: 'cal-bimestre-consolidado__col-total',
        onHeaderCell: thSub,
        onCell: () => ({ className: 'cal-bimestre-consolidado__col-total' }),
        render: (_, row) => celdaTotal(row),
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
