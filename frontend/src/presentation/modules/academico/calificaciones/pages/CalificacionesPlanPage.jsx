/**
 * Plan de calificaciones: tipos de evaluación, ponderación y cronograma por bimestre.
 */

import { Alert, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FormOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useCalificacionesPlanContext } from '@application-academico/calificaciones/hooks/context/useCalificacionesPlanContext';
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
            <ArrowLeftOutlined /> Cursos
          </button>
          <Button
            icon={<SaveOutlined />}
            loading={guardando}
            onClick={handleGuardarPlan}
            disabled={!planValido}
          >
            Guardar plan
          </Button>
          <Button type="primary" icon={<FormOutlined />} onClick={handleIrNotas}>
            Ir a registrar notas
          </Button>
        </>
      }
    />
  );

  return (
    <PageTemplate header={header}>
      {curso ? (
        <div className="cal-curso-resumen">
          <span>
            <strong>Materia:</strong> {curso.materia}
          </span>
          <span>
            <strong>Paralelo:</strong> {curso.paralelo}
            {curso.turnoParalelo ? ` (${curso.turnoParalelo})` : ''}
          </span>
          <span>
            <strong>Gestión:</strong> {curso.gestion || '—'}
          </span>
        </div>
      ) : null}

      {!planValido ? (
        <Alert
          type="warning"
          showIcon
          message="Revisá la ponderación"
          description="Los pesos del componente teórico y del práctico deben sumar 100 % cada uno, y las cuotas teórico + práctico deben sumar 100 puntos."
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {planListo ? (
        <Alert
          type="success"
          showIcon
          message="Plan guardado"
          description="Ya podés registrar notas en el formulario del curso."
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {error ? <Alert type="error" showIcon message={String(error)} style={{ marginBottom: 16 }} /> : null}

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

      <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
        Las evaluaciones de materia completa (proyecto final anual, examen final) se configuran en una
        etapa posterior y se persisten en evaluaciones_finales.
      </Text>
    </PageTemplate>
  );
};

export default CalificacionesPlanPage;
