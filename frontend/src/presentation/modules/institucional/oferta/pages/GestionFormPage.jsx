/**
 * Formulario de gestión académica — alta y edición.
 *
 *   create: /institucional/oferta/gestiones/nueva (CREAR) — alta de la
 *     gestión destino del flujo de renovación; al crear vuelve a
 *     /institucional/oferta/renovar con la gestión preseleccionada.
 *   edit:   /institucional/oferta/gestiones/:gestionId/editar (EDITAR) —
 *     edición de datos base; al guardar (o Volver) regresa al origen
 *     (location.state.returnListPath, default Gestiones pasadas).
 *
 * Shell canónico de formulario (CarreraFormPage): Flex.page-container →
 * PageHeaderArea(PageHeader + BackButton) → DashboardPageShell → MainContent
 * → card `cfg-academico-workspace cfg-academico-form-workspace` con los
 * campos y el botón de guardar en el footer.
 *
 * Página delgada: la lógica (modo, prefill, submit) vive en useGestionFormPage.
 */

import { Alert, Col, Flex, Form, Input, InputNumber, Row, Select, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, BackButton, Button, FieldDatePicker, Text } from '@atoms';
import { cfgFormColProps } from '@organisms/CfgFormWorkspace';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { allSpacing } from '@theme/tokens';
import { useGestionFormPage } from '@application-institucional/oferta';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const PERMISO_OFERTA = 'institucional.oferta.gestion-plan';

const GestionFormPage = ({ mode = 'create' }) => {
  const s = useGestionFormPage({ mode });
  const col = cfgFormColProps(12);

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={<BackButton icon={<ArrowLeftOutlined />} onClick={s.navigateBack} />}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.cargando} tip="Cargando gestión...">
            <section className="cfg-academico-workspace cfg-academico-form-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Datos de la gestión" />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  {s.cardDesc}
                </Paragraph>
              </header>

              <div className="cfg-academico-form-workspace__body">
                {s.loadError ? (
                  <Alert
                    type="error"
                    showIcon
                    title={s.loadError}
                    style={{ marginBottom: allSpacing.marginSM }}
                  />
                ) : null}

                <Form
                  form={s.form}
                  layout="vertical"
                  initialValues={s.initialValues}
                  disabled={s.guardando || s.cargando || Boolean(s.loadError)}
                >
                  <Row gutter={[24, 20]} className="cfg-academico-form-workspace__grid">
                    <Col {...col}>
                      <Form.Item
                        name="codigo"
                        label="Código"
                        rules={[{ required: true, message: 'Ingrese el código de la gestión' }]}
                        className="form-field form-field--vertical"
                      >
                        <Input placeholder="Ej. 2027-REG" maxLength={20} />
                      </Form.Item>
                    </Col>
                    <Col {...col}>
                      <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Ingrese el nombre de la gestión' }]}
                        className="form-field form-field--vertical"
                      >
                        <Input placeholder="Ej. Gestión Regular 2027" maxLength={100} />
                      </Form.Item>
                    </Col>
                    <Col {...col}>
                      <Form.Item
                        name="anio"
                        label="Año"
                        rules={[{ required: true, message: 'Ingrese el año' }]}
                        className="form-field form-field--vertical"
                      >
                        <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col {...col}>
                      <Form.Item
                        name="tipo"
                        label="Tipo"
                        rules={[{ required: true, message: 'Elija el tipo de gestión' }]}
                        className="form-field form-field--vertical"
                      >
                        <Select options={s.tipoOptions} placeholder="Tipo de gestión" />
                      </Form.Item>
                    </Col>
                    <Col {...col}>
                      <Form.Item
                        name="fechaInicio"
                        label="Fecha de inicio"
                        rules={[{ required: true, message: 'Elija la fecha de inicio' }]}
                        className="form-field form-field--vertical"
                      >
                        <FieldDatePicker placeholder="dd-mm-aaaa" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col {...col}>
                      <Form.Item
                        name="fechaFin"
                        label="Fecha de fin"
                        rules={[{ required: true, message: 'Elija la fecha de fin' }]}
                        className="form-field form-field--vertical"
                      >
                        <FieldDatePicker placeholder="dd-mm-aaaa" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

                <div className="cfg-academico-form-workspace__footer">
                  <Flex justify="space-between" align="center" gap={allSpacing.marginSM} wrap="wrap">
                    <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                      Los campos marcados con <Text type="danger">*</Text> son obligatorios.
                    </Text>
                    <Flex justify="flex-end" gap={allSpacing.marginSM}>
                      <Button variant="outline" onClick={s.navigateBack} disabled={s.guardando}>
                        Cancelar
                      </Button>
                      <ActionButton
                        permiso={PERMISO_OFERTA}
                        accion={s.submitAccion}
                        variant="primary"
                        icon={s.esEdicion ? <SaveOutlined /> : <PlusCircleOutlined />}
                        loading={s.guardando}
                        disabled={s.cargando || Boolean(s.loadError)}
                        onClick={s.onSubmit}
                      >
                        {s.submitLabel}
                      </ActionButton>
                    </Flex>
                  </Flex>
                </div>
              </div>
            </section>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default GestionFormPage;
