/**
 * Drawer de ajustes del curso (cuota, evaluaciones finales, asistencia).
 */

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  notification,
  Flex,
  Radio,
  Skeleton,
  Space,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckSquareOutlined,
  FlagOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  StopOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { etiquetaAlcanceEvaluacionFinal } from '@application-academico/calificaciones/utils/evaluacionesFinalesReglas.js';
import { useAjustesCurso } from '@application-academico/calificaciones/hooks/useAjustesCurso.js';
import AjustesCursoInstitucionalPanel from './AjustesCursoInstitucionalPanel.jsx';
import SeccionAjustes from './ajustes/SeccionAjustes.jsx';
import {
  contarOverridesActivos,
  snapshotValoresAjustes,
  valoresFormularioDesdeDatos,
  valoresPersistidosDesdeDatos,
} from './ajustes/contarOverridesAjustes.js';

const { Text, Paragraph } = Typography;

/** InputNumber con sufijo % (Ant Design deprecó addonAfter). */
const InputPorcentaje = forwardRef((props, ref) => {
  const { style, ...rest } = props;
  return (
    <Space.Compact block className="cal-ajustes-drawer__input-pct">
      <InputNumber ref={ref} {...rest} style={{ width: '100%', ...style }} />
      <Input className="cal-ajustes-drawer__input-pct-suffix" value="%" disabled tabIndex={-1} />
    </Space.Compact>
  );
});
InputPorcentaje.displayName = 'InputPorcentaje';

const ICONOS_POLITICA = {
  NO_AFECTA: TeamOutlined,
  COMPUTA_NOTA: WarningOutlined,
  CAUSA_REPROBACION: StopOutlined,
};

const COLORES_POLITICA = {
  NO_AFECTA: { color: '#595959', bg: '#fafafa' },
  COMPUTA_NOTA: { color: '#196b45', bg: '#e8f5ec' },
  CAUSA_REPROBACION: { color: '#cf1322', bg: '#fff1f0' },
};

const PESO_ASISTENCIA_SUGERIDO = 10;
const MINIMO_ASISTENCIA_SUGERIDO = 75;
const NOTA_REPROBADA_SUGERIDA = 51;

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

const FinalEstadoChip = ({ activo }) => (
  <span
    className={[
      'cal-estado-eval-chip',
      'cal-estado-eval-chip--compact',
      activo ? 'cal-estado-eval-chip--aplica' : 'cal-estado-eval-chip--no-aplica',
    ].join(' ')}
  >
    {activo ? 'Activa' : 'Inactiva'}
  </span>
);

const AjustesCursoDrawer = ({ abierto, cursoId, onCerrar, onGuardado }) => {
  const [form] = Form.useForm();
  const { datos, isLoading, isSaving, error, recargar, guardar } = useAjustesCurso(
    cursoId,
    abierto,
  );
  const [errorGuardado, setErrorGuardado] = useState(null);
  const [seccionDestacada, setSeccionDestacada] = useState(null);
  const snapshotInicialRef = useRef(null);

  const usarCuotaInstWatch = Form.useWatch('usarCuotaInstitucional', form);
  const teoricoWatch = Form.useWatch('teoricoOverride', form);
  const practicoWatch = Form.useWatch('practicoOverride', form);
  const politicaWatch = Form.useWatch('politicaAsistencia', form);
  const finalesWatch = Form.useWatch('evaluacionesFinales', form) ?? [];
  const pesoAsistenciaWatch = Form.useWatch('pesoAsistencia', form);
  const minimoAsistenciaWatch = Form.useWatch('minimoAsistencia', form);
  const notaReprobadaWatch = Form.useWatch('notaReprobada', form);

  const destacarSeccion = (id) => {
    setSeccionDestacada(id);
    const timer = window.setTimeout(() => setSeccionDestacada(null), 1000);
    return () => window.clearTimeout(timer);
  };

  const prevUsarCuotaRef = useRef(undefined);
  const prevFinalesRef = useRef(undefined);
  const prevPoliticaRef = useRef(undefined);

  useEffect(() => {
    if (!abierto || !datos?.ajustes) return;

    setErrorGuardado(null);
    const values = valoresFormularioDesdeDatos(datos);
    form.setFieldsValue(values);
    snapshotInicialRef.current = snapshotValoresAjustes(valoresPersistidosDesdeDatos(datos));
    prevUsarCuotaRef.current = datos.ajustes.usarCuotaInstitucional;
    prevFinalesRef.current = JSON.stringify(
      (datos.ajustes.evaluacionesFinales ?? []).map((e) => ({
        activo: Boolean(e?.activo),
        peso: e?.peso,
      })),
    );
    prevPoliticaRef.current = datos.ajustes.politicaAsistencia;
  }, [abierto, datos, form]);

  useEffect(() => {
    if (!abierto || prevUsarCuotaRef.current === undefined) return;
    if (prevUsarCuotaRef.current === usarCuotaInstWatch) return;
    prevUsarCuotaRef.current = usarCuotaInstWatch;
    return destacarSeccion('cuota');
  }, [usarCuotaInstWatch, abierto]);

  useEffect(() => {
    if (!abierto || prevFinalesRef.current === undefined) return;
    const key = JSON.stringify(
      (finalesWatch ?? []).map((e) => ({ activo: Boolean(e?.activo), peso: e?.peso })),
    );
    if (prevFinalesRef.current === key) return;
    prevFinalesRef.current = key;
    return destacarSeccion('finales');
  }, [finalesWatch, abierto]);

  useEffect(() => {
    if (!abierto || prevPoliticaRef.current === undefined) return;
    if (prevPoliticaRef.current === politicaWatch) return;
    prevPoliticaRef.current = politicaWatch;
    return destacarSeccion('asistencia');
  }, [politicaWatch, abierto]);

  const valoresActuales = useMemo(
    () => ({
      usarCuotaInstitucional: usarCuotaInstWatch,
      teoricoOverride: teoricoWatch,
      practicoOverride: practicoWatch,
      evaluacionesFinales: finalesWatch,
      politicaAsistencia: politicaWatch,
      pesoAsistencia: pesoAsistenciaWatch,
      minimoAsistencia: minimoAsistenciaWatch,
      notaReprobada: notaReprobadaWatch,
    }),
    [
      usarCuotaInstWatch,
      teoricoWatch,
      practicoWatch,
      finalesWatch,
      politicaWatch,
      pesoAsistenciaWatch,
      minimoAsistenciaWatch,
      notaReprobadaWatch,
    ],
  );

  const hayCambiosPendientes = useMemo(() => {
    if (!snapshotInicialRef.current || !datos) return false;
    return snapshotValoresAjustes(valoresActuales) !== snapshotInicialRef.current;
  }, [valoresActuales, datos]);

  const overridesActivos = useMemo(
    () => contarOverridesActivos(valoresActuales, datos),
    [valoresActuales, datos],
  );

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

  const handlePoliticaChange = (e) => {
    const next = e.target.value;
    const patch = { politicaAsistencia: next };
    if (next === 'COMPUTA_NOTA') {
      if (form.getFieldValue('pesoAsistencia') == null) {
        patch.pesoAsistencia = PESO_ASISTENCIA_SUGERIDO;
      }
      patch.minimoAsistencia = null;
      patch.notaReprobada = null;
    } else if (next === 'CAUSA_REPROBACION') {
      patch.pesoAsistencia = null;
      if (form.getFieldValue('minimoAsistencia') == null) {
        patch.minimoAsistencia = MINIMO_ASISTENCIA_SUGERIDO;
      }
      if (form.getFieldValue('notaReprobada') == null) {
        patch.notaReprobada = NOTA_REPROBADA_SUGERIDA;
      }
    } else {
      patch.pesoAsistencia = null;
      patch.minimoAsistencia = null;
      patch.notaReprobada = null;
    }
    form.setFieldsValue(patch);
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
      const guardados = await guardar(construirPayload(values));
      snapshotInicialRef.current = snapshotValoresAjustes(
        valoresPersistidosDesdeDatos(guardados) ?? construirPayload(values),
      );
      notification.success({
        message: 'Ajustes guardados',
        description: 'La configuración de este curso quedó actualizada respecto a la política institucional.',
      });
      onGuardado?.(guardados);
      onCerrar();
    } catch (err) {
      if (err?.errorFields) return;
      setErrorGuardado('No se pudo guardar. Reintentar.');
    }
  };

  const footer = (
    <div className="cal-ajustes-drawer__footer cal-eval-drawer__footer">
      {overridesActivos > 0 ? (
        <span className="cal-ajustes-drawer__footer-count">
          {overridesActivos} override{overridesActivos === 1 ? '' : 's'} activo
          {overridesActivos === 1 ? '' : 's'} en este curso
        </span>
      ) : (
        <span className="cal-ajustes-drawer__footer-count cal-ajustes-drawer__footer-count--empty" />
      )}
      <div className="cal-ajustes-drawer__footer-actions cal-eval-drawer__footer-actions">
        <Button onClick={handleCerrar} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          type="primary"
          className="cal-ajustes-drawer__btn-guardar cal-eval-drawer__btn-primary"
          loading={isSaving}
          onClick={handleGuardar}
          disabled={isLoading || !datos || !hayCambiosPendientes}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  );

  const inst = datos?.institucional;
  const ultima = datos?.ultimaModificacion ?? datos?.auditoria;

  return (
    <Drawer
      title="Ajustes de este curso"
      size={560}
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
          <AjustesCursoInstitucionalPanel
            institucional={inst}
            curso={datos.curso}
            gestionVigente={datos.gestionVigente}
          />

          <Divider className="cal-ajustes-drawer__divider-override" />

          <Alert
            type="warning"
            showIcon
            className="cal-ajustes-drawer__override-hint"
            title="Ajuste particular del curso"
            description="Los cambios siguientes aplican solo a esta asignación docente. La política institucional de la gestión no se modifica."
          />

          <div className="cal-ajustes-drawer__override-zona">
            <SeccionAjustes
              icon={PieChartOutlined}
              titulo="Ponderación teórico / práctico (este curso)"
              destacada={seccionDestacada === 'cuota'}
              className="cal-ajustes-drawer__override-card"
            >
              <Form.Item
                name="usarCuotaInstitucional"
                valuePropName="checked"
                label="Usar ponderación institucional"
                className="cal-ajustes-drawer__switch-item"
              >
                <Switch className="cal-ajustes-drawer__switch" />
              </Form.Item>

              {!usarCuotaInstWatch ? (
                <div className="cal-ajustes-drawer__cuota-row">
                  <Form.Item
                    name="teoricoOverride"
                    label="Teórico"
                    rules={[{ required: true, message: 'Requerido' }]}
                  >
                    <InputPorcentaje min={0} max={100} precision={2} />
                  </Form.Item>
                  <Form.Item
                    name="practicoOverride"
                    label="Práctico"
                    rules={[{ required: true, message: 'Requerido' }]}
                  >
                    <InputPorcentaje min={0} max={100} precision={2} />
                  </Form.Item>
                </div>
              ) : null}

              <div
                className={[
                  'cal-eval-drawer__peso-hint',
                  sumaCuota === 100
                    ? 'cal-eval-drawer__peso-hint--ok-full'
                    : 'cal-eval-drawer__peso-hint--warn',
                ].join(' ')}
              >
                Suma de ponderación: {sumaCuota}% / 100%
                {sumaCuota !== 100 ? ' — debe ser exactamente 100% para cerrar bimestres.' : ''}
              </div>
            </SeccionAjustes>

            <SeccionAjustes
              icon={FlagOutlined}
              titulo="Evaluaciones finales (este curso)"
              destacada={seccionDestacada === 'finales'}
              className="cal-ajustes-drawer__override-card"
            >
              <p className="cal-ajustes-drawer__section-desc">
                Cubren toda la materia (no un bimestre). Solo podés activar tipos que la institución
                habilitó para este curso según carrera y periodo.
              </p>

              <Form.List name="evaluacionesFinales">
                {(fields) =>
                  fields.map((field, index) => {
                    const tipo = tiposFinales[index];
                    if (!tipo) return null;
                    const habilitada = tipo.habilitadaInstitucional;
                    const activo = finalesWatch[index]?.activo;
                    const alcanceLabel = tipo.alcance
                      ? etiquetaAlcanceEvaluacionFinal(tipo.alcance)
                      : null;

                    return (
                      <div
                        key={tipo.codigo}
                        className={[
                          'cal-ajustes-drawer__final-item',
                          !habilitada ? 'cal-ajustes-drawer__final-item--disabled' : '',
                        ].join(' ')}
                      >
                        <div className="cal-ajustes-drawer__final-line1">
                          <span className="cal-ajustes-drawer__final-nombre">
                            {tipo.nombre}
                            {!habilitada ? (
                              <Tooltip title="No habilitada a nivel institucional para esta gestión">
                                <InfoCircleOutlined className="cal-ajustes-drawer__info-icon" />
                              </Tooltip>
                            ) : null}
                          </span>
                          <div className="cal-ajustes-drawer__final-line1-end">
                            {habilitada ? <FinalEstadoChip activo={Boolean(activo)} /> : null}
                            <Form.Item
                              name={[field.name, 'activo']}
                              valuePropName="checked"
                              noStyle
                            >
                              <Switch
                                disabled={!habilitada}
                                className="cal-ajustes-drawer__switch"
                                size="small"
                              />
                            </Form.Item>
                          </div>
                        </div>
                        {habilitada ? (
                          <p className="cal-ajustes-drawer__final-meta">
                            {activo
                              ? `Ponderación sobre la nota anual · ${tipo.ponderacionInstitucional ?? '—'}% institucional`
                              : `Institución: ${tipo.ponderacionInstitucional ?? '—'}%`}
                            {alcanceLabel ? ` · ${alcanceLabel}` : ''}
                          </p>
                        ) : (
                          <p className="cal-ajustes-drawer__final-meta">
                            No habilitada a nivel institucional para esta gestión
                          </p>
                        )}
                        {habilitada && activo ? (
                          <Form.Item
                            name={[field.name, 'peso']}
                            label="Ponderación sobre la nota anual"
                            className="cal-ajustes-drawer__final-peso"
                            rules={[
                              { required: true, message: 'Indicá la ponderación' },
                              {
                                validator: (_, v) =>
                                  v > 0 && v <= 100
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('Entre 0 y 100')),
                              },
                            ]}
                          >
                            <InputPorcentaje min={0.01} max={100} precision={2} />
                          </Form.Item>
                        ) : null}
                      </div>
                    );
                  })
                }
              </Form.List>

              {sumaFinales > 0 ? (
                <div className="cal-eval-drawer__peso-hint cal-eval-drawer__peso-hint--ok">
                  Suma de ponderación (evaluaciones finales activas): {sumaFinales}%
                  <Text type="secondary" className="cal-ajustes-drawer__hint-extra">
                    {' '}
                    (se combina con los 4 bimestres al calcular la nota anual)
                  </Text>
                </div>
              ) : null}
            </SeccionAjustes>

            <SeccionAjustes
              icon={CheckSquareOutlined}
              titulo="Política de asistencia (este curso)"
              destacada={seccionDestacada === 'asistencia'}
              className="cal-ajustes-drawer__override-card"
            >
              <p className="cal-ajustes-drawer__section-desc">
                Institución (gestión {datos.gestionVigente ?? '—'}):{' '}
                <strong>
                  {POLITICAS_ASISTENCIA.find(
                    (p) => p.value === inst.politicaAsistenciaDefault.politica,
                  )?.label ?? inst.politicaAsistenciaDefault.politica}
                </strong>
              </p>

              <Form.Item
                name="politicaAsistencia"
                rules={[{ required: true }]}
                className="cal-politica-asistencia-radio"
              >
                <Radio.Group style={{ width: '100%' }} onChange={handlePoliticaChange}>
                  <div className="cal-politica-asistencia-grid cal-ajustes-drawer__politica-grid">
                    {POLITICAS_ASISTENCIA.map((p) => {
                      const Icon = ICONOS_POLITICA[p.value] ?? TeamOutlined;
                      const { color, bg } = COLORES_POLITICA[p.value] ?? COLORES_POLITICA.NO_AFECTA;
                      const selected = politicaWatch === p.value;
                      return (
                        <Radio.Button
                          key={p.value}
                          value={p.value}
                          className="cal-politica-asistencia-option"
                          style={{
                            borderColor: selected ? color : '#e8e8e8',
                            background: selected ? bg : '#fff',
                          }}
                        >
                          <Flex align="flex-start" gap={12}>
                            <Icon style={{ fontSize: 22, color, marginTop: 2 }} />
                            <div>
                              <Text strong>{p.label}</Text>
                              <Paragraph
                                type="secondary"
                                style={{ margin: '4px 0 0', fontSize: 12 }}
                              >
                                {p.descripcion}
                              </Paragraph>
                            </div>
                          </Flex>
                        </Radio.Button>
                      );
                    })}
                  </div>
                </Radio.Group>
              </Form.Item>

              {politicaWatch === 'COMPUTA_NOTA' ? (
                <Form.Item
                  name="pesoAsistencia"
                  label="Ponderación de asistencia en la nota"
                  rules={[{ required: true, message: 'Indicá la ponderación' }]}
                >
                  <InputPorcentaje min={0.01} max={100} precision={2} />
                </Form.Item>
              ) : null}

              {politicaWatch === 'CAUSA_REPROBACION' ? (
                <>
                  <Form.Item
                    name="minimoAsistencia"
                    label="Asistencia mínima exigida"
                    rules={[{ required: true, message: 'Requerido' }]}
                  >
                    <InputPorcentaje min={0} max={100} precision={2} />
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
            </SeccionAjustes>
          </div>
        </Form>
      ) : null}
    </Drawer>
  );
};

export default AjustesCursoDrawer;
