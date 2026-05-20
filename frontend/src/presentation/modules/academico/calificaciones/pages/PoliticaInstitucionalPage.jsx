/**
 * Política institucional de evaluación (Nivel 1) — configuración por gestión.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  notification,
  Radio,
  Skeleton,
  Switch,
  Typography,
} from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { usePoliticaInstitucional } from '@application-academico/calificaciones/hooks/usePoliticaInstitucional.js';
import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';
import CalificacionesAcciones, { AccionVolverCoordinacion } from '../components/CalificacionesAcciones.jsx';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import { CALIFICACIONES_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import '../styles/calificaciones.css';
import '../styles/politica-institucional.css';

const { Paragraph, Text } = Typography;

const PoliticaInstitucionalPage = () => {
  const [form] = Form.useForm();
  const { politica, isLoading, isSaving, error, refetch, guardar, breadcrumbItems } =
    usePoliticaInstitucional();
  const [errorGuardado, setErrorGuardado] = useState(null);

  const teoricoWatch = Form.useWatch('cuotaTeorico', form);
  const practicoWatch = Form.useWatch('cuotaPractico', form);
  const pesosWatch = Form.useWatch('pesosBimestres', form) ?? [];
  const politicaWatch = Form.useWatch(['politicaAsistenciaDefault', 'politica'], form);
  useEffect(() => {
    if (!politica) return;
    setErrorGuardado(null);
    form.setFieldsValue({
      cuotaTeorico: politica.cuotaTeorico,
      cuotaPractico: politica.cuotaPractico,
      pesosBimestres: politica.pesosBimestres,
      evaluacionesFinalesDisponibles: politica.evaluacionesFinalesDisponibles,
      politicaAsistenciaDefault: politica.politicaAsistenciaDefault,
    });
  }, [politica, form]);

  const sumaCuota = (Number(teoricoWatch) || 0) + (Number(practicoWatch) || 0);
  const sumaBimestres = (pesosWatch ?? []).reduce((acc, p) => acc + (Number(p) || 0), 0);

  const construirPayload = (values) => ({
    cuotaTeorico: values.cuotaTeorico,
    cuotaPractico: values.cuotaPractico,
    pesosBimestres: values.pesosBimestres,
    evaluacionesFinalesDisponibles: (values.evaluacionesFinalesDisponibles ?? []).map(
      (e, i) => ({
        codigo: politica.evaluacionesFinalesDisponibles[i]?.codigo ?? e.codigo,
        nombre: politica.evaluacionesFinalesDisponibles[i]?.nombre ?? e.nombre,
        habilitadaInstitucional: Boolean(e.habilitadaInstitucional),
      }),
    ),
    politicaAsistenciaDefault: {
      politica: values.politicaAsistenciaDefault.politica,
      pesoAsistencia:
        values.politicaAsistenciaDefault.politica === 'COMPUTA_NOTA'
          ? values.politicaAsistenciaDefault.pesoAsistencia
          : null,
      minimoAsistencia:
        values.politicaAsistenciaDefault.politica === 'CAUSA_REPROBACION'
          ? values.politicaAsistenciaDefault.minimoAsistencia
          : null,
      notaReprobada:
        values.politicaAsistenciaDefault.politica === 'CAUSA_REPROBACION'
          ? values.politicaAsistenciaDefault.notaReprobada
          : null,
    },
  });

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      if (Math.abs(sumaCuota - 100) > 0.01) {
        notification.warning({ message: 'La cuota teórico + práctico debe sumar 100%' });
        return;
      }
      if (Math.abs(sumaBimestres - 100) > 0.01) {
        notification.warning({ message: 'Los pesos de los 4 bimestres deben sumar 100%' });
        return;
      }
      setErrorGuardado(null);
      await guardar(construirPayload(values));
      notification.success({
        message: 'Política guardada',
        description: 'Los cursos sin override heredarán estos valores.',
      });
    } catch (err) {
      if (err?.errorFields) return;
      setErrorGuardado('No se pudo guardar. Reintentar.');
    }
  };

  const header = (
    <PageHeader title="Política institucional" breadcrumbItems={breadcrumbItems} />
  );

  const hintCuota = useMemo(() => {
    if (sumaCuota === 100) return { tipo: 'ok-full', texto: 'Suma de cuota: 100% / 100%' };
    return {
      tipo: 'warn',
      texto: `Suma de cuota: ${sumaCuota}% / 100% — debe ser exactamente 100%.`,
    };
  }, [sumaCuota]);

  const hintBimestres = useMemo(() => {
    if (sumaBimestres === 100) return { tipo: 'ok-full', texto: 'Pesos bimestrales: 100% / 100%' };
    return {
      tipo: 'warn',
      texto: `Pesos bimestrales: ${sumaBimestres}% / 100%`,
    };
  }, [sumaBimestres]);

  return (
    <PageTemplate header={header} sidebar={null}>
      <div className="cal-politica sd">
        <CalificacionesAcciones>
          <AccionVolverCoordinacion to={CALIFICACIONES_PATH} />
        </CalificacionesAcciones>

        {politica ? (
          <Paragraph className="cal-politica__contexto">
            Gestión <strong>{politica.gestionNombre}</strong>
            {politica.ultimaModificacion ? (
              <>
                {' '}
                · Última actualización por{' '}
                <strong>{politica.ultimaModificacion.updatedByNombre}</strong> el{' '}
                {new Date(politica.ultimaModificacion.updatedAt).toLocaleDateString('es-BO', {
                  dateStyle: 'medium',
                })}
              </>
            ) : null}
          </Paragraph>
        ) : null}

        <Alert
          type="info"
          showIcon
          className="cal-politica__alert"
          message="Nivel 1 — Política institucional"
          description="Define los defaults de toda la gestión. Los docentes pueden hacer override por curso en Ajustes del curso."
        />

        {error || errorGuardado ? (
          <Alert
            type="error"
            showIcon
            message={errorGuardado ?? 'No se pudo cargar la política'}
            action={
              <Button size="small" onClick={refetch}>
                Reintentar
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 12 }} />
        ) : politica ? (
          <Form form={form} layout="vertical" className="cal-politica__form">
            <Card title="Cuota teórico / práctico (por bimestre)" size="small" className="cal-politica__card">
              <div className="cal-politica__cuota-row">
                <Form.Item
                  name="cuotaTeorico"
                  label="Teórico"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} max={100} precision={2} addonAfter="%" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="cuotaPractico"
                  label="Práctico"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} max={100} precision={2} addonAfter="%" style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <div className={`cal-politica__hint cal-politica__hint--${hintCuota.tipo}`}>
                {hintCuota.texto}
              </div>
            </Card>

            <Card title="Peso de cada bimestre en la nota anual" size="small" className="cal-politica__card">
              <div className="cal-politica__bimestres-row">
                {[1, 2, 3, 4].map((num, index) => (
                  <Form.Item
                    key={num}
                    name={['pesosBimestres', index]}
                    label={`Bim. ${num}`}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} max={100} precision={2} addonAfter="%" style={{ width: '100%' }} />
                  </Form.Item>
                ))}
              </div>
              <div className={`cal-politica__hint cal-politica__hint--${hintBimestres.tipo}`}>
                {hintBimestres.texto}
              </div>
            </Card>

            <Card title="Evaluaciones finales habilitadas" size="small" className="cal-politica__card">
              <Paragraph type="secondary" className="cal-politica__card-desc">
                Tipos que los docentes pueden activar en sus cursos. Si no está habilitado aquí, no
                aparece en Ajustes del curso.
              </Paragraph>
              <Form.List name="evaluacionesFinalesDisponibles">
                {(fields) =>
                  fields.map((field, index) => {
                    const tipo = politica.evaluacionesFinalesDisponibles[index];
                    return (
                      <div key={tipo?.codigo} className="cal-politica__final-row">
                        <Form.Item name={[field.name, 'habilitadaInstitucional']} valuePropName="checked" noStyle>
                          <Switch />
                        </Form.Item>
                        <span className="cal-politica__final-label">{tipo?.nombre}</span>
                      </div>
                    );
                  })
                }
              </Form.List>
            </Card>

            <Card title="Política de asistencia (default)" size="small" className="cal-politica__card">
              <Form.Item name={['politicaAsistenciaDefault', 'politica']} rules={[{ required: true }]}>
                <Radio.Group className="cal-politica__politica-group">
                  {POLITICAS_ASISTENCIA.map((p) => (
                    <Radio key={p.value} value={p.value} className="cal-politica__politica-option">
                      <span className="cal-politica__politica-label">{p.label}</span>
                      <Text type="secondary" className="cal-politica__politica-desc">
                        {p.descripcion}
                      </Text>
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>

              {politicaWatch === 'COMPUTA_NOTA' ? (
                <Form.Item
                  name={['politicaAsistenciaDefault', 'pesoAsistencia']}
                  label="Peso default de asistencia"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0.01} max={100} precision={2} addonAfter="%" style={{ width: '100%' }} />
                </Form.Item>
              ) : null}

              {politicaWatch === 'CAUSA_REPROBACION' ? (
                <>
                  <Form.Item
                    name={['politicaAsistenciaDefault', 'minimoAsistencia']}
                    label="Asistencia mínima default"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} max={100} precision={2} addonAfter="%" style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name={['politicaAsistenciaDefault', 'notaReprobada']}
                    label="Nota default si reprueba por asistencia"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
                  </Form.Item>
                </>
              ) : null}
            </Card>

            <div className="cal-politica__actions">
              <PermisoGuard
                codigo={CALIFICACIONES_PERMISOS.politica}
                accion="EDITAR"
                fallback={
                  <Button type="primary" size="large" disabled>
                    Sin permiso para editar
                  </Button>
                }
              >
                <Button
                  type="primary"
                  size="large"
                  className="cal-eval-drawer__btn-primary"
                  loading={isSaving}
                  onClick={handleGuardar}
                >
                  Guardar política institucional
                </Button>
              </PermisoGuard>
            </div>
          </Form>
        ) : null}
      </div>
    </PageTemplate>
  );
};

export default PoliticaInstitucionalPage;
