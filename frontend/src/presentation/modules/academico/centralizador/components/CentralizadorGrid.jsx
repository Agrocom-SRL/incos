/**
 * P3 del Centralizador — matriz estudiantes × asignaturas de un BIMESTRE.
 *
 * Estructura del documento oficial "Centralizador de calificaciones" con el
 * sistema de diseño del proyecto (la "hoja" verde del registro académico):
 *
 *   N° · NÓMINA DE ESTUDIANTES · CÉDULA DE IDENTIDAD ·
 *   [una columna por asignatura, cabecera rotada: sigla + nombre + docente] ·
 *   BOLETÍN (gancho deshabilitado, "Próximamente")
 *
 * La celda muestra la nota del bimestre activo (`notas[ofertaCursoId].bim{n}`),
 * en danger si < 61 y '—' si null. Solo lectura.
 *
 * Esta vista es POR BIMESTRE: las columnas anuales ESTADO / OBSERVACIONES del
 * documento se omiten (la consolidación anual vive en otra iteración).
 */

import { Button, Table, Tooltip } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import CeldaEstudiante from './CeldaEstudiante.jsx';

const NOTA_MINIMA_APROBACION = 61;

/** Nota del bimestre activo para una asignatura. */
const notaBimestre = (nota, bimestre) => {
  if (!nota || bimestre == null) return null;
  const valor = nota[`bim${bimestre}`];
  return valor == null ? null : Number(valor);
};

/** Celda de nota de bimestre. Atenuada si no hay nota; danger si reprueba. */
const CeldaNotaBimestre = ({ valor }) => {
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

/** Cabecera de columna de asignatura: sigla en negrita + nombre rotado + docente. */
const CabeceraAsignatura = ({ sigla, nombre, docenteNombre }) => (
  <Tooltip
    title={docenteNombre ? `${nombre} — ${docenteNombre}` : nombre}
    placement="top"
  >
    <span className="cal-centralizador-grid__asig-head">
      <span className="cal-centralizador-grid__asig-sigla">{sigla ?? nombre}</span>
      <span className="cal-centralizador-grid__asig-nombre">{nombre}</span>
      {docenteNombre ? (
        <span className="cal-centralizador-grid__asig-docente">{docenteNombre}</span>
      ) : null}
    </span>
  </Tooltip>
);

/** Leyenda al pie, espejo del documento oficial. */
const LeyendaCentralizador = () => (
  <div className="cal-centralizador-grid__leyenda" role="note" aria-label="Leyenda del centralizador">
    <span className="cal-centralizador-grid__leyenda-item">
      <strong>NP</strong> = No se presenta
    </span>
    <span className="cal-centralizador-grid__leyenda-item">
      <strong>AP</strong> = Aprobado
    </span>
    <span className="cal-centralizador-grid__leyenda-item">
      <strong>PRE</strong> = Prerequisito
    </span>
  </div>
);

/**
 * @param {Object} props
 * @param {Array} props.asignaturas columnas (incluye docenteNombre)
 * @param {Array} props.estudiantes filas (notas por ofertaCursoId)
 * @param {number} props.bimestre bimestre activo (1..4)
 */
const CentralizadorGrid = ({ asignaturas = [], estudiantes = [], bimestre }) => {
  const dataSource = estudiantes.map((est, i) => ({
    ...est,
    key: est.estudianteId ?? i,
    nro: i + 1,
  }));

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
    width: 56,
    className: 'cal-centralizador-grid__col-asig',
    onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-asig' }),
    render: (_, row) => (
      <CeldaNotaBimestre valor={notaBimestre(row.notas?.[asig.ofertaCursoId], bimestre)} />
    ),
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
    {
      title: 'Cédula de identidad',
      dataIndex: 'ci',
      key: 'ci',
      width: 132,
      align: 'center',
      className: 'cal-centralizador-grid__col-ci',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
      render: (ci) => <span className="cal-centralizador-grid__ci">{ci ?? '—'}</span>,
    },
    ...columnasAsignatura,
    {
      // Boletín por estudiante: gancho a una iteración futura.
      title: 'Boletín',
      key: 'boletin',
      width: 116,
      align: 'center',
      fixed: 'right',
      className: 'cal-centralizador-grid__col-boletin',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
      render: () => (
        <Tooltip title="Próximamente">
          <Button size="small" icon={<FileTextOutlined />} disabled>
            Boletín
          </Button>
        </Tooltip>
      ),
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
      <LeyendaCentralizador />
    </div>
  );
};

export default CentralizadorGrid;
