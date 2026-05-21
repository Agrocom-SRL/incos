/**
 * Grilla de registro académico — solo lectura; acceso al cuaderno desde encabezados de bimestre.
 */

import { EditOutlined } from '@ant-design/icons';
import { Button, Table, Tag, Tooltip } from 'antd';

const celdaNota = (valor) => (
  <span className="cal-consolidado-grid__nota">{valor != null ? valor : '—'}</span>
);

const TituloBimestre = ({ titulo, numero, editable, onAbrirCuaderno }) => (
  <div className="cal-consolidado-grid__bim-head">
    <span className="cal-consolidado-grid__bim-titulo">{titulo}</span>
    {editable && onAbrirCuaderno ? (
      <Tooltip title={`Cuaderno · Bimestre ${numero}`}>
        <Button
          type="text"
          size="small"
          className="cal-consolidado-grid__bim-edit"
          icon={<EditOutlined />}
          aria-label={`Abrir cuaderno del bimestre ${numero}`}
          onClick={(e) => {
            e.stopPropagation();
            onAbrirCuaderno(numero);
          }}
        />
      </Tooltip>
    ) : null}
  </div>
);

const colBimestre = (titulo, indice, editable, onAbrirCuaderno) => ({
  title: (
    <TituloBimestre
      titulo={titulo}
      numero={indice + 1}
      editable={editable}
      onAbrirCuaderno={onAbrirCuaderno}
    />
  ),
  key: `bim-${indice}`,
  align: 'center',
  children: [
    {
      title: 'Teórico',
      key: `bim-${indice}-t`,
      width: 72,
      align: 'center',
      className: 'cal-consolidado-grid__col-num',
      render: (_, row) => celdaNota(row.bimestres?.[indice]?.teorico),
    },
    {
      title: 'Práctico',
      key: `bim-${indice}-p`,
      width: 72,
      align: 'center',
      className: 'cal-consolidado-grid__col-num',
      render: (_, row) => celdaNota(row.bimestres?.[indice]?.practico),
    },
    {
      title: 'Suma',
      key: `bim-${indice}-s`,
      width: 72,
      align: 'center',
      className: 'cal-consolidado-grid__col-suma',
      render: (_, row) => celdaNota(row.bimestres?.[indice]?.suma),
    },
  ],
});

const ConsolidadoGrid = ({
  estudiantes = [],
  bimestreTitulos = [],
  bimestresEditables = [],
  notaMinimaAprobacion = 61,
  onAbrirCuaderno,
}) => {
  const columns = [
    {
      title: 'Nro',
      dataIndex: 'nro',
      key: 'nro',
      width: 48,
      align: 'center',
      fixed: 'left',
      className: 'cal-consolidado-grid__col-nro',
    },
    {
      title: 'Datos estudiante',
      key: 'estudiante',
      fixed: 'left',
      children: [
        {
          title: 'Cédula de identidad',
          dataIndex: 'cedula',
          key: 'cedula',
          width: 120,
          className: 'cal-consolidado-grid__col-cedula',
        },
        {
          title: 'Apellidos y nombres',
          dataIndex: 'nombre',
          key: 'nombre',
          width: 220,
          ellipsis: true,
          className: 'cal-consolidado-grid__col-nombre',
        },
      ],
    },
    ...bimestreTitulos.map((titulo, i) =>
      colBimestre(titulo, i, bimestresEditables[i], onAbrirCuaderno),
    ),
    {
      title: 'Nota final',
      dataIndex: 'notaFinal',
      key: 'notaFinal',
      width: 88,
      align: 'center',
      fixed: 'right',
      className: 'cal-consolidado-grid__col-final',
      render: (v) => celdaNota(v),
    },
    {
      title: 'Recuperatorio',
      dataIndex: 'recuperatorio',
      key: 'recuperatorio',
      width: 96,
      align: 'center',
      fixed: 'right',
      render: (v) => celdaNota(v),
    },
    {
      title: 'Observación',
      dataIndex: 'observacion',
      key: 'observacion',
      width: 110,
      align: 'center',
      fixed: 'right',
      render: (obs, row) => {
        const aprobado =
          row.notaFinal != null && row.notaFinal >= notaMinimaAprobacion;
        return (
          <Tag
            color={aprobado ? 'success' : 'warning'}
            className="cal-consolidado-grid__obs"
          >
            {obs ?? '—'}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="cal-consolidado-grid-wrap">
      <Table
        className="cal-consolidado-grid"
        columns={columns}
        dataSource={estudiantes}
        rowKey="nro"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: 'Sin estudiantes matriculados en el curso' }}
      />
    </div>
  );
};

export default ConsolidadoGrid;
