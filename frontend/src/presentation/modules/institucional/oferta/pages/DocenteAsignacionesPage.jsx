/**
 * Asignaciones del docente (Oferta académica): horario semanal + color/carga.
 */
import { useMemo } from 'react';
import { Alert, Spin, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, ListPanelHeader } from '@molecules';
import { useDocenteAsignacionesState } from '@application-institucional/oferta/hooks/state/useDocenteAsignacionesState';
import {
  DOCENTE_ASIGNACIONES_TABS,
} from '@application-institucional/oferta/config/paths';
import { DOCENTE_ASIGNACIONES_TAB_PANEL_META } from '@application-institucional/oferta/config/docenteAsignacionesTabPanels';
import DocenteAsignacionesHorarioTabSection from '../components/organisms/DocenteAsignacionesHorarioTabSection';
import DocenteAsignacionesResumenTable from '../components/organisms/DocenteAsignacionesResumenTable';
import '@configuracion/academico/styles/academico-form-page.css';
import '@presentation/styles/pages/detail-page.css';
import '@institucional/horarios/styles/gestion-horarios-page.css';
import '../styles/oferta-academica-page.css';

const { Paragraph } = Typography;

const wrapTabPanel = (node) => (
  <div className="cfg-academico-tab-panel horarios-conflictos-tab-panel">{node}</div>
);

const DocenteAsignacionesPage = () => {
  const s = useDocenteAsignacionesState();
  const activePanel = DOCENTE_ASIGNACIONES_TAB_PANEL_META[s.tab];

  const workspaceDescription = useMemo(() => {
    const partes = [`Docente: ${s.docenteNombre}`];
    if (s.gestionLabel) {
      partes.push(`Gestión: ${s.gestionLabel}`);
    }
    if (activePanel?.description) {
      partes.push(activePanel.description);
    }
    return partes.filter(Boolean).join(' · ');
  }, [s.docenteNombre, s.gestionLabel, activePanel?.description]);

  const tabItems = useMemo(() => {
    const horarioMeta = DOCENTE_ASIGNACIONES_TAB_PANEL_META[DOCENTE_ASIGNACIONES_TABS.HORARIO];
    const colorMeta = DOCENTE_ASIGNACIONES_TAB_PANEL_META[DOCENTE_ASIGNACIONES_TABS.COLOR];
    const HorarioIcon = horarioMeta.icon;
    const ColorIcon = colorMeta.icon;

    return [
      {
        key: DOCENTE_ASIGNACIONES_TABS.COLOR,
        label: (
          <span className="sd-tab-label">
            <ColorIcon className="horarios-armado-tab__icon" aria-hidden />
            <span>{colorMeta.shortLabel}</span>
          </span>
        ),
        children: wrapTabPanel(
          <DocenteAsignacionesResumenTable
            tabla={s.tablaAsignaciones}
            gestionLabel={s.gestionLabel}
          />,
        ),
      },
      {
        key: DOCENTE_ASIGNACIONES_TABS.HORARIO,
        label: (
          <span className="sd-tab-label">
            <HorarioIcon className="horarios-armado-tab__icon" aria-hidden />
            <span>{horarioMeta.shortLabel}</span>
          </span>
        ),
        children: wrapTabPanel(
          <DocenteAsignacionesHorarioTabSection
            form={s.form}
            savingColor={s.savingColor}
            onSaveColor={s.handleGuardarColor}
            schedules={s.schedules}
            horarioSlotIndex={s.horarioSlotIndex}
            turnoLabel={s.turnoEfectivo}
          />,
        ),
      },
    ];
  }, [
    s.schedules,
    s.horarioSlotIndex,
    s.turnoEfectivo,
    s.form,
    s.savingColor,
    s.handleGuardarColor,
    s.tablaAsignaciones,
    s.gestionLabel,
  ]);

  const headerActions = (
    <button type="button" className="sd-btn sd-btn--outline" onClick={s.handleVolver}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  return (
    <PageTemplate
      header={
        <PageHeader title={s.pageTitle} breadcrumbItems={s.breadcrumbItems} actions={headerActions} />
      }
      sidebar={null}
    >
      <Spin spinning={s.loading} size="large" tip="Cargando asignaciones del docente…">
        <div className="sd sd-spin-body docente-asignaciones-page">
          {s.error ? (
            <Alert type="error" showIcon title={s.error} style={{ marginBottom: 16 }} />
          ) : null}

          {s.validDocenteId ? (
            <section className="cfg-academico-workspace horarios-conflictos-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title={activePanel?.title ?? 'Asignaciones del docente'} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  {workspaceDescription}
                </Paragraph>
              </header>

              <div className="sd-tabs-shell cfg-academico-tabs-shell">
                <Tabs
                  className="sd-tabs cfg-academico-workspace__tabs horarios-conflictos-workspace__tabs"
                  activeKey={s.tab}
                  onChange={s.onTabChange}
                  items={tabItems}
                  destroyOnHidden={false}
                />
              </div>
            </section>
          ) : null}
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default DocenteAsignacionesPage;
