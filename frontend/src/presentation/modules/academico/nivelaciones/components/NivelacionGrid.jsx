/**
 * P1 nivel 2 de Nivelación — matriz estudiantes × asignaturas del paralelo.
 *
 *   N° · NÓMINA · CÉDULA · [asignaturas]
 *
 * Sin columna de bimestre (foto del estado ACTUAL, no un corte por
 * bimestre — a diferencia de `CentralizadorGrid.jsx`). Celda: nota normal si
 * el estudiante cursa la materia este año; `StatusPill` con el `tipo_estado`
 * del evento vigente si la materia está arrastrada/bloqueada — clicable
 * (navega a `/inscribir` o `/aprobar` con el contexto, ver `NivelacionParaleloPage`).
 */

import { Table, Tooltip } from 'antd';
import { StatusPill } from '@atoms';
import {
  formatEstadoHistorial,
  getEstadoHistorialPillClass,
} from '@application-academico/nivelaciones/utils/nivelacionEstados.js';
import CeldaEstudiante from './CeldaEstudiante.jsx';
import CabeceraAsignatura from './CabeceraAsignatura.jsx';

/** Celda de nota normal (sin evento vigente). Atenuada si no hay nota. */
const CeldaNota = ({ valor }) => {
  if (valor == null) {
    return <span className="niv-nivelacion-grid__nota niv-nivelacion-grid__nota--vacia">—</span>;
  }
  return <span className="niv-nivelacion-grid__nota">{valor}</span>;
};

/** Celda con evento vigente: StatusPill clicable → contexto de /inscribir o /aprobar. */
const CeldaEvento = ({ evento, onClick }) => {
  const tooltip = evento.transitionDate
    ? `Desde ${evento.transitionDate}`
    : 'Sin fecha de transición registrada';
  return (
    <Tooltip title={tooltip}>
      <button
        type="button"
        className="niv-nivelacion-grid__celda-evento"
        onClick={onClick}
        aria-label={`Ver detalle: ${formatEstadoHistorial(evento.stateType)}`}
      >
        <StatusPill
          label={formatEstadoHistorial(evento.stateType)}
          className={getEstadoHistorialPillClass(evento.stateType)}
        />
      </button>
    </Tooltip>
  );
};

/**
 * @param {Object} props
 * @param {Array} props.asignaturas columnas { ofertaCursoId, sigla, nombre, orden }
 * @param {Array} props.estudiantes filas { estudianteId, codigoEstudiante, nombreCompleto,
 *   tienePendiente, celdas: { [ofertaCursoId]: { notaFinal, estadoMatricula, evento } } }
 * @param {(row: Object, ofertaCursoId: number, celda: Object) => void} props.onCeldaEventoClick
 */
const NivelacionGrid = ({ asignaturas = [], estudiantes = [], onCeldaEventoClick }) => {
  const dataSource = estudiantes.map((est, i) => ({
    ...est,
    key: est.estudianteId ?? i,
    nro: i + 1,
  }));

  const columnasAsignatura = asignaturas.map((asig) => ({
    title: <CabeceraAsignatura sigla={asig.sigla} nombre={asig.nombre} />,
    key: `asig-${asig.ofertaCursoId}`,
    align: 'center',
    width: 132,
    className: 'niv-nivelacion-grid__col-asig',
    onHeaderCell: () => ({ className: 'niv-nivelacion-grid__th-asig' }),
    render: (_, row) => {
      const celda = row.celdas?.[asig.ofertaCursoId];
      if (!celda) {
        return <span className="niv-nivelacion-grid__nota niv-nivelacion-grid__nota--vacia">—</span>;
      }
      if (celda.evento) {
        return (
          <CeldaEvento
            evento={celda.evento}
            onClick={() => onCeldaEventoClick?.(row, asig, celda)}
          />
        );
      }
      return <CeldaNota valor={celda.notaFinal} />;
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
      className: 'niv-nivelacion-grid__col-nro',
      onHeaderCell: () => ({ className: 'niv-nivelacion-grid__th-est' }),
    },
    {
      title: 'Nómina de estudiantes',
      dataIndex: 'nombreCompleto',
      key: 'estudiante',
      width: 320,
      fixed: 'left',
      className: 'niv-nivelacion-grid__col-estudiante',
      onHeaderCell: () => ({ className: 'niv-nivelacion-grid__th-est' }),
      render: (nombreCompleto, row) => (
        <CeldaEstudiante nombre={nombreCompleto} codigo={row.codigoEstudiante} />
      ),
    },
    ...columnasAsignatura,
  ];

  return (
    <div className="niv-nivelacion-grid-wrap">
      <Table
        className="niv-nivelacion-grid"
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
    </div>
  );
};

export default NivelacionGrid;
