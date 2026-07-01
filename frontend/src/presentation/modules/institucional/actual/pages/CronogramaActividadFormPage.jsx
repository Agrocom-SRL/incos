/**
 * Form-page de una actividad de calendario — mismo shell visual que los ABM de
 * CFG Académico (workspace + grid). Selección de actividad por modal de búsqueda.
 */

import { Alert, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import DashboardPageShell from '@dashboard/components/organisms/DashboardPageShell';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import { useCronogramaActividadForm } from '@application-institucional/actual';
import CronogramaActividadFormSections from '@institucional/actual/components/organisms/CronogramaActividadFormSections';
import CronogramaActividadSelectorModal from '@institucional/actual/components/organisms/CronogramaActividadSelectorModal';
import '@configuracion/academico/styles/academico-form-page.css';
import '@institucional/actual/styles/cronograma.css';

const PERMISO = 'institucional.gestion.cronograma';

const CronogramaActividadFormPage = ({ mode = 'create' }) => {
  const s = useCronogramaActividadForm(mode);

  const saveButton = (
    <ActionButton
      permiso={PERMISO}
      accion={s.permisoAccion}
      variant="primary"
      size="large"
      loading={s.saving}
      onClick={s.handleSubmit}
    >
      {s.isEdit ? 'Guardar cambios' : 'Crear actividad'}
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={s.handleVolver}>
              Volver
            </BackButton>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.loading} tip="Cargando…">
            <Flex vertical gap="middle" className="cfg-academico-page__stack">
              {s.error ? <Alert type="error" showIcon title={s.error} /> : null}

              <Form form={s.form} layout="vertical" disabled={s.loading || s.saving}>
                <CronogramaActividadFormSections
                  periodos={s.periodos}
                  actividadId={s.actividadId}
                  selectedActividad={s.selectedActividad}
                  onOpenSelector={s.openSelector}
                  onClearActividad={s.handleClearActividad}
                  sobrescribirNombre={s.sobrescribirNombre}
                  onToggleSobrescribir={s.toggleSobrescribir}
                  eventoUnDia={s.eventoUnDia}
                  onToggleEventoUnDia={s.toggleEventoUnDia}
                  disabled={s.loading || s.saving}
                  footer={saveButton}
                />
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>

      <CronogramaActividadSelectorModal
        open={s.modalOpen}
        onClose={s.closeSelector}
        catalogo={s.catalogo}
        usadas={s.actividadesUsadas}
        selectedId={s.actividadId}
        onSelect={s.handleSelectActividad}
      />
    </Flex>
  );
};

export default CronogramaActividadFormPage;
