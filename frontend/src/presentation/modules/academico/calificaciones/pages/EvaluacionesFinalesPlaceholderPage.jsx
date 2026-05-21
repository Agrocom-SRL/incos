import { useParams } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import CursoSeccionPlaceholder from '../components/CursoSeccionPlaceholder.jsx';
import '../styles/calificaciones.css';

const EvaluacionesFinalesPlaceholderPage = () => {
  const { docenteId, asignacionId } = useParams();
  const breadcrumbItems = createBreadcrumbItems('ACA-CAL-CUADERNO', 'ACA-CAL', 'Evaluaciones finales');

  return (
    <PageTemplate
      header={
        <PageHeader title="Evaluaciones finales" breadcrumbItems={breadcrumbItems} />
      }
      sidebar={null}
    >
      <CursoSeccionPlaceholder
        docenteId={docenteId}
        asignacionId={asignacionId}
        titulo="Evaluaciones finales"
      />
    </PageTemplate>
  );
};

export default EvaluacionesFinalesPlaceholderPage;
