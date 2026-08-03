/**
 * MisTutoradosPage — rama DOCENTE del ítem de menú Proyectos de grado (TIT).
 *
 * Página GEMELA de `MisEstudiantesDocentePage` (Matrícula): bandeja del tutor
 * autenticado (T3, identidad resuelta en servidor). Acciones por fila: abrir
 * ficha, registrar entrada de bitácora (drawer T15) y aprobación final (T11,
 * gated por proyecto·APROBAR). Orquestación en `useMisTutoradosPage`.
 */

import { Alert, Button, Empty, Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { useMisTutoradosPage } from '@application-titulacion/proyectos-grado/hooks/state/useMisTutoradosPage';
import BitacoraEntradaDrawer from '@titulacion/proyectos-grado/components/modals/BitacoraEntradaDrawer';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const MisTutoradosPage = () => {
  const {
    proyectos,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    bitacoraDrawer,
    cerrarBitacora,
    handleGuardarBitacora,
    guardandoBitacora,
  } = useMisTutoradosPage();

  const sinTutorados = !loading && !error && proyectos.length === 0 && !searchText;

  return (
    <PageTemplate
      header={<PageHeader title="Mis tutorados" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Proyectos bajo su tutoría" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Proyectos de grado en los que usted figura como tutor. Registre las reuniones de
              tutoría en la bitácora de cada proyecto; desde la ficha puede revisar avances y
              emitir la aprobación final.
            </Paragraph>
          </header>
          {error ? (
            <Alert
              type="warning"
              showIcon
              title="No se pudo cargar su lista de tutorados"
              description={error}
            />
          ) : sinTutorados ? (
            <div className="cfg-academico-tab-panel">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Aún no tiene proyectos de grado bajo su tutoría."
              />
            </div>
          ) : (
            <div className="cfg-academico-tab-panel">
              <TableListView
                embedded
                data={proyectos}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Buscar por proyecto, integrante o carrera…"
                columns={tableColumns}
                rowKey={(record) => record.id}
                searchColSpan={10}
                searchStyle={{ maxWidth: 520 }}
                loadingTip="Cargando sus tutorados…"
                emptyText="Ningún proyecto coincide con la búsqueda."
              />
            </div>
          )}
        </section>
      </Flex>

      <BitacoraEntradaDrawer
        open={bitacoraDrawer.open}
        proyectoTitulo={bitacoraDrawer.proyecto?.titulo}
        onClose={cerrarBitacora}
        onSubmit={handleGuardarBitacora}
        saving={guardandoBitacora}
      />
    </PageTemplate>
  );
};

export default MisTutoradosPage;
