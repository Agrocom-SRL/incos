import {
  Alert,
  Button,
  Card,
  Flex,
  Modal,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useOfertaAcademicaWizardState } from '@application-institucional/oferta';
import ParaleloGestionDrawer from '../components/organisms/ParaleloGestionDrawer';

const { Text } = Typography;

function OfertaBadge({ validacion, ofertaActual }) {
  if (!validacion) return <Text type="secondary">—</Text>;
  const { valido, asignaturas_esperadas: esp, oferta_actual: act } = validacion;
  const label = `${act}/${esp}`;
  if (valido) return <Tag color="success">✓ {label}</Tag>;
  if (ofertaActual > 0) return <Tag color="warning">⚠ {label}</Tag>;
  return <Text type="secondary">—</Text>;
}

const OfertaAcademicaWizardPage = () => {
  const w = useOfertaAcademicaWizardState();

  const columnsParalelos = [
    {
      title: 'Paralelo',
      dataIndex: 'paraleloNombre',
      key: 'paralelo',
    },
    {
      title: 'Turno',
      key: 'turno',
      width: 140,
      render: (_, row) => (
        <Select
          size="small"
          style={{ width: 120 }}
          value={row.turno}
          options={w.TURNOS.map((t) => ({ value: t, label: t }))}
          onClick={(e) => e.stopPropagation()}
          onChange={(val) => w.onCambiarTurno(row.id, val)}
          disabled={row.estado !== 'BORRADOR' && row.estado !== 'OFERTADO'}
        />
      ),
    },
    {
      title: 'Aula',
      key: 'aula',
      width: 180,
      render: (_, row) => (
        <Select
          size="small"
          allowClear
          placeholder="Sin asignar"
          style={{ width: 160 }}
          value={row.aulaId ?? undefined}
          options={w.aulas.map((a) => ({
            value: a.id,
            label: a.codigo ? `${a.codigo} — ${a.nombre}` : a.nombre,
          }))}
          onClick={(e) => e.stopPropagation()}
          onChange={(val) => w.onUpdateAula(row.id, val ?? null)}
        />
      ),
    },
    {
      title: 'Cupos',
      key: 'cupos',
      width: 90,
      render: (_, row) => `${row.cupoMaximo ?? '—'}`,
    },
    {
      title: 'Oferta',
      key: 'oferta',
      width: 110,
      render: (_, row) => (
        <OfertaBadge validacion={w.validacionPorId[row.id]} ofertaActual={row.ofertaActual} />
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 110,
      render: (estado) => <Tag>{estado}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 260,
      render: (_, row) => {
        const v = w.validacionPorId[row.id];
        const puedeOfertar =
          row.estado === 'BORRADOR' && row.aulaId && v?.valido;
        return (
          <Space size="small" wrap>
            <ActionButton
              permiso="institucional.oferta.cursos"
              accion="CREAR"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                w.onGenerarOferta(row.id);
              }}
            >
              Generar oferta
            </ActionButton>
            <ActionButton
              permiso="institucional.oferta.paralelo-gestion"
              accion="DETALLE"
              size="small"
              type="link"
              onClick={(e) => {
                e.stopPropagation();
                w.openDrawer(row.id);
              }}
            >
              Detalle
            </ActionButton>
            {puedeOfertar ? (
              <ActionButton
                permiso="institucional.oferta.paralelo-gestion"
                accion="EDITAR"
                size="small"
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  w.onPasarOfertado(row.id);
                }}
              >
                → OFERTADO
              </ActionButton>
            ) : null}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <PageHeaderArea>
        <PageHeader
          title="Oferta Académica"
          subtitle="Habilitar planes, generar paralelos y cursos ofertados por gestión"
        />
      </PageHeaderArea>
      <MainContent>
        {w.apiError ? (
          <Alert type="error" showIcon title={w.apiError} style={{ marginBottom: 16 }} />
        ) : null}

        <Steps
          current={w.step}
          onChange={w.setStep}
          items={[
            { title: 'Gestión' },
            { title: 'Planes' },
            { title: 'Paralelos + Oferta' },
          ]}
          style={{ marginBottom: 24 }}
        />

        {w.step === 0 ? (
          <Card title="Paso 1 — Gestión académica">
            <Flex vertical gap="middle">
              <Select
                placeholder="Seleccione gestión"
                style={{ maxWidth: 420 }}
                value={w.selectedGestionId}
                onChange={w.setSelectedGestionId}
                options={w.gestiones.map((g) => ({
                  value: g.id,
                  label: `${g.codigo ?? g.name ?? g.nombre ?? `Gestión ${g.id}`}${
                    g.anio ? ` ${g.anio}` : ''
                  }${g.vigente ? ' (vigente)' : ''}`,
                }))}
              />
              <Space>
                <ActionButton
                  permiso="institucional.oferta.gestion-plan"
                  accion="ACTIVAR"
                  onClick={w.onMarcarVigente}
                  disabled={!w.selectedGestionId}
                >
                  Marcar vigente
                </ActionButton>
                <Button
                  type="primary"
                  disabled={!w.selectedGestionId}
                  onClick={() => w.setStep(1)}
                >
                  Continuar a planes
                </Button>
              </Space>
            </Flex>
          </Card>
        ) : null}

        {w.step === 1 ? (
          <Card
            title="Paso 2 — Planes habilitados"
            extra={
              <ActionButton
                permiso="institucional.oferta.gestion-plan"
                accion="CREAR"
                onClick={w.openHabilitarPlanModal}
                disabled={!w.selectedGestionId}
              >
                Habilitar plan
              </ActionButton>
            }
          >
            <Table
              rowKey="id"
              loading={w.apiLoading}
              dataSource={w.planesHabilitados}
              pagination={false}
              columns={[
                {
                  title: 'Plan / Carrera',
                  key: 'plan',
                  render: (_, row) =>
                    row.carreraNombre
                      ? `${row.carreraNombre} — ${row.nombre ?? `Plan #${row.planEstudioId}`}`
                      : row.nombre ?? `Plan #${row.planEstudioId}`,
                },
                { title: 'Estado', dataIndex: 'estado', width: 120, render: (e) => <Tag>{e}</Tag> },
                {
                  title: '',
                  key: 'go',
                  render: (_, row) => (
                    <Button type="link" onClick={() => w.selectPlanYContinuar(row.id)}>
                      Configurar oferta →
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        ) : null}

        {w.step === 2 ? (
          <Card
            title={`Paso 3 — Paralelos y oferta${w.planSeleccionado ? ` (plan #${w.planSeleccionado.planEstudioId})` : ''}`}
            extra={
              <Space>
                <ActionButton
                  permiso="institucional.oferta.paralelo-gestion"
                  accion="CREAR"
                  onClick={w.onGenerarParalelos}
                >
                  Generar paralelos de gestión
                </ActionButton>
                <ActionButton
                  permiso="institucional.oferta.paralelo-gestion"
                  accion="EDITAR"
                  onClick={w.onPasarTodosOfertado}
                >
                  Cambiar todos a OFERTADO
                </ActionButton>
              </Space>
            }
          >
            <Table
              rowKey="id"
              loading={w.apiLoading}
              dataSource={w.paralelosGestion}
              columns={columnsParalelos}
              pagination={false}
              scroll={{ x: 960 }}
              onRow={(row) => ({
                onClick: () => w.openDrawer(row.id),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        ) : null}

        <Modal
          title="Habilitar plan de estudio"
          open={w.modalHabilitarPlan}
          onCancel={() => w.setModalHabilitarPlan(false)}
          footer={null}
          destroyOnClose
        >
          <Select
            showSearch
            placeholder="Plan vigente"
            style={{ width: '100%' }}
            optionFilterProp="label"
            options={w.planesVigentes
              .filter((p) => p.vigente !== false)
              .map((p) => ({
                value: p.id,
                label: p.nombre ?? p.codigo ?? `Plan #${p.id}`,
              }))}
            onChange={(planId) => w.onHabilitarPlan(planId)}
          />
        </Modal>

        <ParaleloGestionDrawer
          open={Boolean(w.drawerParaleloId)}
          paraleloId={w.drawerParaleloId}
          detalle={w.drawerDetalle}
          ofertaCursos={w.drawerOfertaCursos}
          asignaturasFaltantes={w.validacionPorId[w.drawerParaleloId]?.faltantes ?? []}
          aulas={w.aulas}
          onClose={w.closeDrawer}
          onRefresh={async () => {
            if (w.drawerParaleloId) {
              await w.openDrawer(w.drawerParaleloId);
              await w.loadParalelosGestion();
            }
          }}
          crearOfertaCursoManual={w.crearOfertaCursoManual}
          eliminarOfertaCurso={w.eliminarOfertaCurso}
          updateParaleloGestion={w.updateParaleloGestion}
        />
      </MainContent>
    </>
  );
};

export default OfertaAcademicaWizardPage;
