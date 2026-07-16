/**
 * P1 del Centralizador — grilla de paralelos del instituto en gestión vigente.
 *
 * Menú propio (hermano de Calificaciones). El centralizador se arma por
 * PARALELO: aquí se elige uno y se navega a sus bimestres (P2). Reusa el shell
 * de tarjetas de cursos (CursosDocenteView) con tarjetas de paralelo.
 */

import { useNavigate } from 'react-router-dom';
import CursosDocenteView from '@organisms/CursosDocenteView';
import { useParalelosCentralizador } from '@application-academico/centralizador/hooks/useParalelosCentralizador.js';
import { centralizadorParaleloPath } from '@application-academico/centralizador/utils/centralizadorPaths.js';
import ParaleloCentralizadorCard from '../components/ParaleloCentralizadorCard.jsx';
import CentralizadorExportSection from '../components/CentralizadorExportSection.jsx';
import '../styles/centralizador.css';

const CentralizadorPage = () => {
  const navigate = useNavigate();
  const { paralelos, isLoading, error, refetch, breadcrumbItems } = useParalelosCentralizador();

  return (
    <CursosDocenteView
      title="Centralizador de calificaciones"
      breadcrumbItems={breadcrumbItems}
      cursos={paralelos}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
      infoTitle="Centralizador por paralelo"
      infoDescription={
        <span>
          Elija un paralelo en gestión vigente para ver el centralizador de
          calificaciones. El centralizador se arma por paralelo: cada asignatura
          es una columna de la matriz.
        </span>
      }
      emptyTitle="No hay paralelos en gestión vigente."
      panelTitle="Paralelos en gestión"
      skeletonCount={6}
      topContent={<CentralizadorExportSection paralelos={paralelos} />}
      renderCard={(paralelo) => (
        <ParaleloCentralizadorCard
          key={paralelo.paraleloGestionId}
          paralelo={paralelo}
          onAbrir={(p) => navigate(centralizadorParaleloPath(p.paraleloGestionId))}
        />
      )}
    />
  );
};

export default CentralizadorPage;
