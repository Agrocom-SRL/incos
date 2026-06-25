/**
 * P2 del Centralizador — promedios del estudiante por bimestre.
 *
 * Filas = estudiantes del paralelo; columnas = Bim1 · Bim2 · Bim3 · Bim4 · Final.
 * Cada celda es el PROMEDIO del estudiante en ese bimestre (media de las notas
 * de sus asignaturas, calculado en el hook). Las cabeceras de bimestre son
 * clicables y navegan a la matriz por bimestre (P3).
 *
 * Solo lectura. Reusa la "hoja" verde del registro académico.
 */

import { Button, Table, Tooltip } from 'antd';
import CeldaEstudiante from './CeldaEstudiante.jsx';
import { BIMESTRES_CENTRALIZADOR } from '@application-academico/centralizador/hooks/useCentralizadorParalelo.js';

const NOTA_MINIMA_APROBACION = 61;

const BIM_LABEL = { 1: '1B', 2: '2B', 3: '3B', 4: '4B' };
const BIM_TITULO = { 1: '1.er bimestre', 2: '2.º bimestre', 3: '3.er bimestre', 4: '4.º bimestre' };

/** Celda de promedio: atenuada si no hay nota; danger si reprueba. */
const CeldaPromedio = ({ valor }) => {
  if (valor == null) {
    return <span className="cal-centralizador-grid__nota cal-centralizador-grid__nota--vacia">—</span>;
  }
  const reprobado = valor < NOTA_MINIMA_APROBACION;
  return (
    <span
      className={[
        'cal-centralizador-grid__nota',
        reprobado ? 'cal-centralizador-grid__nota--reprobado' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {valor}
    </span>
  );
};

/** Cabecera clicable de un bimestre: abre la matriz por bimestre (P3). */
const CabeceraBimestre = ({ numero, onAbrirBimestre }) => (
  <Tooltip title={`Ver matriz del ${BIM_TITULO[numero]}`} placement="top">
    <Button
      type="text"
      size="small"
      className="cal-centralizador-bim__head-btn"
      onClick={() => onAbrirBimestre?.(numero)}
    >
      {BIM_LABEL[numero]}
    </Button>
  </Tooltip>
);

const CentralizadorBimestresGrid = ({ promedios = [], onAbrirBimestre }) => {
  const dataSource = promedios.map((p, i) => ({ ...p, key: p.estudianteId ?? i, nro: i + 1 }));

  const columnasBimestre = BIMESTRES_CENTRALIZADOR.map((numero) => ({
    title: <CabeceraBimestre numero={numero} onAbrirBimestre={onAbrirBimestre} />,
    dataIndex: `bim${numero}`,
    key: `bim${numero}`,
    width: 96,
    align: 'center',
    onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-asig' }),
    render: (valor) => <CeldaPromedio valor={valor} />,
  }));

  const columns = [
    {
      title: 'N°',
      dataIndex: 'nro',
      key: 'nro',
      width: 48,
      align: 'center',
      fixed: 'left',
      className: 'cal-centralizador-grid__col-nro',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
    },
    {
      title: 'Nómina de estudiantes',
      dataIndex: 'nombreCompleto',
      key: 'estudiante',
      width: 260,
      fixed: 'left',
      className: 'cal-centralizador-grid__col-estudiante',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
      onCell: () => ({ className: 'cal-centralizador-grid__col-estudiante' }),
      render: (nombreCompleto, row) => (
        <CeldaEstudiante nombre={nombreCompleto} codigo={row.codigoEstudiante} />
      ),
    },
    ...columnasBimestre,
    {
      title: 'Final',
      dataIndex: 'final',
      key: 'final',
      width: 110,
      align: 'center',
      fixed: 'right',
      className: 'cal-centralizador-grid__col-estado',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
      render: (valor) => <CeldaPromedio valor={valor} />,
    },
  ];

  return (
    <div className="cal-centralizador-grid-wrap">
      <Table
        className="cal-centralizador-grid"
        tableLayout="fixed"
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: 'Sin estudiantes matriculados en el paralelo' }}
      />
      <p className="cal-centralizador-grid__leyenda" role="note">
        Promedio del estudiante por bimestre (media de sus asignaturas). Tocá un
        bimestre (1B–4B) para ver la matriz de notas por asignatura.
      </p>
    </div>
  );
};

export default CentralizadorBimestresGrid;
