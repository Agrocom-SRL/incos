/**
 * Cursos del docente agrupados por paralelo (tras elegir docente).
 */

import { Alert, Spin } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useCalificacionesCursosContext } from '@application-academico/calificaciones/hooks/context/useCalificacionesCursosContext';
import CalificacionesDocenteProfile from '../components/organisms/CalificacionesDocenteProfile.jsx';
import CalificacionesSectionCard from '../components/molecules/CalificacionesSectionCard.jsx';
import ParalelosCursosList from '../components/organisms/ParalelosCursosList.jsx';
import '../styles/calificaciones.css';
import '@presentation/styles/components/molecules/wizard-selection-cards.css';

const CalificacionesCursosPage = () => {
  const {
    loading,
    error,
    esDocente,
    docenteIdValido,
    docenteNombre,
    docenteTitulo,
    resumenDocente,
    gruposParalelo,
    breadcrumbItems,
    handleAbrirCurso,
    handleVolverSeleccion,
    refetch,
  } = useCalificacionesCursosContext();

  const header = (
    <PageHeader
      title={esDocente ? 'Mis cursos — Calificaciones' : 'Calificaciones por docente'}
      breadcrumbItems={breadcrumbItems}
      actions={
        <>
          {!esDocente ? (
            <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolverSeleccion}>
              <ArrowLeftOutlined /> Elegir docente
            </button>
          ) : null}
          <ActionButton
            permiso="academico.calificacion.curso"
            accion="LISTAR"
            icon={<ReloadOutlined />}
            onClick={() => refetch?.()}
            disabled={loading || !docenteIdValido}
          >
            Actualizar
          </ActionButton>
        </>
      }
    />
  );

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="sd">
        {docenteNombre ? (
          <CalificacionesDocenteProfile
            nombreCompleto={docenteNombre}
            subtitulo={docenteTitulo || 'Docente con asignación vigente'}
            totalCursos={resumenDocente?.totalCursos}
            totalParalelos={resumenDocente?.totalParalelos}
            planesListos={resumenDocente?.planesListos}
            planesPendientes={resumenDocente?.planesPendientes}
          />
        ) : null}

        <p className="cal-flow-lede">
          Elegí un curso para registrar notas o configurar el plan de evaluaciones (tipos, ponderación y fechas por
          bimestre). Los cursos con plan listo se resaltan en verde.
        </p>

        {error ? <Alert type="error" showIcon message={String(error)} style={{ marginBottom: 0 }} /> : null}

        <CalificacionesSectionCard
          title="Paralelos y materias"
          variant="cabecera"
          bodyClassName="cal-section__body--block"
        >
          {loading ? (
            <Spin size="large" style={{ display: 'block', margin: '3rem auto' }} />
          ) : (
            <ParalelosCursosList
              grupos={gruposParalelo}
              onRegistrarNotas={(id) => handleAbrirCurso(id, { irPlan: false })}
              onConfigurarPlan={(id) => handleAbrirCurso(id, { irPlan: true })}
            />
          )}
        </CalificacionesSectionCard>
      </div>
    </PageTemplate>
  );
};

export default CalificacionesCursosPage;
