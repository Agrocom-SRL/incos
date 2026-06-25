/**
 * P2 del Centralizador — promedios del estudiante por bimestre.
 *
 * Filas = estudiantes del paralelo. Columnas fijas a la izquierda
 * (N° · Estudiante · CI); luego un GRUPO "Gestión {año}" con los 4 bimestres
 * como subcolumnas (nombres literales del seeder 18); y, fuera del grupo, la
 * columna Final (resultado anual).
 *
 * Cada celda es el PROMEDIO del estudiante en ese bimestre (media de las notas
 * de sus asignaturas, calculado en el hook); '—' donde el estudiante no cursa.
 * Las cabeceras de bimestre son clicables y navegan a la matriz por bimestre (P3).
 *
 * Solo lectura. Reusa la "hoja" verde del registro académico.
 */

import { Button, Table, Tooltip } from 'antd';
import CeldaEstudiante from './CeldaEstudiante.jsx';
import { BIMESTRES_CENTRALIZADOR } from '@application-academico/centralizador/hooks/useCentralizadorParalelo.js';
import { nombreBimestre } from '@application-academico/centralizador/utils/centralizadorDoc.js';

/** Celda de promedio: atenuada si no hay nota; danger si reprueba. */
const CeldaPromedio = ({ valor, notaMinima }) => {
  if (valor == null) {
    return <span className="cal-centralizador-grid__nota cal-centralizador-grid__nota--vacia">—</span>;
  }
  const reprobado = valor < notaMinima;
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

/** Cabecera clicable de un bimestre (nombre literal): abre la matriz (P3). */
const CabeceraBimestre = ({ numero, onAbrirBimestre }) => {
  const nombre = nombreBimestre(numero);
  return (
    <Tooltip title={`Ver matriz del ${nombre}`} placement="top">
      <Button
        type="text"
        size="small"
        className="cal-centralizador-bim__head-btn"
        onClick={() => onAbrirBimestre?.(numero)}
      >
        {nombre}
      </Button>
    </Tooltip>
  );
};

const CentralizadorBimestresGrid = ({
  promedios = [],
  onAbrirBimestre,
  gestionAnio = null,
  notaMinimaAprobacion = 61,
}) => {
  const dataSource = promedios.map((p, i) => ({ ...p, key: p.estudianteId ?? i, nro: i + 1 }));

  const columnasBimestre = BIMESTRES_CENTRALIZADOR.map((numero) => ({
    title: <CabeceraBimestre numero={numero} onAbrirBimestre={onAbrirBimestre} />,
    dataIndex: `bim${numero}`,
    key: `bim${numero}`,
    width: 124,
    align: 'center',
    onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-asig' }),
    render: (valor) => <CeldaPromedio valor={valor} notaMinima={notaMinimaAprobacion} />,
  }));

  const grupoGestion = {
    title: gestionAnio ? `Gestión ${gestionAnio}` : 'Gestión',
    key: 'grupo-gestion',
    align: 'center',
    onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-asig' }),
    children: columnasBimestre,
  };

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
    {
      title: 'Cédula de identidad',
      dataIndex: 'ci',
      key: 'ci',
      width: 120,
      align: 'center',
      className: 'cal-centralizador-grid__col-ci',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est cal-centralizador-grid__th-ci' }),
      render: (ci) => <span className="cal-centralizador-grid__ci">{ci ?? '—'}</span>,
    },
    grupoGestion,
    {
      title: 'Final',
      dataIndex: 'final',
      key: 'final',
      width: 110,
      align: 'center',
      fixed: 'right',
      className: 'cal-centralizador-grid__col-estado',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
      render: (valor) => <CeldaPromedio valor={valor} notaMinima={notaMinimaAprobacion} />,
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
        locale={{ emptyText: 'Sin estudiantes inscritos en el paralelo' }}
      />
      <p className="cal-centralizador-grid__leyenda" role="note">
        Cada bimestre es el puntaje acumulado del estudiante (teórico + práctico)
        sobre 100, promediado entre las asignaturas que cursa en el paralelo. El
        Final es el promedio de los bimestres con registro. Tocá un bimestre para
        ver la matriz de notas por asignatura.
      </p>
    </div>
  );
};

export default CentralizadorBimestresGrid;
