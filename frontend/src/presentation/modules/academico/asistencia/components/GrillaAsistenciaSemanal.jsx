/**
 * Grilla semanal de asistencia (organismo, gemelo de NotasGrid).
 *
 * Columnas = días de la semana con clase (`dias`); filas = estudiantes en el orden del
 * backend (no se reordena). Cada celda es un `CeldaAsistencia`. Recibe props ya mapeadas
 * y delega el ciclo de marca en `onToggleCelda` (lógica en el state hook).
 */
import { Table } from 'antd';
import CeldaEstudiante from '@academico/calificaciones/components/CeldaEstudiante.jsx';
import CeldaAsistencia from './CeldaAsistencia.jsx';
import {
  etiquetaDiaCorto,
  numeroDia,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';
import { celdaEditable } from '@application-academico/asistencia/utils/asistenciaMarcas.js';

/** Anchos fijos (mismos criterios que el cuaderno de notas). */
const ANCHO_COL_NRO = 56;
const ANCHO_COL_ESTUDIANTE = 320;
const ANCHO_COL_DIA = 80;

const ColumnaDiaHead = ({ dia }) => (
  <div className="asi-grid__col-head">
    <span className="asi-grid__col-head-dow">{etiquetaDiaCorto(dia.fechaClase)}</span>
    <span className="asi-grid__col-head-num">{numeroDia(dia.fechaClase)}</span>
  </div>
);

const renderEstudiante = (_, row) => (
  <CeldaEstudiante nombre={row.estudianteNombre} codigo={row.estudianteCodigo} />
);

const GrillaAsistenciaSemanal = ({
  dias = [],
  filas = [],
  registroCerrado = false,
  estadoCelda,
  onToggleCelda,
}) => {
  const fijarColumnaEstudiante = dias.length >= 4;

  const columnasDia = dias.map((dia) => ({
    title: <ColumnaDiaHead dia={dia} />,
    key: dia.fechaClase,
    width: ANCHO_COL_DIA,
    align: 'center',
    className: [
      'asi-grid__col-dia',
      dia.esFuturo ? 'asi-grid__col-dia--futuro' : '',
      dia.neutro ? 'asi-grid__col-dia--neutro' : '',
    ]
      .filter(Boolean)
      .join(' '),
    onCell: () => ({ className: 'asi-grid__col-dia' }),
    render: (_, row) => {
      const celda = row.diasPorFecha.get(dia.fechaClase) ?? null;
      const estadoBackend = celda?.estado ?? null;
      const editable = celdaEditable({
        esDiaClase: dia.esDiaClase,
        neutro: celda?.neutro ?? dia.neutro,
        esFuturo: dia.esFuturo,
        registroCerrado,
      });
      return (
        <CeldaAsistencia
          estado={estadoCelda(row.matriculaMateriaId, dia.fechaClase, estadoBackend)}
          neutro={celda?.neutro ?? dia.neutro}
          futuro={dia.esFuturo}
          editable={editable}
          estudianteNombre={row.estudianteNombre}
          fecha={dia.fechaClase}
          onToggle={() => onToggleCelda(row.matriculaMateriaId, dia.fechaClase, estadoBackend)}
        />
      );
    },
  }));

  const columns = [
    {
      title: 'Nro',
      dataIndex: 'nro',
      key: 'nro',
      width: ANCHO_COL_NRO,
      fixed: 'left',
      align: 'center',
      className: 'asi-grid__col-nro',
      onCell: () => ({ className: 'asi-grid__col-nro' }),
    },
    {
      title: 'Estudiante',
      key: 'estudiante',
      width: ANCHO_COL_ESTUDIANTE,
      ...(fijarColumnaEstudiante ? { fixed: 'left' } : {}),
      className: 'asi-grid__col-estudiante',
      onCell: () => ({ className: 'asi-grid__col-estudiante' }),
      render: renderEstudiante,
    },
    ...columnasDia,
  ];

  // Pre-indexa los días por fecha en cada fila para acceso O(1) en el render de columnas.
  const dataSource = filas.map((fila, idx) => ({
    ...fila,
    key: fila.matriculaMateriaId,
    nro: idx + 1,
    diasPorFecha: new Map((fila.dias ?? []).map((d) => [d.fechaClase, d])),
  }));

  const anchoMinimoTabla =
    ANCHO_COL_NRO + ANCHO_COL_ESTUDIANTE + dias.length * ANCHO_COL_DIA;
  const requiereScroll = anchoMinimoTabla > 720;

  return (
    <div className="asi-grid-wrap">
      <Table
        className="asi-grid"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        tableLayout="fixed"
        scroll={requiereScroll ? { x: anchoMinimoTabla } : undefined}
        locale={{ emptyText: 'Sin estudiantes matriculados en el curso' }}
      />
    </div>
  );
};

export default GrillaAsistenciaSemanal;
