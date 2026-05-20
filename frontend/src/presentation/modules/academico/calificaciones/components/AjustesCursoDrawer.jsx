/**
 * Drawer de ajustes del curso (cuota, evaluaciones finales, asistencia).
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Form,
  InputNumber,
  notification,
  Radio,
  Skeleton,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAjustesCurso } from '@application-academico/calificaciones/hooks/useAjustesCurso.js';

const { Text } = Typography;

const POLITICAS_ASISTENCIA = [
  {
    value: 'NO_AFECTA',
    label: 'No influye en la nota',
    descripcion: 'La asistencia se registra pero no modifica la calificación.',
  },
  {
    value: 'COMPUTA_NOTA',
    label: 'Aporta puntos al práctico',
    descripcion: 'Un porcentaje de la nota final proviene del cumplimiento de asistencia.',
  },
  {
    value: 'CAUSA_REPROBACION',
    label: 'Reprobación por asistencia',
    descripcion: 'Si no alcanza el mínimo, la nota final queda fijada en un valor.',
  },
];

const AjustesCursoDrawer = ({ abierto, cursoId, onCerrar }) => {
  const [form] = Form.useForm();
  const { datos, isLoading, isSaving, error, recargar, guardar } = useAjustesCurso(
    cursoId,
    abierto,
  );
  const [errorGuardado, setErrorGuardado] = useState(null);

  const usarCuotaInstWatch = Form.useWatch('usarCuotaInstitucional', form);
  const teoricoWatch = Form.useWatch('teoricoOverride', form);
  const practicoWatch = Form.useWatch('practicoOverride', form);
  const politicaWatch = Form.useWatch('politicaAsistencia', form);
  const finalesWatch = Form.useWatch('evaluacionesFinales', form) ?? [];

  useEffect(() => {
    if (!abierto || !datos?.ajustes) return;

    setErrorGuardado(null);
    form.setFieldsValue({
      usarCuotaInstitucional: datos.ajustes.usarCuotaInstitucional,
      teoricoOverride: datos.ajustes.teoricoOverride ?? datos.institucional.cuotaTeorico,
      practicoOverride: datos.ajustes.practicoOverride ?? datos.institucional.cuotaPractico,
      evaluacionesFinales: datos.ajustes.evaluacionesFinales,
      politicaAsistencia: datos.ajustes.politicaAsistencia,
      pesoAsistencia: datos.ajustes.pesoAsistencia,
      minimoAsistencia: datos.ajustes.minimoAsistencia,
      notaReprobada: datos.ajustes.notaReprobada,
    });
  }, [abierto, datos, form]);

  const sumaCuota = useMemo(() => {
    if (usarCuotaInstWatch) {
      const inst = datos?.institucional;
      return (inst?.cuotaTeorico ?? 0) + (inst?.cuotaPractico ?? 0);
    }
    return (Number(teoricoWatch) || 0) + (Number(practicoWatch) || 0);
  }, [usarCuotaInstWatch, teoricoWatch, practicoWatch, datos?.institucional]);

  const sumaFinales = useMemo(
    () =>
      (finalesWatch ?? [])
        .filter((e) => e?.activo && e?.peso != null)
        .reduce((acc, e) => acc + Number(e.peso), 0),
    [finalesWatch],
  );

  const tiposFinales = datos?.institucional?.evaluacionesFinalesDisponibles ?? [];

  const handleCerrar = () => {
    if (!isSaving) onCerrar();
  };

  const construirPayload = (values) => ({
    usarCuotaInstitucional: values.usarCuotaInstitucional,
    teoricoOverride: values.usarCuotaInstitucional ? null : values.teoricoOverride,
    practicoOverride: values.usarCuotaInstitucional ? null : values.practicoOverride,
    evaluacionesFinales: (values.evaluacionesFinales ?? []).map((e, index) => ({
      codigo: tiposFinales[index]?.codigo ?? e.codigo,
      activo: Boolean(e.activo),
      peso: e.activo ? e.peso : null,
    })),
    politicaAsistencia: values.politicaAsistencia,
    pesoAsistencia: values.politicaAsistencia === 'COMPUTA_NOTA' ? values.pesoAsistencia : null,
    minimoAsistencia:
      values.politicaAsistencia === 'CAUSA_REPROBACION' ? values.minimoAsistencia : null,
    notaReprobada:
      values.politicaAsistencia === 'CAUSA_REPROBACION' ? values.notaReprobada : null,
  });

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      if (!values.usarCuotaInstitucional) {
        const suma = (values.teoricoOverride ?? 0) + (values.practicoOverride ?? 0);
        if (Math.abs(suma - 100) > 0.01) {
          notification.warning({
            message: 'La cuota teórico + práctico debe sumar 100%',
          });
          return;
        }
      }

      setErrorGuardado(null);
      await guardar(construirPayload(values));
      notification.success({
        message: 'Ajustes guardados',
        description: 'Coordinación puede ver los cambios respecto a la política institucional.',
      });
      onCerrar();
    } catch (err) {
      if (err?.errorFields) return;
      setErrorGuardado('No se pudo guardar. Reintentar.');
    }
  };

  const footer = (
    <div className="cal-ajustes-drawer__footer">
      <Button onClick={handleCerrar} disabled={isSaving}>
        Cancelar
      </Button>
      <Button
        type="primary"
        className="cal-eval-drawer__btn-primary"
        loading={isSaving}
        onClick={handleGuardar}
        disabled={isLoading || !datos}
      >
        Guardar ajustes
      </Button>
    </div>
  );

  const inst = datos?.institucional;
  const ultima = datos?.ultimaModificacion;

  return (
    <Drawer
      title="Ajustes del curso"
      width={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnClose
      footer={footer}
      className="cal-ajustes-drawer cal-eval-drawer"
    >
      {datos?.tieneOverrides && ultima ? (
        <Alert
          type="info"
          showIcon
          className="cal-ajustes-drawer__override-alert"
          title="Este curso tiene configuración distinta a la institucional"
          description={
            <>
              Última modificación por <strong>{ultima.updatedByNombre}</strong> el{' '}
              {new Date(ultima.updatedAt).toLocaleString('es-BO', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              . Coordinación puede revisar el detalle.
            </>
          }
        />
      ) : null}

      {error || errorGuardado ? (
        <Alert
          type="error"
          showIcon
          message={errorGuardado ?? 'No se pudieron cargar los ajustes'}
          action={
            <Button size="small" type="link" onClick={recargar}>
              Reintentar
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : datos ? (
        <Form form={form} layout="vertical" className="cal-ajustes-drawer__form">
          <section className="cal-ajustes-drawer__section">
            <h3 className="cal-ajustes-drawer__section-title">Cuota teórico / práctico</h3>
            <p className="cal-ajustes-drawer__section-desc">
              Institución (gestión {datos.gestionVigente ?? '2025'}):{' '}
              <strong>
                {inst.cuotaTeorico}% teórico · {inst.cuotaPractico}% práctico
              </strong>
            </p>

            <Form.Item
              name="usarCuotaInstitucional"
              valuePropName="checked"
              label="Usar cuota institucional"
            >
              <Switch />
            </Form.Item>

            {!usarCuotaInstWatch ? (
              <div className="cal-ajustes-drawer__cuota-row">
                <Form.Item
                  name="teoricoOverride"
                  label="Teórico"
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <InputNumber min={0} max={100} precision={2} addonAfter="%" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="practicoOverride"
                  label="Práctico"
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <InputNumber min={0} max={100} precision={2} addonAfter="%" style={{ width: '100%' }} />
                </Form.Item>
              </div>
            ) : null}

            <div
              className={[
                'cal-eval-drawer__peso-hint',
                sumaCuota === 100 ? 'cal-eval-drawer__peso-hint--ok-full' : 'cal-eval-drawer__peso-hint--warn',
              ].join(' ')}
            >
              Suma de cuota: {sumaCuota}% / 100%
              {sumaCuota !== 100 ? ' — debe ser exactamente 100% para cerrar bimestres.' : ''}
            </div>
          </section>

          <Divider />

          <section className="cal-ajustes-drawer__section">
            <h3 className="cal-ajustes-drawer__section-title">Evaluaciones finales</h3>
            <p className="cal-ajustes-drawer__section-desc">
              Cubren toda la materia (no un bimestre). Solo los tipos habilitados por la institución.
            </p>

            <Form.List name="evaluacionesFinales">
              {(fields) =>
                fields.map((field, index) => {
                  const tipo = tiposFinales[index];
                  if (!tipo) return null;
                  const habilitada = tipo.habilitadaInstitucional;
                  const activo = finalesWatch[index]?.activo;

                  return (
                    <div
                      key={tipo.codigo}
                      className={[
                        'cal-ajustes-drawer__final-item',
                        !habilitada ? 'cal-ajustes-drawer__final-item--disabled' : '',
                      ].join(' ')}
                    >
                      <div className="cal-ajustes-drawer__final-head">
                        <Form.Item
                          name={[field.name, 'activo']}
                          valuePropName="checked"
                          noStyle
                        >
                          <Switch disabled={!habilitada} />
                        </Form.Item>
                        <span className="cal-ajustes-drawer__final-label">
                          {tipo.nombre}
                          {!habilitada ? (
                            <Tooltip title="No habilitada a nivel institucional para esta gestión">
                              <InfoCircleOutlined className="cal-ajustes-drawer__info-icon" />
                            </Tooltip>
                          ) : null}
                        </span>
                      </div>
                      {habilitada && activo ? (
                        <Form.Item
                          name={[field.name, 'peso']}
                          label="Peso en nota anual"
                          rules={[
                            { required: true, message: 'Ingresá el peso' },
                            {
                              validator: (_, v) =>
                                v > 0 && v <= 100
                                  ? Promise.resolve()
                                  : Promise.reject(new Error('Entre 0 y 100')),
                            },
                          ]}
                        >
                          <InputNumber
                            min={0.01}
                            max={100}
                            precision={2}
                            addonAfter="%"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      ) : null}
                    </div>
                  );
                })
              }
            </Form.List>

            {sumaFinales > 0 ? (
              <div className="cal-eval-drawer__peso-hint cal-eval-drawer__peso-hint--ok">
                Suma de evaluaciones finales activas: {sumaFinales}%
                <Text type="secondary" className="cal-ajustes-drawer__hint-extra">
                  {' '}
                  (se combina con los 4 bimestres al calcular la nota anual)
                </Text>
              </div>
            ) : null}
          </section>

          <Divider />

          <section className="cal-ajustes-drawer__section">
            <h3 className="cal-ajustes-drawer__section-title">Política de asistencia</h3>
            <p className="cal-ajustes-drawer__section-desc">
              Default institucional:{' '}
              <strong>
                {POLITICAS_ASISTENCIA.find(
                  (p) => p.value === inst.politicaAsistenciaDefault.politica,
                )?.label ?? inst.politicaAsistenciaDefault.politica}
              </strong>
            </p>

            <Form.Item name="politicaAsistencia" rules={[{ required: true }]}>
              <Radio.Group className="cal-ajustes-drawer__politica-group">
                {POLITICAS_ASISTENCIA.map((p) => (
                  <Radio key={p.value} value={p.value} className="cal-ajustes-drawer__politica-option">
                    <span className="cal-ajustes-drawer__politica-label">{p.label}</span>
                    <Text type="secondary" className="cal-ajustes-drawer__politica-desc">
                      {p.descripcion}
                    </Text>
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>

            {politicaWatch === 'COMPUTA_NOTA' ? (
              <Form.Item
                name="pesoAsistencia"
                label="Peso de asistencia en la nota"
                rules={[{ required: true, message: 'Ingresá el peso' }]}
              >
                <InputNumber
                  min={0.01}
                  max={100}
                  precision={2}
                  addonAfter="%"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            ) : null}

            {politicaWatch === 'CAUSA_REPROBACION' ? (
              <>
                <Form.Item
                  name="minimoAsistencia"
                  label="Asistencia mínima exigida"
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    precision={2}
                    addonAfter="%"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  name="notaReprobada"
                  label="Nota asignada si reprueba por asistencia"
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
                </Form.Item>
              </>
            ) : null}
          </section>
        </Form>
      ) : null}
    </Drawer>
  );
};

export default AjustesCursoDrawer;
