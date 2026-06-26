/**
 * P2 del Centralizador — RESULTADO ANUAL del paralelo (matriz estudiantes ×
 * asignaturas). Es el centralizador propiamente dicho: una columna por
 * asignatura del paralelo y, en cada celda, la NOTA ANUAL PONDERADA de esa
 * materia (`notaAnual`, calculada en el backend con los pesos de bimestre de la
 * política — el mismo número que la "Nota final" del Registro académico/Consolidado).
 *
 *   N° · NÓMINA · CI · [asignaturas: nota anual] · PROMEDIO · ESTADO
 *
 * Lector puro: la nota anual divide por el 100 % del año, así un bimestre aún no
 * cargado NO infla la nota (en gestión en curso el número es bajo, igual que en
 * el Consolidado; el estado solo aparece con los 4 bimestres cargados). El
 * desglose por bimestre vive en la matriz por bimestre (P3).
 */

import { Table } from 'antd';
import CeldaEstudiante from './CeldaEstudiante.jsx';
import CabeceraAsignatura from './CabeceraAsignatura.jsx';

/**
 * Celda de nota anual. Atenuada si no hay nota; danger solo cuando la gestión
 * está completa y la nota no llega a la mínima (mid-gestión la nota anual es
 * baja por diseño, no se pinta como reprobado).
 */
const CeldaNotaAnual = ({ valor, notaMinima, definitiva }) => {
  if (valor == null) {
    return <span className="cal-centralizador-grid__nota cal-centralizador-grid__nota--vacia">—</span>;
  }
  const reprobado = definitiva && valor < notaMinima;
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

/** Pill de estado de promoción del estudiante (APROBADO / REPROBADO / EN CURSO). */
const CeldaEstado = ({ estado }) => {
  if (!estado) {
    return <span className="cal-centralizador-grid__nota cal-centralizador-grid__nota--vacia">—</span>;
  }
  const variante =
    estado === 'APROBADO' ? 'aprobado' : estado === 'REPROBADO' ? 'reprobado' : 'en-curso';
  return (
    <span className={`cal-centralizador-grid__estado cal-centralizador-grid__estado--${variante}`}>
      {estado}
    </span>
  );
};

/**
 * Resumen anual del estudiante a partir de sus notas por asignatura:
 *   - promedio: media de las notas anuales ponderadas presentes (entero).
 *   - estado: EN CURSO mientras alguna asignatura no tenga los 4 bimestres;
 *     con la gestión completa, APROBADO si todas aprueban, REPROBADO si alguna
 *     no; null si aún no hay ninguna nota.
 */
const resumenAnualEstudiante = (estudiante, asignaturas) => {
  const celdas = asignaturas
    .map((a) => estudiante.notas?.[a.ofertaCursoId])
    .filter((c) => c && c.notaAnual != null);
  if (celdas.length === 0) return { promedio: null, estado: null };
  const promedio = Math.round(
    celdas.reduce((acc, c) => acc + Number(c.notaAnual), 0) / celdas.length,
  );
  let estado;
  if (celdas.some((c) => !c.gestionCompleta)) estado = 'EN CURSO';
  else estado = celdas.every((c) => c.observacion === 'APROBADO') ? 'APROBADO' : 'REPROBADO';
  return { promedio, estado };
};

/**
 * @param {Object} props
 * @param {Array} props.asignaturas columnas (incluye docenteNombre)
 * @param {Array} props.estudiantes filas (notas por ofertaCursoId)
 * @param {number} props.notaMinimaAprobacion umbral de reprobación (desde la política)
 */
const CentralizadorAnualGrid = ({
  asignaturas = [],
  estudiantes = [],
  notaMinimaAprobacion = 61,
}) => {
  const dataSource = estudiantes.map((est, i) => {
    const { promedio, estado } = resumenAnualEstudiante(est, asignaturas);
    return { ...est, key: est.estudianteId ?? i, nro: i + 1, promedioGeneral: promedio, estadoGeneral: estado };
  });

  const columnasAsignatura = asignaturas.map((asig) => ({
    title: (
      <CabeceraAsignatura
        sigla={asig.sigla}
        nombre={asig.nombre}
        docenteNombre={asig.docenteNombre}
      />
    ),
    key: `asig-${asig.ofertaCursoId}`,
    align: 'center',
    width: 132,
    className: 'cal-centralizador-grid__col-asig',
    onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-asig' }),
    render: (_, row) => {
      const celda = row.notas?.[asig.ofertaCursoId];
      return (
        <CeldaNotaAnual
          valor={celda?.notaAnual ?? null}
          notaMinima={notaMinimaAprobacion}
          definitiva={Boolean(celda?.gestionCompleta)}
        />
      );
    },
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
      width: 360,
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
      onHeaderCell: () => ({
        className: 'cal-centralizador-grid__th-est cal-centralizador-grid__th-ci',
      }),
      render: (ci) => <span className="cal-centralizador-grid__ci">{ci ?? '—'}</span>,
    },
    ...columnasAsignatura,
    {
      title: 'Promedio anual',
      dataIndex: 'promedioGeneral',
      key: 'promedio',
      width: 110,
      align: 'center',
      className: 'cal-centralizador-grid__col-estado',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
      render: (valor, row) => (
        <CeldaNotaAnual
          valor={valor}
          notaMinima={notaMinimaAprobacion}
          definitiva={row.estadoGeneral === 'APROBADO' || row.estadoGeneral === 'REPROBADO'}
        />
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estadoGeneral',
      key: 'estado',
      width: 130,
      align: 'center',
      className: 'cal-centralizador-grid__col-estado',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
      render: (estado) => <CeldaEstado estado={estado} />,
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
      <div className="cal-centralizador-grid__leyenda" role="note" aria-label="Leyenda del centralizador">
        <span className="cal-centralizador-grid__leyenda-item">
          Cada nota es el resultado anual ponderado de la asignatura: Σ(nota de
          bimestre × peso) sobre el 100 % del año (mismo cálculo que la nota final
          del Registro académico). En gestión en curso aún no llega al total.
        </span>
        <span className="cal-centralizador-grid__leyenda-item">
          <strong>Estado</strong>: EN CURSO mientras falten bimestres; con los 4
          cargados, APROBADO si toda asignatura llega a {notaMinimaAprobacion},
          REPROBADO si alguna no llega.
        </span>
      </div>
    </div>
  );
};

export default CentralizadorAnualGrid;
