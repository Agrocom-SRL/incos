/**
 * MiProyectoGradoPage — portal del estudiante (TUT-MI-PROYECTO, patrón Mi
 * boletín). Presenta SU proyecto como ficha de detalle: cabecera de perfil
 * (sd-profile) + datos + bitácora (con confirmación de entradas — firma de la
 * planilla, T17) + avances (subida PDF/Word T20 y descarga T21).
 *
 * El backend resuelve el estudiante por token; esta pantalla jamás envía
 * `estudianteId`. Orquestación en `useMiProyectoGradoPage`.
 */

import { Empty, Table } from 'antd';
import { FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard } from '@molecules';
import { ActionButton } from '@atoms';
import { DetailPageShell } from '@organisms';
import { useMiProyectoGradoPage } from '@application-tutorias/titulacion/hooks/state/useMiProyectoGradoPage';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import { createBitacoraTableColumns } from '@tutorias/titulacion/config/bitacoraTableColumns';
import ProyectoGradoFichaHeader from '@tutorias/titulacion/components/organisms/ProyectoGradoFichaHeader';
import ProyectoDatosSection from '@tutorias/titulacion/components/organisms/ProyectoDatosSection';
import ProyectoAvancesSection from '@tutorias/titulacion/components/organisms/ProyectoAvancesSection';
import SubirAvanceModal from '@tutorias/titulacion/components/modals/SubirAvanceModal';
import '@presentation/styles/pages/detail-page.css';

const MiProyectoGradoPage = () => {
  const {
    proyecto,
    sinProyecto,
    loading,
    error,
    refetch,
    breadcrumbItems,
    avances,
    loadingAvances,
    descargandoId,
    subiendoAvance,
    uploadOpen,
    setUploadOpen,
    handleSubirAvance,
    handleDescargarAvance,
    bitacoraEntradas,
    loadingBitacora,
    confirmandoId,
    handleConfirmarEntrada,
  } = useMiProyectoGradoPage();

  // Bitácora en modo estudiante: sin edición, con acción "Confirmar" (firma).
  const bitacoraColumns = createBitacoraTableColumns({
    modoEstudiante: true,
    onConfirmar: handleConfirmarEntrada,
    confirmandoId,
  });

  const subirAvanceAction = proyecto ? (
    <ActionButton
      permiso={TUTORIAS_PERMISOS.avance}
      accion="CREAR"
      variant="primary"
      icon={<UploadOutlined />}
      onClick={() => setUploadOpen(true)}
    >
      Subir avance
    </ActionButton>
  ) : null;

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Mi proyecto de grado"
          breadcrumbItems={breadcrumbItems}
          actions={subirAvanceAction}
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando su proyecto…"
        error={error}
        onRetry={refetch}
        showEmpty={sinProyecto}
        emptyDescription="Aún no tiene un proyecto de grado registrado. Consulte con la Dirección Académica de su carrera."
      >
        {proyecto ? (
          <>
            <ProyectoGradoFichaHeader proyecto={proyecto} />

            <ProyectoDatosSection proyecto={proyecto} />

            <div className="sd-tab-body">
              <DetailInfoCard
                title={`Bitácora de tutoría (${bitacoraEntradas.length})`}
                icon={<FileTextOutlined />}
                cols={1}
              >
                {bitacoraEntradas.length === 0 && !loadingBitacora ? (
                  <Empty description="Su tutor aún no registró entradas de bitácora." />
                ) : (
                  <Table
                    dataSource={bitacoraEntradas}
                    columns={bitacoraColumns}
                    rowKey={(record) => record.id}
                    size="small"
                    loading={loadingBitacora}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                  />
                )}
              </DetailInfoCard>
            </div>

            <ProyectoAvancesSection
              avances={avances}
              loading={loadingAvances}
              error={null}
              descargandoId={descargandoId}
              onDescargar={handleDescargarAvance}
              emptyText="Aún no subió avances. Use el botón «Subir avance» para enviar su primer archivo."
            />
          </>
        ) : null}
      </DetailPageShell>

      <SubirAvanceModal
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onSubmit={handleSubirAvance}
        subiendo={subiendoAvance}
      />
    </PageTemplate>
  );
};

export default MiProyectoGradoPage;
