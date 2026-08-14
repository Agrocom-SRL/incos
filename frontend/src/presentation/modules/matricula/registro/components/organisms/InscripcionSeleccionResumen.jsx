/**
 * InscripcionSeleccionResumen — ficha de cierre del paso «Paralelo» (§4-C2).
 *
 * Es la última lectura antes de finalizar, así que recompone en UNA tarjeta lo
 * elegido en los pasos anteriores, con la jerarquía en tres franjas (dirección
 * «jerarquía limpia» aprobada el 2026-08-14): identidad → datos académicos →
 * materias marcadas. Sin colores por sector ni fondos teñidos: el color se
 * reserva para lo que informa estado (pills, siglas), el resto es jerarquía
 * tipográfica y divisores.
 *
 * Organismo del módulo: recibe el contexto y la selección ya resueltos (sin
 * hooks de fetch); el cálculo vive en buildSeleccionResumen (capa application).
 * Estilos: styles/components/organisms/materias-planilla.css (.insc-resumen*).
 */

import { useMemo } from 'react';
import { Typography } from 'antd';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { FormWorkspaceSection } from '@organisms';
import { Avatar, StatusPill } from '@atoms';
import { buildInitials } from '@application/utils/formatters';
import {
  getEnrollmentTypeLabel,
  getEnrollmentTypePillClass,
} from '@application-matricula/registro/utils/inscripcionDetailHelpers';
import {
  buildMateriasPlanillaModel,
  buildSeleccionResumen,
} from '@application-matricula/registro/utils/materiasPlanillaRules';

const { Text } = Typography;

/** Etiqueta del tag de una asignatura marcada (arrastre / nivelación). */
const TAG_MATERIA = {
  arrastre: { label: 'Arrastre', variante: 'info' },
  nivelar: { label: 'Nivelación', variante: 'warning' },
};

/** Columna del bloque académico: rótulo en versalitas + valor. */
const DatoContexto = ({ label, value }) =>
  value ? (
    <div className="insc-resumen__dato">
      <span className="insc-resumen__dato-label">{label}</span>
      <span className="insc-resumen__dato-valor">{value}</span>
    </div>
  ) : null;

const InscripcionSeleccionResumen = ({
  section = null,
  contexto = null,
  tipoAdmision = null,
  esNuevoSistema = null,
  traspasoAnioCursado = null,
  selectedMateriaIdsByPeriod = {},
}) => {
  const resumen = useMemo(() => {
    const model = buildMateriasPlanillaModel({
      contexto,
      seleccion: selectedMateriaIdsByPeriod,
      tipoAdmision,
      esNuevoSistema,
      traspasoAnioCursado,
    });
    return buildSeleccionResumen(model);
  }, [contexto, selectedMateriaIdsByPeriod, tipoAdmision, esNuevoSistema, traspasoAnioCursado]);

  const estudiante = contexto?.estudiante ?? null;
  const tipo = tipoAdmision ?? estudiante?.tipoAdmision ?? null;
  const tipoLabel = getEnrollmentTypeLabel(tipo);
  const nombreCompleto = estudiante?.nombreCompleto ?? null;
  // «Gestión Regular 2026» ya lleva el año: no se repite detrás.
  const gestion = contexto?.gestion ?? null;
  const gestionTexto = (() => {
    if (!gestion) return null;
    const nombre = gestion.nombre ? String(gestion.nombre).trim() : '';
    const anio = gestion.anio != null ? String(gestion.anio) : '';
    if (nombre && anio) return nombre.includes(anio) ? nombre : `${nombre} · ${anio}`;
    return nombre || anio || null;
  })();

  const hayMaterias = resumen.porPeriodo.length > 0;

  return (
    <FormWorkspaceSection title={section?.title} description={section?.description} fields={[]}>
      <div className="insc-resumen">
        {estudiante ? (
          <header className="insc-resumen__head">
            <Avatar className="insc-resumen__avatar" size="large">
              {buildInitials(nombreCompleto, '—')}
            </Avatar>
            <div className="insc-resumen__identidad">
              <span className="insc-resumen__nombre">
                {nombreCompleto || 'Estudiante sin nombre'}
              </span>
              <span className="insc-resumen__meta">
                {estudiante.ci ? (
                  <span className="insc-resumen__meta-item">
                    C.I. <b className="insc-resumen__meta-valor">{estudiante.ci}</b>
                  </span>
                ) : null}
                {estudiante.codigoEstudiante ? (
                  <span className="insc-resumen__meta-item">
                    Código{' '}
                    <b className="insc-resumen__meta-valor">{estudiante.codigoEstudiante}</b>
                  </span>
                ) : null}
              </span>
            </div>
            <div className="insc-resumen__pills">
              {tipoLabel ? (
                <StatusPill label={tipoLabel} className={getEnrollmentTypePillClass(tipo)} />
              ) : null}
              {resumen.multiPeriodo ? (
                <StatusPill
                  label="Nivelación"
                  className="cfg-materia-pill cfg-materia-pill--warning"
                />
              ) : null}
            </div>
          </header>
        ) : null}

        <div className="insc-resumen__datos">
          <DatoContexto label="Carrera" value={contexto?.carrera?.nombre} />
          <DatoContexto label="Plan de estudio" value={contexto?.plan?.nombre} />
          <DatoContexto label="Gestión" value={gestionTexto} />
          <DatoContexto
            label="Carga"
            value={
              hayMaterias
                ? `${resumen.totales.materias} ${resumen.totales.materias === 1 ? 'materia' : 'materias'} · ${resumen.totales.horas} h/sem`
                : null
            }
          />
        </div>

        {hayMaterias ? (
          <div className="insc-resumen__periodos">
            {resumen.porPeriodo.map((periodo) => (
              <article key={periodo.periodoId} className="insc-resumen__periodo">
                <header className="insc-resumen__periodo-header">
                  <span className="insc-resumen__periodo-nombre">{periodo.nombre}</span>
                  <span className="insc-resumen__periodo-datos">
                    {periodo.totalMaterias}{' '}
                    {periodo.totalMaterias === 1 ? 'materia marcada' : 'materias marcadas'} ·{' '}
                    {periodo.totalHoras} h/semana
                  </span>
                  <span className="insc-resumen__periodo-pills">
                    {periodo.tieneNivelar ? (
                      <StatusPill
                        label="Nivelación"
                        className="cfg-materia-pill cfg-materia-pill--warning"
                      />
                    ) : null}
                    {periodo.tieneArrastre ? (
                      <StatusPill
                        label="Arrastre"
                        className="cfg-materia-pill cfg-materia-pill--info"
                      />
                    ) : null}
                  </span>
                </header>
                <ul className="insc-resumen__materias">
                  {periodo.materias.map((materia) => {
                    const tag = materia.tag ? TAG_MATERIA[materia.tag] : null;
                    return (
                      <li key={materia.key} className="insc-resumen__materia">
                        <span className="insc-resumen__materia-sigla">{materia.sigla || '—'}</span>
                        <span className="insc-resumen__materia-nombre">
                          {materia.nombre || 'Asignatura sin nombre'}
                        </span>
                        {tag ? (
                          <StatusPill
                            label={tag.label}
                            className={`cfg-materia-pill cfg-materia-pill--${tag.variante}`}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <Text type="secondary" className="insc-resumen__vacio">
            Aún no hay materias marcadas. Vuelva al paso «Periodo y materias» para seleccionarlas.
          </Text>
        )}
      </div>

      <div className="insc-resumen__avisos">
        {resumen.multiPeriodo ? (
          <div className="materias-planilla__banda materias-planilla__banda--info">
            <InfoCircleOutlined aria-hidden />
            <Text type="secondary">
              El estudiante quedará en nivelación; los choques de horario se gestionan en
              Académico → Nivelaciones.
            </Text>
          </div>
        ) : null}

        {resumen.desmarcadasNivelar.length > 0 ? (
          <div className="materias-planilla__banda materias-planilla__banda--warning">
            <ExclamationCircleOutlined aria-hidden />
            <Text type="secondary">
              Quedaron pendientes de nivelación sin inscribir (
              {resumen.desmarcadasNivelar.map((d) => d.sigla).filter(Boolean).join(', ') || 's/sigla'}
              ). La exigencia se revisará en Académico → Nivelaciones.
            </Text>
          </div>
        ) : null}
      </div>
    </FormWorkspaceSection>
  );
};

export default InscripcionSeleccionResumen;
