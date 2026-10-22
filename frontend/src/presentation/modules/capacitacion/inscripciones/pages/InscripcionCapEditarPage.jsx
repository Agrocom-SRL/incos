/**
 * Editar inscripción de capacitación (CAP · inscripcion EDITAR) — página completa con las
 * mismas secciones del formulario de alta (`FormWorkspaceSection`): Participante y Curso
 * en SOLO LECTURA (no se pueden cambiar en una inscripción existente) y Grupo con las
 * tarjetas seleccionables del alta, la única parte editable.
 *
 * Página "dumb": la orquestación vive en `useInscripcionCapEditarPage`.
 */

import { Alert, Empty, Flex, Form, Spin, Tooltip } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, DetailField } from '@atoms';
import { FormWorkspaceSection } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useInscripcionCapEditarPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionCapEditarPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import {
  formatEstadoCurso,
  formatEstadoInscripcionCap,
} from '@application-capacitacion/utils/capacitacionPills';
import InscripcionFichaHeader from '@capacitacion/inscripciones/components/organisms/InscripcionFichaHeader';
import InscribirParticipanteSeccionGrupo from '@capacitacion/inscripciones/components/organisms/InscribirParticipanteSeccionGrupo';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const InscripcionCapEditarPage = () => {
  const [form] = Form.useForm(); // las secciones del alta lo exigen; aquí no hay campos que enviar
  const {
    inscripcion,
    loading,
    error,
    isInvalidInscripcionId,
    breadcrumbItems,
    handleVolver,
    handleGuardar,
    guardando,
    grupos,
    grupoId,
    handleGrupoChange,
    grupoMotivoDeshabilitado,
    hayCambios,
    loadingGrupos,
    errorGrupos,
  } = useInscripcionCapEditarPage();

  const backAction = (
    <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
      Volver
    </BackButton>
  );

  const guardar = (
    <Tooltip title={grupoMotivoDeshabilitado}>
      <span>
        <ActionButton
          permiso={CAPACITACION_PERMISOS.inscripcion}
          accion="EDITAR"
          variant="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={guardando}
          disabled={Boolean(grupoMotivoDeshabilitado) || !hayCambios}
          onClick={handleGuardar}
        >
          Guardar cambios
        </ActionButton>
      </span>
    </Tooltip>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Editar inscripción" breadcrumbItems={breadcrumbItems} actions={backAction} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={loading} tip="Cargando inscripción…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {isInvalidInscripcionId ? (
                <Alert type="error" showIcon title="Identificador de inscripción inválido" />
              ) : null}
              {error ? <Alert type="error" showIcon title={error} /> : null}
              {!loading && !error && !inscripcion && !isInvalidInscripcionId ? (
                <Empty description="No se encontró la inscripción solicitada." />
              ) : null}

              {!loading && inscripcion ? (
                <Form form={form} layout="vertical" className="cfg-academico-form" disabled={guardando}>
                  <section className="sd inscripcion-cap-ficha" aria-label="Datos de la inscripción">
                    <InscripcionFichaHeader inscripcion={inscripcion} />
                  </section>

                  <Alert
                    type="info"
                    showIcon
                    title="Solo se puede cambiar el grupo"
                    description="El participante y el curso no se modifican en una inscripción existente. Si el curso es otro, anule esta inscripción y registre una nueva."
                  />

                  <FormWorkspaceSection
                    form={form}
                    title="Participante"
                    description="No se puede cambiar en la edición."
                  >
                    <div className="sd">
                      <div className="sd-card__body sd-card__body--cols-3">
                        <DetailField label="Nombre completo">
                          {inscripcion.participanteNombreCompleto}
                        </DetailField>
                        <DetailField label="C.I.">{inscripcion.participanteCiCompleto || '—'}</DetailField>
                        <DetailField label="Celular">{inscripcion.participanteCelular || '—'}</DetailField>
                        <DetailField label="Correo">{inscripcion.participanteEmail || '—'}</DetailField>
                        <DetailField label="Fecha de inscripción">
                          {inscripcion.fechaInscripcionLabel || '—'}
                        </DetailField>
                        <DetailField label="Estado">
                          {formatEstadoInscripcionCap(inscripcion.estado)}
                        </DetailField>
                      </div>
                    </div>
                  </FormWorkspaceSection>

                  <FormWorkspaceSection form={form} title="Curso" description="No se puede cambiar en la edición.">
                    <div className="sd">
                      <div className="sd-card__body sd-card__body--cols-3">
                        <DetailField label="Curso">{inscripcion.capacitacionTitulo}</DetailField>
                        <DetailField label="Estado del curso">
                          {formatEstadoCurso(inscripcion.capacitacionEstado)}
                        </DetailField>
                        <DetailField label="Fechas">{inscripcion.capacitacionFechasLabel || '—'}</DetailField>
                      </div>
                    </div>
                  </FormWorkspaceSection>

                  <InscribirParticipanteSeccionGrupo
                    form={form}
                    section={{
                      title: 'Grupo',
                      description: grupoMotivoDeshabilitado || 'Elija el nuevo grupo del participante.',
                    }}
                    loading={loadingGrupos}
                    error={errorGrupos}
                    grupos={grupos}
                    capacitacionGrupoId={grupoId}
                    onGrupoChange={grupoMotivoDeshabilitado ? undefined : handleGrupoChange}
                  />

                  <Flex justify="flex-end">{guardar}</Flex>
                </Form>
              ) : null}
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default InscripcionCapEditarPage;
