/**
 * MiPasantiaPage — portal del estudiante (TIT-MI-PASANTIA, patrón Mi
 * proyecto). Presenta SU trámite compuesto (P19: pasantía + informes +
 * seguimientos) como ficha de detalle de SOLO LECTURA: cabecera de perfil
 * (sd-profile) + datos + empresa/supervisión + informes + seguimientos sin
 * acciones (el rol ESTUDIANTE solo tiene pasantia·DETALLE).
 *
 * El backend resuelve el estudiante por token; esta pantalla jamás envía
 * `estudianteId`. Si no hay trámite (`pasantia = null`) muestra el estado
 * vacío. Orquestación en `useMiPasantiaPage`.
 */

import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { DetailPageShell } from '@organisms';
import { useMiPasantiaPage } from '@application-titulacion/pasantias/hooks/state/useMiPasantiaPage';
import PasantiaFichaHeader from '@titulacion/pasantias/components/organisms/PasantiaFichaHeader';
import PasantiaDatosSection from '@titulacion/pasantias/components/organisms/PasantiaDatosSection';
import PasantiaEmpresaSection from '@titulacion/pasantias/components/organisms/PasantiaEmpresaSection';
import PasantiaInformesSection from '@titulacion/pasantias/components/organisms/PasantiaInformesSection';
import PasantiaSeguimientosSection from '@titulacion/pasantias/components/organisms/PasantiaSeguimientosSection';
import '@presentation/styles/pages/detail-page.css';

const MiPasantiaPage = () => {
  const { pasantia, informes, seguimientos, sinPasantia, loading, error, refetch, breadcrumbItems } =
    useMiPasantiaPage();

  return (
    <PageTemplate
      header={<PageHeader title="Mi pasantía" breadcrumbItems={breadcrumbItems} />}
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando su trámite…"
        error={error}
        onRetry={refetch}
        showEmpty={sinPasantia}
        emptyDescription="Aún no tiene un trámite de pasantía registrado. Consulte con la Dirección Académica de su carrera."
      >
        {pasantia ? (
          <>
            <PasantiaFichaHeader pasantia={pasantia} />

            <PasantiaDatosSection pasantia={pasantia} />

            <PasantiaEmpresaSection pasantia={pasantia} />

            <PasantiaInformesSection
              informes={informes}
              loading={false}
              error={null}
              readOnly
            />

            <PasantiaSeguimientosSection
              seguimientos={seguimientos}
              loading={false}
              error={null}
              readOnly
            />
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default MiPasantiaPage;
