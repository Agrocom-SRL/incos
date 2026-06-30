/**
 * MisDatosPage — variante del estudiante para el ítem de menú "Admisión".
 *
 * Patrón wrapper por rol (como el portal del estudiante): cuando entra un
 * ESTUDIANTE, en lugar de la lista admin de admisión se muestra SU ficha de
 * SOLO LECTURA, reutilizando el mismo organismo/hook que "Mi perfil"
 * (EstudianteFichaSection + useMisDatosEstudiante, GET /estudiantes/mis-datos).
 * Sin edición, sin PDF, sin acceso a otros estudiantes.
 */

import { useMemo } from 'react';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import EstudianteFichaSection from '@modules/perfil/components/organisms/EstudianteFichaSection.jsx';
import { useMisDatosEstudiante } from '@/application/modules/perfil/hooks/state/useMisDatosEstudiante.js';

export default function MisDatosPage() {
  const { misDatos, loadingMisDatos, errorMisDatos } = useMisDatosEstudiante(true);

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Matrícula' }, { title: 'Mis datos' }],
    [],
  );

  return (
    <PageTemplate header={<PageHeader title="Mis datos" breadcrumbItems={breadcrumbItems} />}>
      <EstudianteFichaSection
        misDatos={misDatos}
        loading={loadingMisDatos}
        error={errorMisDatos}
      />
    </PageTemplate>
  );
}
