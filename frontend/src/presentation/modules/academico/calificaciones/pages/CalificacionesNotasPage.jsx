/**
 * Registro de notas por curso y bimestre.
 */

import { Alert, Segmented, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useCalificacionesNotasContext } from '@application-academico/calificaciones/hooks/context/useCalificacionesNotasContext';
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
            <ArrowLeftOutlined /> Cursos
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
    <PageTemplate header={header}>
      {curso ? (
        <div className="cal-curso-resumen">
          <span>
            <strong>{curso.materia}</strong>
          </span>
          <span>
            Paralelo {curso.paralelo}
            {curso.turnoParalelo ? ` · ${curso.turnoParalelo}` : ''}
          </span>
          <span>{curso.gestion}</span>
        </div>
      ) : null}

      {!planListo ? (
        <Alert
          type="warning"
          showIcon
          message="Plan de calificaciones pendiente"
          description="Estás usando evaluaciones de demostración. Configurá el plan para alinear tipos, pesos y fechas con tu cronograma."
          action={
            <ActionButton
              permiso="academico.calificacion.periodo"
              accion="CREAR"
              size="small"
              onClick={handleIrPlan}
            >
              Configurar plan
            </ActionButton>
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <Alert
        type="info"
        showIcon
        message="Datos de demostración"
        description="Los estudiantes mostrados son de ejemplo hasta conectar matriculas_materia por asignación docente. Las notas se guardan en borrador local."
        style={{ marginBottom: 16 }}
      />

      {error ? <Alert type="error" showIcon message={String(error)} style={{ marginBottom: 16 }} /> : null}

      <div className="cal-notas-toolbar">
        <Segmented
          value={bimestreActivo}
          options={bimestres.map((b) => ({ value: b, label: `Bim. ${b}` }))}
          onChange={handleCambiarBimestre}
        />
      </div>

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
    </PageTemplate>
  );
};

export default CalificacionesNotasPage;
