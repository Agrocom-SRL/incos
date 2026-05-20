/**
 * Plan de calificaciones: tipos de evaluación, ponderación y cronograma por bimestre.
 */

import { Spin, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FormOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useCalificacionesPlanContext } from '@application-academico/calificaciones/hooks/context/useCalificacionesPlanContext';
import CalificacionesAlertStrip from '../components/molecules/CalificacionesAlertStrip.jsx';
import CalificacionesCursoProfile from '../components/organisms/CalificacionesCursoProfile.jsx';
import PlanEvaluacionesForm from '../components/organisms/PlanEvaluacionesForm.jsx';
import '../styles/calificaciones.css';

const { Text } = Typography;

const CalificacionesPlanPage = () => {
  const {
    curso,
    loading,
    error,
    plan,
    bimestreActivo,
    setBimestreActivo,
    bimestres,
    evaluacionesBimestre,
    componentes,
    tiposSugeridos,
    sumaPesosTeorico,
    sumaPesosPractico,
    planValido,
    planListo,
    guardando,
    breadcrumbItems,
    handleCuotaChange,
    handleAgregarEvaluacion,
    handleActualizarEvaluacion,
    handleEliminarEvaluacion,
    handleGuardarPlan,
    handleIrNotas,
    handleVolver,
  } = useCalificacionesPlanContext();

  const header = (
    <PageHeader
      title="Plan de calificaciones"
      breadcrumbItems={breadcrumbItems}
      actions={
        <>
          <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
            <ArrowLeftOutlined /> Volver a cursos
          </button>
          <ActionButton
            permiso="academico.calificacion.periodo"
            accion="CREAR"
            icon={<SaveOutlined />}
            loading={guardando}
            onClick={handleGuardarPlan}
            disabled={!planValido}
          >
            Guardar plan
          </ActionButton>
          <ActionButton
            permiso="academico.calificacion.registrar.parcial"
            accion="CREAR"
            type="primary"
            icon={<FormOutlined />}
            onClick={handleIrNotas}
          >
            Ir a registrar notas
          </ActionButton>
        </>
      }
    />
  );

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="sd">
        <CalificacionesCursoProfile curso={curso} planListo={planListo} />

        <CalificacionesAlertStrip
          items={[
            !planValido
              ? {
                  key: 'pesos',
                  type: 'warning',
                  title: 'Revisá la ponderación',
                  description:
                    'Los pesos del componente teórico y del práctico deben sumar 100 % cada uno, y las cuotas teórico + práctico deben sumar 100 puntos.',
                }
              : null,
            planListo
              ? {
                  key: 'ok',
                  type: 'success',
                  title: 'Plan guardado',
                  description: 'Ya podés registrar notas en el formulario del curso.',
                }
              : null,
            error
              ? {
                  key: 'err',
                  type: 'warning',
                  title: 'Atención',
                  description: String(error),
                }
              : null,
          ]}
        />

        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '3rem auto' }} />
        ) : (
          <PlanEvaluacionesForm
            bimestreActivo={bimestreActivo}
            setBimestreActivo={setBimestreActivo}
            bimestres={bimestres}
            evaluacionesBimestre={evaluacionesBimestre}
            componentes={componentes}
            tiposSugeridos={tiposSugeridos}
            sumaPesosTeorico={sumaPesosTeorico}
            sumaPesosPractico={sumaPesosPractico}
            plan={plan}
            onCuotaChange={handleCuotaChange}
            onAgregarEvaluacion={handleAgregarEvaluacion}
            onActualizarEvaluacion={handleActualizarEvaluacion}
            onEliminarEvaluacion={handleEliminarEvaluacion}
          />
        )}

        <Text type="secondary" className="cal-flow-lede" style={{ marginTop: 8 }}>
          Las evaluaciones de materia completa (proyecto final anual, examen final) se configuran en una etapa
          posterior y se persisten en evaluaciones_finales.
        </Text>
      </div>
    </PageTemplate>
  );
};

export default CalificacionesPlanPage;
