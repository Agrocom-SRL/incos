/**
 * Matriz del Consolidado % de asistencia (ACA-ASI-CONS) — gemela del
 * Centralizador de calificaciones, con el shell verde de la grilla semanal:
 *
 *   N° · NÓMINA DE ESTUDIANTES · [asignaturas] · PROMEDIO %
 *
 * Cada celda muestra el % de asistencia del estudiante en el curso (misma
 * regla que la actividad ASISTENCIA del cuaderno) con tooltip del detalle de
 * sesiones/faltas; bajo el umbral de aprobación se marca con el token
 * semántico de error. El promedio es ponderado por sesiones (viene del
 * backend, paridad pantalla ↔ Excel).
 */

import { Table, Tooltip } from 'antd';
import { IdentidadCelda } from '@atoms';
import {
  PCT_ASISTENCIA_RIESGO,
  formatPctAsistencia,
} from '@application-academico/asistencia/utils/asistenciaConsolidado.js';

/** Cabecera de asignatura: sigla / materia / docente (+ estado del registro). */
const CabeceraAsignaturaConsolidado = ({ asignatura, bimestre }) => (
  <div className="asi-consolidado__asig-head">
    <span className="asi-consolidado__asig-sigla">{asignatura.sigla ?? '—'}</span>
    <span className="asi-consolidado__asig-detalle">
      <span className="asi-consolidado__asig-nombre">{asignatura.nombre ?? ''}</span>
      {asignatura.docenteNombre ? (
        <span className="asi-consolidado__asig-docente">{asignatura.docenteNombre}</span>
      ) : null}
      {bimestre != null && asignatura.registroEstado === 'ABIERTO' ? (
        <span className="asi-consolidado__asig-estado">registro abierto</span>
      ) : null}
    </span>
  </div>
);

/** Detalle de la celda para el tooltip (sesiones computadas y faltas). */
const detalleCelda = (celda) => {
  if (!celda || !celda.sesiones) return 'Sin sesiones computadas';
  const partes = [
    `${celda.sesiones} sesiones computadas`,
    `${celda.ausencias ?? 0} ausencias`,
    `${celda.tardanzas ?? 0} retrasos`,
  ];
  if (celda.licencias) partes.push(`${celda.licencias} con licencia`);
  return partes.join(' · ');
};

/** Celda de % (curso o promedio). Atenuada sin datos; en riesgo bajo el umbral. */
const CeldaPct = ({ valor, detalle, promedio = false }) => {
  const enRiesgo = valor != null && Number(valor) < PCT_ASISTENCIA_RIESGO;
  const contenido = (
    <span
      className={[
        'asi-consolidado__pct',
        promedio ? 'asi-consolidado__pct--prom' : '',
        valor == null ? 'asi-consolidado__pct--vacia' : '',
        enRiesgo ? 'asi-consolidado__pct--riesgo' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {formatPctAsistencia(valor)}
    </span>
  );
  return detalle ? <Tooltip title={detalle}>{contenido}</Tooltip> : contenido;
};

/** Leyenda al pie: mismas reglas que la actividad ASISTENCIA y el Excel. */
const LeyendaConsolidado = () => (
  <div className="asi-consolidado__leyenda" role="note" aria-label="Leyenda del consolidado">
    <span className="asi-consolidado__leyenda-item">
      <strong>Ausente</strong> = 1 falta
    </span>
    <span className="asi-consolidado__leyenda-item">
      <strong>Retraso</strong> = 0.5 faltas
    </span>
    <span className="asi-consolidado__leyenda-item">
      <strong>Licencia aprobada</strong> neutraliza la sesión
    </span>
    <span className="asi-consolidado__leyenda-item">
      En rojo: % bajo el mínimo de aprobación ({PCT_ASISTENCIA_RIESGO}). El promedio se pondera
      por sesiones computadas de registros cerrados.
    </span>
  </div>
);

/**
 * @param {Object} props
 * @param {Array} props.asignaturas columnas (identidad = ofertaCursoId)
 * @param {Array} props.estudiantes filas (celdas en `asistencia[ofertaCursoId]`, `promedioPct`)
 * @param {number|null} props.bimestre 1..4 · null = acumulado anual
 */
const ConsolidadoAsistenciaGrid = ({ asignaturas = [], estudiantes = [], bimestre = null }) => {
  const dataSource = estudiantes.map((est, i) => ({
    ...est,
    key: est.estudianteId ?? i,
    nro: i + 1,
  }));

  const columnasAsignatura = asignaturas.map((asig) => ({
    title: <CabeceraAsignaturaConsolidado asignatura={asig} bimestre={bimestre} />,
    key: `asig-${asig.ofertaCursoId}`,
    align: 'center',
    width: 118,
    onHeaderCell: () => ({
      className: 'asi-grid__th-bim asi-grid__th-bim--activo asi-consolidado__th-asig',
    }),
    render: (_, row) => {
      const celda = row.asistencia?.[asig.ofertaCursoId] ?? null;
      return <CeldaPct valor={celda?.pctAsistencia ?? null} detalle={detalleCelda(celda)} />;
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
      className: 'asi-grid__col-nro',
      onHeaderCell: () => ({ className: 'asi-grid__th-est' }),
      onCell: () => ({ className: 'asi-grid__col-nro' }),
    },
    {
      title: 'Nómina de estudiantes',
      dataIndex: 'nombreCompleto',
      key: 'estudiante',
      width: 300,
      fixed: 'left',
      className: 'asi-grid__col-estudiante',
      onHeaderCell: () => ({ className: 'asi-grid__th-est' }),
      onCell: () => ({ className: 'asi-grid__col-estudiante' }),
      render: (nombreCompleto, row) => (
        <IdentidadCelda codigo={row.codigo} nombre={nombreCompleto} />
      ),
    },
    ...columnasAsignatura,
    {
      title: 'Promedio %',
      key: 'promedio',
      width: 110,
      align: 'center',
      className: 'asi-consolidado__col-prom',
      onHeaderCell: () => ({ className: 'asi-grid__th-est' }),
      onCell: () => ({ className: 'asi-consolidado__col-prom' }),
      render: (_, row) => (
        <CeldaPct valor={row.promedioPct ?? null} detalle="Promedio ponderado por sesiones" promedio />
      ),
    },
  ];

  return (
    <div className="asi-grid-wrap">
      <Table
        className="asi-grid asi-grid--consolidado-style asi-consolidado"
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        pagination={false}
        size="small"
        bordered
        tableLayout="fixed"
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: 'Sin registros de asistencia computables para el paralelo' }}
      />
      <LeyendaConsolidado />
    </div>
  );
};

export default ConsolidadoAsistenciaGrid;
