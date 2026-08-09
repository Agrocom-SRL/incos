/**
 * P3 del Centralizador — matriz estudiantes × asignaturas de un BIMESTRE.
 *
 *   N° · NÓMINA · CÉDULA · [asignaturas] · OBSERVACIONES
 *
 * La columna Observaciones persiste en bimestres_matricula.observaciones.
 * La exportación de boletines vive en la vista anual (CentralizadorAnualPage).
 */

import { Select, Table } from 'antd';
import { VERDICTOS_OBSERVACION_BIMESTRE_OPTIONS } from '@application-academico/centralizador/utils/centralizadorDoc.js';
import CeldaEstudiante from './CeldaEstudiante.jsx';
import CabeceraAsignatura from './CabeceraAsignatura.jsx';

/** Variante de pill por verdicto (lectura), mismo lenguaje que la columna Estado de P2. */
const OBSERVACION_PILL_VARIANTE = {
  'APROBADO/A': 'aprobado',
  'REPROBADO/A': 'reprobado',
  ABANDONO: 'abandono',
  'NO SE PRESENTO': 'no-presento',
};

/** Nota del bimestre activo para una asignatura. */
const notaBimestre = (nota, bimestre) => {
  if (!nota || bimestre == null) return null;
  const valor = nota[`bim${bimestre}`];
  return valor == null ? null : Number(valor);
};

/** Celda de nota de bimestre. Atenuada si no hay nota; danger si reprueba. */
const CeldaNotaBimestre = ({ valor, notaMinima }) => {
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

const CeldaObservacionBimestre = ({
  valor,
  editable,
  estudianteId,
  onChange,
  onBlur,
}) => {
  const texto = valor?.trim();

  if (!editable) {
    if (!texto) {
      return <span className="cal-centralizador-grid__obs-vacio">—</span>;
    }
    const variante = OBSERVACION_PILL_VARIANTE[texto];
    if (!variante) {
      return <span className="cal-centralizador-grid__obs-texto">{texto}</span>;
    }
    return (
      <span
        className={`cal-centralizador-grid__estado cal-centralizador-grid__estado--${variante}`}
      >
        {texto}
      </span>
    );
  }

  return (
    <Select
      className="cal-centralizador-grid__obs-select"
      size="small"
      value={texto || undefined}
      options={VERDICTOS_OBSERVACION_BIMESTRE_OPTIONS}
      onChange={(nuevoValor) => {
        const valorNormalizado = nuevoValor ?? null;
        onChange?.(estudianteId, valorNormalizado);
        onBlur?.(estudianteId, valorNormalizado);
      }}
      allowClear
      placeholder="Observación del bimestre…"
      style={{ width: '100%' }}
      popupMatchSelectWidth={false}
      aria-label="Observaciones del bimestre"
    />
  );
};

/** Leyenda al pie, espejo del documento oficial. */
const LeyendaCentralizador = () => (
  <div className="cal-centralizador-grid__leyenda" role="note" aria-label="Leyenda del centralizador">
    <span className="cal-centralizador-grid__leyenda-item">
      Cada nota es el puntaje acumulado del bimestre (teórico + práctico) sobre 100.
    </span>
  </div>
);

/**
 * @param {Object} props
 * @param {Array} props.asignaturas columnas (incluye docenteNombre)
 * @param {Array} props.estudiantes filas (notas por ofertaCursoId)
 * @param {number} props.bimestre bimestre activo (1..4)
 * @param {number} props.notaMinimaAprobacion umbral de reprobación (desde la política)
 * @param {boolean} [props.puedeEditarObservaciones]
 * @param {(estudianteId: number, valor: string) => void} [props.onObservacionChange]
 * @param {(estudianteId: number, valor: string) => void} [props.onObservacionBlur]
 */
const CentralizadorGrid = ({
  asignaturas = [],
  estudiantes = [],
  bimestre,
  notaMinimaAprobacion = 61,
  puedeEditarObservaciones = false,
  onObservacionChange,
  onObservacionBlur,
}) => {
  const dataSource = estudiantes.map((est, i) => ({
    ...est,
    key: est.estudianteId ?? i,
    nro: i + 1,
    observacionBimestre: est.observacionBimestre ?? est.observacionesBimestre?.[bimestre] ?? '',
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
    width: 132,
    className: 'cal-centralizador-grid__col-asig',
    onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-asig' }),
    render: (_, row) => (
      <CeldaNotaBimestre
        valor={notaBimestre(row.notas?.[asig.ofertaCursoId], bimestre)}
        notaMinima={notaMinimaAprobacion}
      />
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
      title: 'Observación del bimestre',
      key: 'observaciones',
      width: 220,
      className: 'cal-centralizador-grid__col-obs',
      onHeaderCell: () => ({ className: 'cal-centralizador-grid__th-est' }),
      render: (_, row) => (
        <CeldaObservacionBimestre
          valor={row.observacionBimestre}
          editable={puedeEditarObservaciones}
          estudianteId={row.estudianteId}
          onChange={onObservacionChange}
          onBlur={onObservacionBlur}
        />
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
