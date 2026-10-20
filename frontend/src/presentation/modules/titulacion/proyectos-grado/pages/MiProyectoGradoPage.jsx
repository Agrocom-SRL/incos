/**
 * MiProyectoGradoPage — portal del estudiante (TIT-MI-PROYECTO, patrón Mi
 * boletín). Presenta SU proyecto como ficha de detalle: cabecera de perfil
 * (sd-profile) + datos + bitácora (con confirmación de entradas — firma de la
 * planilla, T17) + avances (subida PDF/Word T20 y descarga T21).
 *
 * Sin proyecto registrado (Fase B3, extensión 2026-08-17): en vez del
 * `Empty` informativo se ofrece "Registrar mi modalidad de grado"
 * (autorregistro individual, excluye la modalidad grupal PSP del catálogo).
 * El backend valida el prerrequisito (3er año, sin pendientes de 1º/2º) — el
 * error 409 se muestra tal cual, sin duplicar esa regla en frontend.
 *
 * El backend resuelve el estudiante por token; esta pantalla jamás envía
 * `estudianteId`. Orquestación en `useMiProyectoGradoPage`.
 */

import { Empty, Flex, Form, Input, Select, Table, Typography } from 'antd';
import { FilePdfOutlined, FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard } from '@molecules';
import { ActionButton } from '@atoms';
import { DetailPageShell } from '@organisms';
import { useMiProyectoGradoPage } from '@application-titulacion/proyectos-grado/hooks/state/useMiProyectoGradoPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { createBitacoraTableColumns } from '@titulacion/proyectos-grado/config/bitacoraTableColumns';
import ProyectoGradoFichaHeader from '@titulacion/proyectos-grado/components/organisms/ProyectoGradoFichaHeader';
import ProyectoDatosSection from '@titulacion/proyectos-grado/components/organisms/ProyectoDatosSection';
import ProyectoAvancesSection from '@titulacion/proyectos-grado/components/organisms/ProyectoAvancesSection';
import ProyectoActaDefensaSection from '@titulacion/proyectos-grado/components/organisms/ProyectoActaDefensaSection';
import SubirAvanceModal from '@titulacion/proyectos-grado/components/modals/SubirAvanceModal';
import '@presentation/styles/pages/detail-page.css';

const { Paragraph } = Typography;

/** Formulario de autorregistro, mostrado cuando el estudiante aún no tiene proyecto. */
const RegistrarModalidadForm = ({ registro }) => (
  <div className="sd-tab-body" style={{ maxWidth: 560 }}>
    <Paragraph type="secondary">
      Aún no tiene un proyecto de grado registrado. Si cumple los requisitos académicos, puede
      registrar aquí su modalidad de graduación.
    </Paragraph>
    <Form form={registro.form} layout="vertical" onFinish={registro.submit}>
      <Form.Item
        name="titulo"
        label="Título del proyecto"
        rules={[
          { required: true, message: 'Indique el título de su proyecto' },
          { min: 5, message: 'El título debe tener al menos 5 caracteres' },
          { max: 500, message: 'El título no puede superar los 500 caracteres' },
        ]}
      >
        <Input placeholder="Título de su proyecto de grado" maxLength={500} />
      </Form.Item>
      <Form.Item name="objetivos" label="Objetivos (opcional)">
        <Input.TextArea rows={3} maxLength={2000} placeholder="Objetivos generales de su proyecto" />
      </Form.Item>
      <Form.Item
        name="modalidadId"
        label="Modalidad de graduación"
        rules={[{ required: true, message: 'Seleccione la modalidad de graduación' }]}
      >
        <Select
          options={registro.modalidadOptions}
          loading={registro.loadingModalidades}
          placeholder="Seleccione una modalidad"
        />
      </Form.Item>
      <ActionButton
        permiso={TITULACION_PERMISOS.proyecto}
        accion="CREAR"
        variant="primary"
        htmlType="submit"
        loading={registro.registrando}
      >
        Registrar mi modalidad de grado
      </ActionButton>
    </Form>
  </div>
);

/** Estado terminal: sin más actividad sobre el proyecto (mismo criterio que la ficha del tutor/admin). */
const ESTADO_PROYECTO_CANCELADO = 'CANCELADO';

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
    registro,
    formularioModalidad,
    actaDefensa,
  } = useMiProyectoGradoPage();

  const estaCancelado = proyecto?.estado === ESTADO_PROYECTO_CANCELADO;

  // Bitácora en modo estudiante: sin edición, con acción "Confirmar" (firma).
  // Un proyecto CANCELADO no admite más firmas (mismo criterio que la ficha).
  const bitacoraColumns = createBitacoraTableColumns({
    modoEstudiante: true,
    onConfirmar: estaCancelado ? null : handleConfirmarEntrada,
    confirmandoId,
  });

  const headerActions =
    proyecto && !estaCancelado ? (
      <Flex gap="small" wrap>
        <ActionButton
          permiso={TITULACION_PERMISOS.proyecto}
          accion="EXPORTAR"
          variant="info"
          icon={<FilePdfOutlined />}
          loading={formularioModalidad.descargando}
          onClick={formularioModalidad.exportar}
        >
          Descargar formulario FMDG-1
        </ActionButton>
        <ActionButton
          permiso={TITULACION_PERMISOS.avance}
          accion="CREAR"
          variant="primary"
          icon={<UploadOutlined />}
          onClick={() => setUploadOpen(true)}
        >
          Subir avance
        </ActionButton>
      </Flex>
    ) : null;

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Mi proyecto de grado"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
    >
      <DetailPageShell loading={loading} loadingTip="Cargando su proyecto…" error={error} onRetry={refetch}>
        {proyecto ? (
          <>
            <ProyectoGradoFichaHeader proyecto={proyecto} />

            <ProyectoDatosSection proyecto={proyecto} />

            <div className="sd-tab-body">
              <DetailInfoCard
                title={`Cronograma de progreso (${bitacoraEntradas.length})`}
                icon={<FileTextOutlined />}
                cols={1}
              >
                {bitacoraEntradas.length === 0 && !loadingBitacora ? (
                  <Empty description="Su tutor aún no registró entradas de cronograma de progreso." />
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

            {/* Acta de defensa (D5): solo lectura — sin registrar ni exportar PDF (P7). */}
            <ProyectoActaDefensaSection
              proyecto={proyecto}
              actas={actaDefensa.items}
              loading={actaDefensa.loading}
              error={actaDefensa.error}
              puedeRegistrar={false}
            />
          </>
        ) : sinProyecto ? (
          <RegistrarModalidadForm registro={registro} />
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
