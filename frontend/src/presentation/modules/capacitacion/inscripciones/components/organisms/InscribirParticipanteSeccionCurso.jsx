/**
 * Organismo: contenido del paso "Curso" de Inscribir participante (CAP).
 * Tarjetas seleccionables (`DataCards` + molécula `CursoCapacitacionCard`, mismo
 * diseño que los paralelos de Matrícula y los grupos). La selección la controla
 * `cursoSeleccionadoId` (estado plano del hook, no es un campo de `Form`).
 *
 * La tarjeta ya muestra costo/cupo/fechas de un vistazo; el
 * detalle del curso y del grupo elegido se lee en el resumen de cierre
 * (`InscripcionCapSeleccionResumen`), no aquí, para no duplicar los mismos datos.
 * Va envuelto en `FormWorkspaceSection` con el título/descripción de la config.
 *
 * Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { Alert, Empty, Spin } from 'antd';
import { FormWorkspaceSection } from '@organisms';
import { DataCards } from '@molecules';
import { allSpacing } from '@theme/tokens';
import CursoCapacitacionCard from '@capacitacion/components/molecules/CursoCapacitacionCard';

const InscribirParticipanteSeccionCurso = ({
  section = null,
  form,
  cursos,
  loadingCursos,
  errorCursos,
  cursoSeleccionadoId,
  onCursoChange,
}) => {
  const seleccionado = cursos.find((c) => c.id === cursoSeleccionadoId) ?? null;

  return (
    <FormWorkspaceSection title={section?.title} description={section?.description} form={form}>
      {errorCursos ? (
        <Alert
          type="error"
          showIcon
          title="No se pudieron cargar los cursos"
          description={errorCursos}
          style={{ marginBottom: allSpacing.marginSM }}
        />
      ) : null}

      {!loadingCursos && !errorCursos && cursos.length === 0 ? (
        <Empty description="No hay cursos de capacitación disponibles." />
      ) : (
        <Spin spinning={loadingCursos}>
          <DataCards
            data={cursos}
            renderItem={(curso) => <CursoCapacitacionCard curso={curso} />}
            onSelect={(curso) => onCursoChange(curso.id)}
            selectedItem={seleccionado}
            className="step2-paralelos-cards"
          />
        </Spin>
      )}
    </FormWorkspaceSection>
  );
};

export default InscribirParticipanteSeccionCurso;
