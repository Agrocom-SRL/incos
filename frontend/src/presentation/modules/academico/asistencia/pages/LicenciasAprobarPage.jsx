/**
 * Bandeja de licencias pendientes de aprobación (ACA-ASI-LIC-APR · APROBAR).
 * Wrapper delgado del organismo LicenciasTableView con el estado fijado a PENDIENTE
 * (lo fija LicenciasProvider con estadoFijo en el connector). Sin filtro de estado ni CTA de solicitud.
 */

import { useMemo } from 'react';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { LICENCIA_APROBAR_PATH } from '@application-academico/asistencia/utils/asistenciaPaths.js';
import LicenciasTableView from '@academico/asistencia/components/LicenciasTableView.jsx';

const LicenciasAprobarPage = () => {
  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-ASI-LIC-APR', 'ACA-ASI', null),
    [],
  );

  return (
    <LicenciasTableView
      title="Licencias pendientes de aprobación"
      breadcrumbItems={breadcrumbItems}
      descripcion="Bandeja de solicitudes pendientes. Revisá cada licencia y aprobala o rechazala (al rechazar, el motivo es obligatorio)."
      returnListPath={LICENCIA_APROBAR_PATH}
      mostrarFiltroEstado={false}
    />
  );
};

export default LicenciasAprobarPage;
