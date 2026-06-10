import { Alert, Flex, Form, Input, Select, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { DashboardPageShell } from '@dashboard/components/organisms';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, FieldDatePicker } from '@atoms';
import { useCronogramaActividadForm } from '@application-institucional/actual';
import { getActivityIconComponent } from '@config/icons';

const PERMISO = 'institucional.gestion.cronograma';

const CronogramaActividadFormPage = ({ mode = 'create' }) => {
  const s = useCronogramaActividadForm(mode);

  const periodoOptions = s.periodos.map((p) => ({ value: p.periodoAcademicoId, label: p.nombre }));
  const catalogoOptions = s.catalogo.map((a) => ({ value: a.id, label: a.nombre, icono: a.icono }));

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={s.handleVolver}>Volver</BackButton>}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.loading} tip="Cargando…">
            <Flex vertical gap="middle" style={{ width: '100%' }}>
              {s.error ? <Alert type="error" showIcon title={s.error} /> : null}

              <Form form={s.form} layout="vertical" disabled={s.loading || s.saving}>
                <Form.Item
                  name="periodoAcademicoId"
                  label="Etapa / periodo"
                  rules={[{ required: true, message: 'Seleccione la etapa.' }]}
                >
                  <Select placeholder="Selecciona la etapa" options={periodoOptions} />
                </Form.Item>

                <Form.Item name="actividadId" label="Actividad del catálogo (opcional)">
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Selecciona una actividad del catálogo"
                    options={catalogoOptions}
                    optionRender={(option) => {
                      const Icon = getActivityIconComponent(option.data.icono);
                      return (
                        <Flex align="center" gap="small">
                          <Icon />
                          <span>{option.data.label}</span>
                        </Flex>
                      );
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="nombrePersonalizado"
                  label="Nombre personalizado (opcional)"
                  tooltip="Si lo dejas vacío se usa el nombre del catálogo."
                >
                  <Input maxLength={200} placeholder="Ej.: Presentación de notas del 1er bimestre" />
                </Form.Item>

                <Flex gap="middle" wrap>
                  <Form.Item
                    name="fechaInicio"
                    label="Fecha de inicio"
                    rules={[{ required: true, message: 'Indique la fecha de inicio.' }]}
                    style={{ flex: 1, minWidth: 200 }}
                  >
                    <FieldDatePicker placeholder="dd-mm-aaaa" style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    name="fechaFin"
                    label="Fecha de fin (vacía = todo el día)"
                    style={{ flex: 1, minWidth: 200 }}
                  >
                    <FieldDatePicker placeholder="dd-mm-aaaa" style={{ width: '100%' }} />
                  </Form.Item>
                </Flex>

                <Flex>
                  <ActionButton
                    permiso={PERMISO}
                    accion={s.permisoAccion}
                    variant="primary"
                    icon={<SaveOutlined />}
                    loading={s.saving}
                    onClick={s.handleSubmit}
                  >
                    {s.isEdit ? 'Guardar cambios' : 'Crear actividad'}
                  </ActionButton>
                </Flex>
              </Form>
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CronogramaActividadFormPage;
