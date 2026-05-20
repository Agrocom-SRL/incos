/**
 * Entrada del módulo: cursos del docente agrupados por paralelo (sin índice intermedio).
 */

import { Alert, InputNumber, Spin, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useCalificacionesCursosContext } from '@application-academico/calificaciones/hooks/context/useCalificacionesCursosContext';
import ParalelosCursosList from '../components/organisms/ParalelosCursosList.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';

const { Paragraph } = Typography;

const CalificacionesCursosPage = () => {
  const {
    loading,
    error,
    esDocente,
    necesitaSeleccionDocente,
    docenteNombre,
    gruposParalelo,
    breadcrumbItems,
    handleAbrirCurso,
    setDocenteIdOverride,
    refetch,
  } = useCalificacionesCursosContext();

  const header = (
    <PageHeader
      title="Mis cursos — Calificaciones"
      breadcrumbItems={breadcrumbItems}
      actions={
        <ActionButton
          permiso="academico.calificacion.curso"
          accion="LISTAR"
          icon={<ReloadOutlined />}
          onClick={() => refetch?.()}
          disabled={loading}
        >
          Actualizar
        </ActionButton>
      }
    />
  );

  return (
    <PageTemplate header={header}>
      <Paragraph className="cal-cursos-intro">
        Elegí un curso de tu paralelo para registrar notas. Si aún no definiste el plan de
        evaluaciones (tipos, pesos y fechas), podés configurarlo antes desde la misma tarjeta.
      </Paragraph>

      {necesitaSeleccionDocente ? (
        <Alert
          type="info"
          showIcon
          message="Vista administrativa"
          description={
            <span>
              Ingresá el ID del docente para ver sus cursos asignados (cuenta sin vínculo DOCENTE).
              <div style={{ marginTop: 12, maxWidth: 200 }}>
                <InputNumber
                  min={1}
                  placeholder="docente_id"
                  style={{ width: '100%' }}
                  onChange={(v) => v && setDocenteIdOverride(Number(v))}
                />
              </div>
            </span>
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {esDocente && docenteNombre ? (
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          Docente: {docenteNombre}
        </Paragraph>
      ) : null}

      {error ? (
        <Alert type="error" showIcon message={String(error)} style={{ marginBottom: 16 }} />
      ) : null}

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '3rem auto' }} />
      ) : (
        <ParalelosCursosList
          grupos={gruposParalelo}
          onRegistrarNotas={(id) => handleAbrirCurso(id, { irPlan: false })}
          onConfigurarPlan={(id) => handleAbrirCurso(id, { irPlan: true })}
        />
      )}
    </PageTemplate>
  );
};

export default CalificacionesCursosPage;
