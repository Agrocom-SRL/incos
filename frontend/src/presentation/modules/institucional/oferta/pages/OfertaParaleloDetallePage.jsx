import { Alert, Card, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, ScheduleOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allColors, allSpacing, componentConfig, shadows } from '@theme/tokens';
import { useOfertaParaleloDetalleState } from '@application-institucional/oferta';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import DocenteAsignacionCursoModal from '@institucional/horarios/components/organisms/DocenteAsignacionCursoModal';
import {
  OfertaParaleloAulaSelectModal,
  OfertaParaleloDetalleContextHeader,
  OfertaParaleloDetalleCursosSection,
} from '../components';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@institucional/horarios/styles/gestion-horarios-page.css';
import '../styles/oferta-academica-page.css';

const sectionCardProps = {
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
    backgroundColor: allColors.colorBgContainer,
  },
  styles: {
    body: { padding: `${componentConfig.Card.paddingLG}px` },
  },
};

const OfertaParaleloDetallePage = () => {
  const s = useOfertaParaleloDetalleState();
  const carga = s.cargaHorariaResumen;

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional' },
    { title: 'Oferta Académica', href: '/institucional/oferta' },
    { title: s.detalle?.paraleloNombre ?? `Paralelo #${s.paraleloGestionId}` },
  ];

  return (
    <Flex
      vertical
      gap="large"
      className="page-container oferta-paralelo-detalle-page"
      style={{ width: '100%' }}
    >
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex wrap="wrap" gap={allSpacing.marginSM}>
              <ActionButton
                permiso="institucional.oferta.paralelo-gestion"
                accion="DETALLE"
                variant="back"
                icon={<ArrowLeftOutlined />}
                onClick={s.navigateBack}
              >
                Volver
              </ActionButton>
              {s.puedeMarcarOfertado ? (
                <ActionButton
                  permiso="institucional.oferta.paralelo-gestion"
                  accion="EDITAR"
                  variant="primary"
                  onClick={s.onMarcarOfertado}
                >
                  Ofertar paralelo
                </ActionButton>
              ) : null}
              <ActionButton
                permiso="institucional.horario.armado"
                accion="LISTAR"
                variant="success"
                icon={<ScheduleOutlined />}
                onClick={s.navigateHorariosArmado}
              >
                Ver horario
              </ActionButton>
            </Flex>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.apiLoading} tip="Cargando paralelo…">
            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
              {s.apiError ? <Alert type="error" showIcon title={s.apiError} /> : null}

              {carga.materiasEsperadas > 0 && !carga.valido ? (
                <Alert
                  type="warning"
                  showIcon
                  title="Carga horaria del periodo incompleta"
                  description={
                    <>
                      El plan exige <strong>{carga.materiasEsperadas} materias</strong> (
                      {carga.horasPlan} h/sem) en este periodo. Ofertadas:{' '}
                      <strong>{carga.materiasOfertadas}</strong> ({carga.horasOfertadas} h/sem).
                      {carga.faltantes.length > 0
                        ? ` Faltan: ${carga.faltantes
                          .map((f) => f.materiaCodigo ?? f.materiaNombre)
                          .filter(Boolean)
                          .join(', ')}.`
                        : null}
                    </>
                  }
                />
              ) : null}

              {carga.valido && carga.horasPlan > 0 ? (
                <Alert
                  type="success"
                  showIcon
                  title="Carga horaria del periodo cubierta"
                  description={`${carga.materiasOfertadas} materias · ${carga.horasPlan} h/sem según plan de estudio.`}
                />
              ) : null}

              {s.detalle?.estado === 'BORRADOR' ? (
                <Alert
                  type="info"
                  showIcon
                  title="Siguiente paso: docentes y horarios"
                  description="Asigne docente a cada materia desde la tabla (modal). Ofertar el paralelo solo exige aula y oferta completa; los horarios se arman después en Gestión de horarios."
                />
              ) : null}

              <Card className="oferta-paralelo-detalle-workspace" {...sectionCardProps}>
                <Flex vertical gap={allSpacing.marginLG}>

                  <OfertaParaleloDetalleContextHeader
                    detalle={s.detalle}
                    puedeEditarAula={s.puedeEditarAula}
                    onAsignarAula={s.openAulaModal}
                  />

                  <OfertaParaleloDetalleCursosSection
                    ofertaCursos={s.ofertaCursos}
                    cargaHorariaResumen={carga}
                    faltantesDocenteIds={s.faltantesDocenteIds}
                    onAsignarDocente={s.openDocenteModal}
                  />
                </Flex>
              </Card>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>

      <OfertaParaleloAulaSelectModal
        open={s.aulaModalOpen}
        items={s.aulasModalItems}
        selectedId={s.aulaModalDraftId}
        onSelect={s.setAulaModalDraftId}
        onClose={s.closeAulaModal}
        onConfirm={s.onConfirmarAulaModal}
        confirming={s.guardandoAula}
      />

      {s.docenteModalOpen ? (
        <DocenteAsignacionCursoModal
          open={s.docenteModalOpen}
          onClose={s.closeDocenteModal}
          selectedCourse={s.docenteModalSelectedCourse}
          gestionId={s.detalle?.gestionId}
          paraleloLabel={s.docenteModalParaleloLabel}
          onAssigned={s.onDocenteAsignado}
        />
      ) : null}
    </Flex>
  );
};

export default OfertaParaleloDetallePage;
