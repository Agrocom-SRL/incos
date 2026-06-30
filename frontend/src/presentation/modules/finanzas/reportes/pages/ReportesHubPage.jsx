/**
 * Índice (hub) del ítem de menú "Reportes de pagos" (Finanzas · FIN-REP).
 *
 * Página landing del menú: muestra una tarjeta por reporte disponible y enlaza a
 * cada uno. Cada tarjeta se envuelve en PermisoGuard (LISTAR) → solo se ve si el
 * rol tiene permiso. Los reportes aún no implementados se muestran "En construcción"
 * (no navegables). Mismo shell visual que las páginas de reportes (PageTemplate +
 * PageHeader con breadcrumb + section.cfg-academico-workspace).
 *
 * Página "dumb": no hace fetch ni orquesta; solo compone y navega.
 */

import { useMemo } from 'react';
import { Flex, Typography } from 'antd';
import {
  BankOutlined,
  IdcardOutlined,
  CalendarOutlined,
  WalletOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import { allSpacing } from '@theme/tokens';
import ReporteHubCard from '@finanzas/reportes/components/molecules/ReporteHubCard';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/reportes/styles/reportes-hub.css';

const { Paragraph } = Typography;

/** Catálogo de reportes del hub (orden de negocio). */
const REPORTES = [
  {
    key: 'cuentas-por-cobrar',
    title: 'Cuentas por cobrar',
    description: 'Saldos pendientes por carrera y paralelo, con días de atraso y estado de cobranza.',
    icon: <WalletOutlined />,
    path: '/finanzas/reportes/cuentas-por-cobrar',
    permiso: FINANZAS_PERMISOS.cuentaCobrarReporte,
    disponible: true,
  },
  {
    key: 'becas',
    title: 'Becas por carrera',
    description: 'Distribución de becas y descuentos aplicados por carrera en la gestión vigente.',
    icon: <TrophyOutlined />,
    path: '/finanzas/reportes/becas',
    permiso: FINANZAS_PERMISOS.becaReporte,
    disponible: true,
  },
  {
    key: 'carrera',
    title: 'Reporte por carrera',
    description: 'Recaudación y estado de aportes agregados por carrera.',
    icon: <BankOutlined />,
    path: '/finanzas/reportes/carrera',
    permiso: FINANZAS_PERMISOS.reporteCarrera,
    disponible: false,
  },
  {
    key: 'estudiante',
    title: 'Reporte por estudiante',
    description: 'Detalle de aportes, descuentos y saldo por estudiante.',
    icon: <IdcardOutlined />,
    path: '/finanzas/reportes/estudiante',
    permiso: FINANZAS_PERMISOS.reporteEstudiante,
    disponible: false,
  },
  {
    key: 'gestion',
    title: 'Reporte por gestión',
    description: 'Consolidado de recaudación de aportes por gestión académica.',
    icon: <CalendarOutlined />,
    path: '/finanzas/reportes/gestion',
    permiso: FINANZAS_PERMISOS.reporteGestion,
    disponible: false,
  },
];

const ReportesHubPage = () => {
  const navigate = useNavigate();

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Finanzas' }, { title: 'Reportes de pagos' }],
    [],
  );

  return (
    <PageTemplate
      header={<PageHeader title="Reportes de pagos" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <DashboardPageShell>
        <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title="Reportes disponibles" />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                Planillas y consolidados de aportes académicos. Elija un reporte para abrirlo; solo se
                muestran los que su rol tiene permiso de consultar.
              </Paragraph>
            </header>
            <div className="cfg-academico-tab-panel">
              <div className="reportes-hub-grid">
                {REPORTES.map((reporte) => (
                  <PermisoGuard key={reporte.key} codigo={reporte.permiso} accion="LISTAR">
                    <ReporteHubCard
                      icon={reporte.icon}
                      title={reporte.title}
                      description={reporte.description}
                      disponible={reporte.disponible}
                      onClick={() => navigate(reporte.path)}
                    />
                  </PermisoGuard>
                ))}
              </div>
            </div>
          </section>
        </Flex>
      </DashboardPageShell>
    </PageTemplate>
  );
};

export default ReportesHubPage;
