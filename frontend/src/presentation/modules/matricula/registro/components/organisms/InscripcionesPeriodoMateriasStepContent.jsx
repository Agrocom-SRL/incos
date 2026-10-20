/**
 * InscripcionesPeriodoMateriasStepContent - Contenido del paso «Periodo y materias».
 *
 * Cabecera de sección estándar (FormWorkspaceSection, sin Card) + planilla
 * seleccionable estilo plan de estudios (MateriasPlanillaSelector) alimentada
 * por el contexto de matrícula (contexto.periodos). Los periodos se derivan de
 * las materias marcadas — sin checkboxGroup de periodo ni Alerts fijos.
 *
 * Estados del paso (§4-C1): carga → esqueleto de planilla; error → estado con
 * reintento; sin carrera → hint «Seleccione primero la carrera»; edición de
 * inscripción NUEVO → planilla en solo lectura (aviso como texto secundario).
 */

import { Typography } from 'antd';
import { FormWorkspaceSection } from '@organisms';
import MateriasPlanillaSelector from './MateriasPlanillaSelector';

const { Text } = Typography;

const InscripcionesPeriodoMateriasStepContent = ({
  section,
  matriculaContexto = null,
  tipoAdmision = null,
  traspasoAnioCursado = null,
  hasCarrera = false,
  selectedMateriaIdsByPeriod = {},
  onToggleMaterias,
  readOnly = false,
  materiasInvalid = false,
  materiasInvalidHint = null,
}) => (
  <div className="step-periodo-materias-section">
    <FormWorkspaceSection title={section?.title} description={section?.description} fields={[]}>
      {readOnly ? (
        <Text type="secondary">
          Modo edición: en inscripciones de tipo NUEVO el periodo y las materias no se
          modifican; puede cambiar el paralelo en el siguiente paso.
        </Text>
      ) : null}

      <MateriasPlanillaSelector
        contexto={matriculaContexto?.contexto ?? null}
        loading={matriculaContexto?.contextoLoading ?? false}
        error={matriculaContexto?.contextoError ?? null}
        onRetry={matriculaContexto?.refetchContexto ?? null}
        hasCarrera={hasCarrera}
        tipoAdmision={tipoAdmision}
        esNuevoSistema={matriculaContexto?.esNuevoSistema ?? null}
        traspasoAnioCursado={traspasoAnioCursado}
        selectedMateriaIdsByPeriod={selectedMateriaIdsByPeriod}
        onToggleMaterias={onToggleMaterias}
        readOnly={readOnly}
        invalid={materiasInvalid}
        invalidHint={materiasInvalidHint}
      />
    </FormWorkspaceSection>
  </div>
);

export default InscripcionesPeriodoMateriasStepContent;
