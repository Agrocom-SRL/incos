/**
 * Ficha (detalle) de una actividad del calendario — patrón ficha INCOS
 * (PageHeader + Spin/Alert + DetailInfoCard/DetailField). Permiso DETALLE.
 */

import { Alert, Flex, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { DashboardPageShell } from '@dashboard/components/organisms';
import { PageHeader, DetailInfoCard } from '@molecules';
import { ActionButton, BackButton, DetailField, StatusPill } from '@atoms';
import { useCronogramaActividadDetail } from '@application-institucional/actual';
import {
  getActividadTipoLabel,
  getActividadTipoTextClass,
  getActividadEstadoLabel,
  getActividadEstadoPillClass,
} from '@application-institucional/actual/config/actividadPill.js';
import CronogramaEtapaCell from '@institucional/actual/components/atoms/CronogramaEtapaCell';
import CronogramaDuracionCell from '@institucional/actual/components/atoms/CronogramaDuracionCell';
import '@presentation/styles/pages/detail-page.css';
import '@institucional/actual/styles/cronograma.css';

const PERMISO = 'institucional.gestion.cronograma';

const CronogramaActividadDetailPage = () => {
  const s = useCronogramaActividadDetail();
  const a = s.actividad;

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={
            <Flex gap="small" wrap>
              <BackButton icon={<ArrowLeftOutlined />} onClick={s.handleVolver}>
                Volver
              </BackButton>
              <ActionButton
                permiso={PERMISO}
                accion="EDITAR"
                variant="warning"
                icon={<EditOutlined />}
                onClick={s.goToEditar}
              >
                Editar
              </ActionButton>
            </Flex>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.loading} tip="Cargando actividad…">
            {s.error ? (
              <Alert type="error" showIcon title={s.error} />
            ) : a ? (
              <DetailInfoCard title={a.nombre} icon={<CalendarOutlined />} cols={2}>
                <DetailField label="Código">{a.codigo || '—'}</DetailField>
                <DetailField label="Etapa / periodo">
                  <CronogramaEtapaCell nombre={a.periodoNombre} colorHex={a.periodoColor} />
                </DetailField>
                <DetailField label="Tipo">
                  <span className={`cronograma-actividad-cell__tipo ${getActividadTipoTextClass(a.tipo)}`}>
                    <span className="cronograma-actividad-cell__dot" aria-hidden />
                    {getActividadTipoLabel(a.tipo)}
                  </span>
                </DetailField>
                <DetailField label="Estado">
                  <StatusPill
                    label={getActividadEstadoLabel(a.estado)}
                    className={getActividadEstadoPillClass(a.estado)}
                  />
                </DetailField>
                <DetailField label="Origen del nombre">
                  {a.nombrePersonalizado
                    ? `Personalizado (catálogo: ${a.catalogoNombre || '—'})`
                    : `Catálogo maestro${a.catalogoNombre ? `: ${a.catalogoNombre}` : ''}`}
                </DetailField>
                <DetailField label="Destacada">{a.esDestacada ? 'Sí' : 'No'}</DetailField>
                <DetailField label="Duración" span={2}>
                  <CronogramaDuracionCell fechaInicio={a.fechaInicio} fechaFin={a.fechaFin} />
                </DetailField>
              </DetailInfoCard>
            ) : null}
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CronogramaActividadDetailPage;
