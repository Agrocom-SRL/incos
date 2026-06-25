/**
 * Bloque de cabecera con el look del documento oficial "Centralizador de
 * calificaciones". Combina las constantes institucionales (parametrizables, en
 * CENTRALIZADOR_DOC) con los datos del paralelo y la gestión. Reutilizado por
 * P2 (bimestres) y P3 (matriz por bimestre).
 *
 * LIBRO N° / FOLIO N° del documento oficial se omiten: no existen en el sistema.
 */

import { CENTRALIZADOR_DOC } from '@application-academico/calificaciones/utils/centralizadorDoc.js';

/** Campo del bloque de cabecera tipo documento. */
const CampoDoc = ({ etiqueta, valor }) => (
  <div className="cal-centralizador-doc__item">
    <dt>{etiqueta}</dt>
    <dd>{valor ?? '—'}</dd>
  </div>
);

/**
 * @param {Object} props
 * @param {Object} props.paralelo paralelo normalizado (carreraNombre, periodoNombre, …)
 * @param {number|null} props.gestionId
 * @param {string} [props.tituloSufijo] sufijo del título (p.ej. "· 2do bimestre")
 */
const CentralizadorDocHeader = ({ paralelo, gestionId, tituloSufijo = null }) => {
  const p = paralelo ?? {};
  const cursoParalelo = [p.periodoNombre, p.paraleloNombre]
    .filter(Boolean)
    .join(' · Paralelo ');
  return (
    <section className="cal-centralizador-doc">
      <h2 className="cal-centralizador-doc__titulo">
        Centralizador de calificaciones
        {tituloSufijo ? <span className="cal-centralizador-doc__titulo-sufijo"> {tituloSufijo}</span> : null}
      </h2>
      <dl className="cal-centralizador-doc__grid">
        <CampoDoc etiqueta="Institución" valor={CENTRALIZADOR_DOC.institucion} />
        <CampoDoc etiqueta="Gestión" valor={gestionId} />
        <CampoDoc etiqueta="Nivel" valor={CENTRALIZADOR_DOC.nivel} />
        <CampoDoc etiqueta="Carrera" valor={p.carreraNombre} />
        <CampoDoc etiqueta="Régimen" valor={CENTRALIZADOR_DOC.regimen} />
        <CampoDoc etiqueta="Curso y paralelo" valor={cursoParalelo || null} />
        <CampoDoc etiqueta="Turno" valor={p.turno} />
        <CampoDoc etiqueta="R.M." valor={CENTRALIZADOR_DOC.resolucionMinisterial} />
      </dl>
    </section>
  );
};

export default CentralizadorDocHeader;
