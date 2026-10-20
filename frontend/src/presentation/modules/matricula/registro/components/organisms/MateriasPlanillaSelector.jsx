/**
 * MateriasPlanillaSelector — planilla seleccionable de materias del wizard de
 * matrícula (paso «Periodo y materias», §4-C1 del plan matricula-wizard-rediseno).
 *
 * Adapta el patrón visual del documento de plan de estudios
 * (PlanEstudioDocumentoView / plan-documento.css) con acento NEUTRO
 * institucional (tokens del theme, sin color de carrera): grid de periodos en
 * 3 columnas colapsable, cabecera-banda por periodo con «marcar todo» y tabla
 * [check] CÓDIGO | ASIGNATURA | PRE REQ. con fila clickeable completa (la carga
 * horaria no se muestra aquí: no interviene en la elección de materias).
 *
 * Las reglas por perfil (NUEVO/ANTIGUO/TRASPASO/TRANSITABILIDAD, kardex,
 * prerrequisitos, salto máximo, nivelación) NO viven aquí: el modelo lo
 * construye buildMateriasPlanillaModel (capa application) y este organismo
 * solo lo pinta.
 *
 * Estilos: styles/components/organisms/materias-planilla.css (solo var(--…),
 * dark-safe).
 */

import { useMemo } from 'react';
import { Button, Checkbox, Empty, Skeleton, Tooltip, Typography } from 'antd';
import {
  CheckCircleFilled,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { StatusPill } from '@atoms';
import {
  buildMateriasPlanillaModel,
  PLANILLA_ROW_ESTADOS,
} from '@application-matricula/registro/utils/materiasPlanillaRules';

const { Text } = Typography;

/** Tags de fila (pills del design system; ámbar para nivelar, info para arrastre). */
const ROW_TAGS = {
  nivelar: { label: 'Nivelar en esta gestión', className: 'cfg-materia-pill cfg-materia-pill--warning' },
  arrastre: { label: 'Arrastre', className: 'cfg-materia-pill cfg-materia-pill--info' },
};

/** Celda de marcado según el estado de la fila. */
function RowCheckCell({ row, onToggle }) {
  if (row.estado === PLANILLA_ROW_ESTADOS.APROBADA) {
    return <CheckCircleFilled className="materias-planilla__check-aprobada" aria-hidden />;
  }
  if (row.estado === PLANILLA_ROW_ESTADOS.BLOQUEADA_PRERREQUISITO) {
    return <LockOutlined className="materias-planilla__check-candado" aria-hidden />;
  }
  return (
    <Checkbox
      checked={row.marcada}
      disabled={!row.seleccionable}
      aria-label={`${row.sigla ?? ''} ${row.nombre ?? ''}`.trim() || 'Materia'}
      onClick={(e) => e.stopPropagation()}
      onChange={() => onToggle?.(row)}
    />
  );
}

function PlanillaRow({ row, onToggle }) {
  const tag = row.tag ? ROW_TAGS[row.tag] : null;
  const clickable = row.seleccionable;

  const tr = (
    <tr
      className={`materias-planilla__row materias-planilla__row--${row.estado}`}
      onClick={clickable ? () => onToggle?.(row) : undefined}
      aria-disabled={!clickable || undefined}
    >
      <td className="materias-planilla__td-check">
        <RowCheckCell row={row} onToggle={onToggle} />
      </td>
      <td className="materias-planilla__td-codigo">{row.sigla ?? '—'}</td>
      <td className="materias-planilla__td-nombre">
        {/* Caja de dos líneas exactas (altura fija de fila): los nombres largos
            se recortan y los de una línea quedan centrados verticalmente.
            El nombre completo queda en el title. */}
        <span className="materias-planilla__nombre-box">
          <span className="materias-planilla__nombre-clamp">
            <span className="materias-planilla__nombre-texto" title={row.nombre ?? undefined}>
              {row.nombre ?? '—'}
            </span>
            {row.estado === PLANILLA_ROW_ESTADOS.APROBADA && row.notaFinal != null ? (
              <span className="materias-planilla__nota" aria-label={`Nota ${row.notaFinal}`}>
                {row.notaFinal}
              </span>
            ) : null}
            {tag ? <StatusPill label={tag.label} className={tag.className} /> : null}
          </span>
        </span>
      </td>
      <td className="materias-planilla__td-prereq">{row.prerrequisitoSigla ?? '—'}</td>
    </tr>
  );

  return row.tooltip ? (
    <Tooltip key={row.key} title={row.tooltip}>
      {tr}
    </Tooltip>
  ) : (
    tr
  );
}

function PlanillaPeriodo({ periodo, readOnly, onToggleRow, onToggleAll }) {
  const headerToggleDisabled =
    readOnly || periodo.disabled || periodo.fijo || periodo.seleccionablesCount === 0;

  return (
    <section
      className={`materias-planilla__year${periodo.disabled ? ' materias-planilla__year--disabled' : ''}`}
      aria-label={periodo.nombre}
    >
      <header className="materias-planilla__year-head">
        <Checkbox
          className="materias-planilla__year-check"
          checked={periodo.fijo || periodo.todasSeleccionadas}
          indeterminate={!periodo.todasSeleccionadas && periodo.algunaSeleccionada}
          disabled={headerToggleDisabled}
          aria-label={`Marcar todas las asignaturas de ${periodo.nombre}`}
          onChange={() => onToggleAll?.(periodo)}
        />
        <span className="materias-planilla__year-title">
          {String(periodo.nombre ?? '').toUpperCase()}
        </span>
      </header>
      <div className="materias-planilla__year-body">
        <table className="materias-planilla__table">
          <colgroup>
            <col className="materias-planilla__col-check" />
            <col className="materias-planilla__col-codigo" />
            <col className="materias-planilla__col-nombre" />
            <col className="materias-planilla__col-prereq" />
          </colgroup>
          <thead>
            <tr>
              <th aria-label="Marcar" />
              <th>CÓDIGO</th>
              <th>ASIGNATURA</th>
              <th>PRE REQ.</th>
            </tr>
          </thead>
          <tbody>
            {periodo.rows.length === 0 ? (
              <tr className="materias-planilla__row materias-planilla__row--placeholder">
                <td colSpan={4} className="materias-planilla__td-vacio">
                  Sin asignaturas en este periodo.
                </td>
              </tr>
            ) : (
              periodo.rows.map((row) => (
                <PlanillaRow key={row.key} row={row} onToggle={onToggleRow} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Esqueleto de la planilla mientras carga el contexto de matrícula. */
function PlanillaSkeleton() {
  return (
    <div className="materias-planilla__skeleton" aria-label="Cargando plan de estudios">
      {[0, 1, 2].map((i) => (
        <div key={i} className="materias-planilla__skeleton-col">
          <Skeleton.Input active block className="materias-planilla__skeleton-head" />
          <Skeleton active title={false} paragraph={{ rows: 6, width: '100%' }} />
        </div>
      ))}
    </div>
  );
}

const MateriasPlanillaSelector = ({
  contexto = null,
  loading = false,
  error = null,
  onRetry = null,
  hasCarrera = false,
  tipoAdmision = null,
  esNuevoSistema = null,
  traspasoAnioCursado = null,
  selectedMateriaIdsByPeriod = {},
  onToggleMaterias,
  readOnly = false,
  invalid = false,
  invalidHint = null,
}) => {
  const model = useMemo(
    () =>
      buildMateriasPlanillaModel({
        contexto,
        seleccion: selectedMateriaIdsByPeriod,
        readOnly,
        tipoAdmision,
        esNuevoSistema,
        traspasoAnioCursado,
      }),
    [contexto, selectedMateriaIdsByPeriod, readOnly, tipoAdmision, esNuevoSistema, traspasoAnioCursado]
  );

  // Sin carrera todavía no hay plan que mostrar (el contexto se dispara al elegirla).
  if (!hasCarrera && !model && !loading && !error) {
    return (
      <div className="materias-planilla__hint">
        Seleccione primero la carrera para ver la planilla del plan de estudios.
      </div>
    );
  }

  if (error && !model) {
    return (
      <div className="materias-planilla__error" role="alert">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No se pudo cargar el plan de estudios de la carrera."
        >
          {onRetry ? (
            <Button size="small" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null}
        </Empty>
      </div>
    );
  }

  if (!model) {
    // Cargando (o contexto aún no solicitado): esqueleto de planilla.
    return <PlanillaSkeleton />;
  }

  const handleToggleRow = (row) => {
    if (!row.seleccionable || !onToggleMaterias) return;
    const actuales = (selectedMateriaIdsByPeriod?.[row.periodoId] ?? []).map(Number);
    const siguiente = actuales.includes(row.materiaId)
      ? actuales.filter((id) => id !== row.materiaId)
      : [...actuales, row.materiaId];
    onToggleMaterias(row.periodoId, siguiente);
  };

  const handleToggleAll = (periodo) => {
    if (!onToggleMaterias) return;
    const seleccionables = periodo.rows
      .filter((r) => r.seleccionable && r.materiaId != null)
      .map((r) => r.materiaId);
    onToggleMaterias(periodo.id, periodo.todasSeleccionadas ? [] : seleccionables);
  };

  const desmarcadas = model.flags.desmarcadasNivelar;

  return (
    <div className={`materias-planilla${invalid ? ' materias-planilla--invalid' : ''}`}>
      {invalid && invalidHint ? (
        <div className="materias-planilla__invalid-hint" role="alert">
          {invalidHint}
        </div>
      ) : null}

      {model.flags.multiPeriodo ? (
        <div className="materias-planilla__banda materias-planilla__banda--info">
          <InfoCircleOutlined aria-hidden />
          <Text type="secondary">
            El estudiante quedará en nivelación; los choques de horario se gestionan en
            Académico → Nivelaciones.
          </Text>
        </div>
      ) : null}

      {desmarcadas.length > 0 ? (
        <div className="materias-planilla__banda materias-planilla__banda--warning">
          <ExclamationCircleOutlined aria-hidden />
          <Text type="secondary">
            Dejó sin marcar {desmarcadas.length === 1 ? 'una materia pendiente' : `${desmarcadas.length} materias pendientes`}{' '}
            de nivelación ({desmarcadas.map((d) => d.sigla).filter(Boolean).join(', ') || 's/sigla'}).
            La exigencia se revisará en Académico → Nivelaciones.
          </Text>
        </div>
      ) : null}

      <div className="materias-planilla__years">
        {model.periodos.map((periodo) => (
          <PlanillaPeriodo
            key={periodo.id}
            periodo={periodo}
            readOnly={readOnly}
            onToggleRow={handleToggleRow}
            onToggleAll={handleToggleAll}
          />
        ))}
      </div>
    </div>
  );
};

export default MateriasPlanillaSelector;
