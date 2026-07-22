/**
 * Listado de inscripciones de capacitación (Capacitación · CAP-INSCRIPCIONES ·
 * LISTAR) — participante + curso + estado de pago (≈ PagosList de Finanzas).
 *
 * Página "dumb": solo compone template + organismos y consume el hook de
 * pantalla. No hace fetch ni orquesta.
 *
 * Filtro "Solo con pago vencido" (regla §7 del módulo): un `Switch` sobre el
 * historial YA cargado (no requiere pantalla nueva) — cruza `estadoPago`
 * PARCIAL con la fecha de compromiso vencida (`record.pagoVencido`, derivado
 * en el mapper del frontend).
 */

import { Flex, Switch, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useInscripcionesCapacitacionListPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionesCapacitacionListPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph, Text } = Typography;

const InscripcionesCapacitacionList = () => {
  const {
    inscripciones,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleInscribir,
    handleSearchChange,
    tablePagination,
    soloVencidos,
    setSoloVencidos,
  } = useInscripcionesCapacitacionListPage();

  const inscribirAction = (
    <ActionButton
      permiso={CAPACITACION_PERMISOS.inscripcion}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleInscribir}
    >
      Inscribir participante
    </ActionButton>
  );

  const filtroVencidosAction = (
    <Flex align="center" gap={8}>
      <Switch
        checked={soloVencidos}
        onChange={setSoloVencidos}
        size="small"
        aria-label="Solo con pago vencido"
      />
      <Text type="secondary">Solo con pago vencido</Text>
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Inscripciones de capacitación" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Lista de inscripciones" actions={inscribirAction} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Participantes inscritos a cursos de capacitación con su estado de pago (total
                  pagado frente al costo del curso). Los pagos se registran desde la ficha de cada
                  inscripción.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={inscripciones}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por participante, CI o curso…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando inscripciones…"
                  emptyText={
                    soloVencidos
                      ? 'No hay inscripciones con pago vencido.'
                      : 'Aún no hay inscripciones registradas.'
                  }
                  headerActions={filtroVencidosAction}
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default InscripcionesCapacitacionList;
