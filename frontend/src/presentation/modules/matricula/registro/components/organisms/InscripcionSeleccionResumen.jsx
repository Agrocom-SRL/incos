/**
 * InscripcionSeleccionResumen — panel compacto del paso «Paralelo» (§4-C2):
 * por cada periodo con materias marcadas muestra n.º de materias, horas
 * semanales y tags «Arrastre»/«Nivelación», más la advertencia discreta si el
 * usuario desmarcó pendientes a nivelar. Reemplaza al field-Alert
 * «resumenInscripcion» histórico.
 *
 * Organismo del módulo: recibe el contexto y la selección ya resueltos (sin
 * hooks de fetch); el cálculo vive en buildSeleccionResumen (capa application).
 * Estilos: styles/components/organisms/materias-planilla.css (.insc-seleccion-resumen*).
 */

import { useMemo } from 'react';
import { Typography } from 'antd';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { FormWorkspaceSection } from '@organisms';
import { StatusPill } from '@atoms';
import {
  buildMateriasPlanillaModel,
  buildSeleccionResumen,
} from '@application-matricula/registro/utils/materiasPlanillaRules';

const { Text } = Typography;

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

  return (
    <FormWorkspaceSection title={section?.title} description={section?.description} fields={[]}>
      {resumen.porPeriodo.length === 0 ? (
        <Text type="secondary">
          Aún no hay materias marcadas. Vuelva al paso «Periodo y materias» para seleccionarlas.
        </Text>
      ) : (
        <div className="insc-seleccion-resumen">
          {resumen.porPeriodo.map((periodo) => (
            <div key={periodo.periodoId} className="insc-seleccion-resumen__item">
              <span className="insc-seleccion-resumen__periodo">{periodo.nombre}</span>
              <span className="insc-seleccion-resumen__dato">
                <strong>{periodo.totalMaterias}</strong>{' '}
                {periodo.totalMaterias === 1 ? 'materia' : 'materias'}
              </span>
              <span className="insc-seleccion-resumen__dato">
                <strong>{periodo.totalHoras}</strong> h/semana
              </span>
              {periodo.tieneNivelar ? (
                <StatusPill label="Nivelación" className="cfg-materia-pill cfg-materia-pill--warning" />
              ) : null}
              {periodo.tieneArrastre ? (
                <StatusPill label="Arrastre" className="cfg-materia-pill cfg-materia-pill--info" />
              ) : null}
            </div>
          ))}
        </div>
      )}

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
    </FormWorkspaceSection>
  );
};

export default InscripcionSeleccionResumen;
