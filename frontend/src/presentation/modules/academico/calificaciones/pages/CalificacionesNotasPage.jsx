/**
 * Registro de notas por curso y bimestre.
 */

import { Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useCalificacionesNotasContext } from '@application-academico/calificaciones/hooks/context/useCalificacionesNotasContext';
import CalificacionesAlertStrip from '../components/molecules/CalificacionesAlertStrip.jsx';
import CalificacionesBimestreTabs from '../components/molecules/CalificacionesBimestreTabs.jsx';
import CalificacionesCursoProfile from '../components/organisms/CalificacionesCursoProfile.jsx';
import RegistroNotasGrid from '../components/organisms/RegistroNotasGrid.jsx';
import '../styles/calificaciones.css';

const CalificacionesNotasPage = () => {
  const {
    curso,
    loading,
    error,
    planListo,
    bimestreActivo,
    bimestres,
    evaluacionesColumnas,
    estudiantes,
    getNota,
    handleNotaChange,
    handleCambiarBimestre,
    handleGuardar,
    guardando,
    breadcrumbItems,
    handleIrPlan,
    handleVolver,
    cuotas,
  } = useCalificacionesNotasContext();

  const header = (
    <PageHeader
      title="Registrar notas"
      breadcrumbItems={breadcrumbItems}
      actions={
        <>
          <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
            <ArrowLeftOutlined /> Volver a cursos
          </button>
          <ActionButton
            permiso="academico.calificacion.periodo"
            accion="CREAR"
            icon={<SettingOutlined />}
            onClick={handleIrPlan}
          >
            Plan de calificaciones
          </ActionButton>
          <ActionButton
            permiso="academico.calificacion.registrar.parcial"
            accion="CREAR"
            type="primary"
            icon={<SaveOutlined />}
            loading={guardando}
            onClick={handleGuardar}
          >
            Guardar borrador
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
            !planListo
              ? {
                  key: 'plan',
                  type: 'warning',
                  title: 'Plan de calificaciones pendiente',
                  description:
                    'Estás usando evaluaciones de demostración. Configurá el plan para alinear tipos, pesos y fechas con tu cronograma.',
                  action: (
                    <ActionButton
                      permiso="academico.calificacion.periodo"
                      accion="CREAR"
                      size="small"
                      onClick={handleIrPlan}
                    >
                      Configurar plan
                    </ActionButton>
                  ),
                }
              : null,
            {
              key: 'demo',
              type: 'info',
              title: 'Datos de demostración',
              description:
                'Los estudiantes mostrados son de ejemplo hasta conectar matriculas_materia por asignación docente. Las notas se guardan en borrador local.',
            },
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

        <CalificacionesBimestreTabs
          bimestres={bimestres}
          value={bimestreActivo}
          onChange={handleCambiarBimestre}
        />

        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '3rem auto' }} />
        ) : (
          <RegistroNotasGrid
            estudiantes={estudiantes}
            evaluacionesColumnas={evaluacionesColumnas}
            getNota={getNota}
            onNotaChange={handleNotaChange}
            cuotas={cuotas}
          />
        )}
      </div>
    </PageTemplate>
  );
};

export default CalificacionesNotasPage;
