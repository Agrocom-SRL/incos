/**
 * Configuración institucional de evaluación (Nivel 1) — gestión vigente.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Flex, Form, Spin, notification } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button as AtomButton } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { usePoliticaInstitucional } from '@application-academico/calificaciones/hooks/usePoliticaInstitucional.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import { CALIFICACIONES_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import { sumaPesos } from '@application-academico/calificaciones/utils/politicaPorcentajeUtils.js';
import PoliticaEvaluacionesFinalesSection from '../components/PoliticaEvaluacionesFinalesSection.jsx';
import PoliticaGestionAnteriorCard from '../components/PoliticaGestionAnteriorCard.jsx';
import PoliticaConfiguracionResumenCard from '../components/PoliticaConfiguracionResumenCard.jsx';
import PoliticaCuotaSliders from '../components/PoliticaCuotaSliders.jsx';
import PoliticaBimestresSliders from '../components/PoliticaBimestresSliders.jsx';
import PoliticaAsistenciaPanel from '../components/PoliticaAsistenciaPanel.jsx';
import PoliticaPorcentajeSlider from '../components/PoliticaPorcentajeSlider.jsx';
import { Card } from '@atoms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';
import '../styles/politica-institucional.css';

const PoliticaInstitucionalPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const {
    politica,
    politicaGestionAnterior,
    gestionVigente,
    isLoading,
    isSaving,
    error,
    refetch,
    guardar,
    breadcrumbItems,
  } = usePoliticaInstitucional();
  const [errorGuardado, setErrorGuardado] = useState(null);

  const cuotaTeorico = Form.useWatch('cuotaTeorico', form);
  const cuotaPractico = Form.useWatch('cuotaPractico', form);
  const pesosBimestres = Form.useWatch('pesosBimestres', form) ?? [];
  const notaMinimaAprobacion = Form.useWatch('notaMinimaAprobacion', form);
  const evaluacionesWatch = Form.useWatch('evaluacionesFinalesDisponibles', form);
  const asistenciaWatch = Form.useWatch('politicaAsistenciaDefault', form);

  const aplicarPoliticaAlFormulario = useCallback(
    (origen) => {
      if (!origen) return;
      form.setFieldsValue({
        cuotaTeorico: origen.cuotaTeorico,
        cuotaPractico: origen.cuotaPractico,
        pesosBimestres: [...(origen.pesosBimestres ?? [])],
        evaluacionesFinalesDisponibles: (origen.evaluacionesFinalesDisponibles ?? []).map((e) => ({
          ...e,
        })),
        politicaAsistenciaDefault: { ...origen.politicaAsistenciaDefault },
        notaMinimaAprobacion: origen.notaMinimaAprobacion ?? 61,
      });
    },
    [form],
  );

  useEffect(() => {
    if (!politica) return;
    setErrorGuardado(null);
    aplicarPoliticaAlFormulario(politica);
  }, [politica, aplicarPoliticaAlFormulario]);

  const sumaCuota = (Number(cuotaTeorico) || 0) + (Number(cuotaPractico) || 0);
  const sumaBimestres = sumaPesos(pesosBimestres);

  const valoresVista = useMemo(
    () => ({
      gestionNombre: gestionVigente ?? politica?.gestionNombre,
      configurada: politica?.configurada,
      cuotaTeorico: cuotaTeorico ?? politica?.cuotaTeorico,
      cuotaPractico: cuotaPractico ?? politica?.cuotaPractico,
      pesosBimestres: pesosBimestres?.length ? pesosBimestres : politica?.pesosBimestres,
      evaluacionesFinalesDisponibles:
        evaluacionesWatch ?? politica?.evaluacionesFinalesDisponibles,
      politicaAsistenciaDefault: asistenciaWatch ?? politica?.politicaAsistenciaDefault,
      notaMinimaAprobacion: notaMinimaAprobacion ?? politica?.notaMinimaAprobacion ?? 61,
      ultimaModificacion: politica?.ultimaModificacion,
      sumaCuota,
      sumaBimestres,
    }),
    [
      gestionVigente,
      politica,
      cuotaTeorico,
      cuotaPractico,
      pesosBimestres,
      evaluacionesWatch,
      asistenciaWatch,
      notaMinimaAprobacion,
      sumaCuota,
      sumaBimestres,
    ],
  );

  const construirPayload = useCallback(
    (values) => ({
      cuotaTeorico: values.cuotaTeorico,
      cuotaPractico: values.cuotaPractico,
      pesosBimestres: values.pesosBimestres,
      notaMinimaAprobacion: values.notaMinimaAprobacion,
      evaluacionesFinalesDisponibles: (values.evaluacionesFinalesDisponibles ?? []).map(
        (e, i) => ({
          codigo: politica?.evaluacionesFinalesDisponibles?.[i]?.codigo ?? e.codigo,
          nombre: politica?.evaluacionesFinalesDisponibles?.[i]?.nombre ?? e.nombre,
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
    }),
    [politica],
  );

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
        message: 'Configuración guardada',
        description: 'Los cursos sin override heredarán estos valores.',
      });
    } catch (err) {
      if (err?.errorFields) return;
      setErrorGuardado('No se pudo guardar. Reintentar.');
    }
  };

  const handleVolver = useCallback(() => {
    navigate(CALIFICACIONES_PATH);
  }, [navigate]);

  const handleUsarGestionAnterior = useCallback(() => {
    if (!politicaGestionAnterior) return;
    aplicarPoliticaAlFormulario(politicaGestionAnterior);
    notification.info({
      message: 'Valores aplicados',
      description: `Se copió la configuración de la gestión ${politicaGestionAnterior.gestionNombre}. Revisá y guardá para confirmar.`,
    });
  }, [aplicarPoliticaAlFormulario, politicaGestionAnterior]);

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Configuración de notas"
          breadcrumbItems={breadcrumbItems}
          actions={
            <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
              <ArrowLeftOutlined /> Volver
            </button>
          }
        />
      }
    >
      <div className="cal-politica-page">
        <Spin spinning={isLoading} tip="Cargando configuración…">
          <Flex vertical gap="large" style={{ width: '100%' }}>
            {error || errorGuardado ? (
              <Alert
                type="error"
                showIcon
                message={errorGuardado ?? error ?? 'No se pudo cargar la configuración'}
                action={
                  <Button size="small" onClick={refetch}>
                    Reintentar
                  </Button>
                }
              />
            ) : null}

            {politica ? (
              <>
                <PoliticaGestionAnteriorCard
                  politicaAnterior={politicaGestionAnterior}
                  onUsarConfiguracion={handleUsarGestionAnterior}
                  disabled={isLoading || isSaving}
                />

                <PoliticaConfiguracionResumenCard {...valoresVista} />

                <Alert
                  type="info"
                  showIcon
                  title="Nivel 1 — Política institucional"
                  description="Define los defaults de toda la gestión. Los docentes pueden hacer override por curso en Ajustes del curso."
                />

                <Form form={form} layout="vertical" className="cal-politica__form">
                  <Card
                    title="Cuota teórico / práctico (por bimestre)"
                    className="cal-politica-panel-card"
                    headerColor="primary"
                    variant="outlined"
                    shadow={false}
                  >
                    <PoliticaCuotaSliders
                      teorico={cuotaTeorico}
                      practico={cuotaPractico}
                      disabled={isSaving}
                      onChange={({ cuotaTeorico: t, cuotaPractico: p }) =>
                        form.setFieldsValue({ cuotaTeorico: t, cuotaPractico: p })
                      }
                    />
                  </Card>

                  <Card
                    title="Peso de cada bimestre en la nota anual"
                    className="cal-politica-panel-card"
                    headerColor="primary"
                    variant="outlined"
                    shadow={false}
                  >
                    <PoliticaBimestresSliders
                      pesos={pesosBimestres}
                      disabled={isSaving}
                      onChange={(next) => form.setFieldValue('pesosBimestres', next)}
                    />
                  </Card>

                  <PoliticaEvaluacionesFinalesSection
                    tipos={politica.evaluacionesFinalesDisponibles}
                  />

                  <PoliticaAsistenciaPanel form={form} disabled={isSaving} />

                  <Card
                    title="Aprobación"
                    className="cal-politica-panel-card"
                    headerColor="primary"
                    variant="outlined"
                    shadow={false}
                  >
                    <Form.Item
                      name="notaMinimaAprobacion"
                      rules={[{ required: true }]}
                      initialValue={61}
                    >
                      <PoliticaPorcentajeSlider
                        label="Nota mínima para aprobar la materia"
                        color="#196b45"
                        disabled={isSaving}
                      />
                    </Form.Item>
                  </Card>

                  <Flex className="cal-politica__actions">
                    <PermisoGuard
                      codigo={CALIFICACIONES_PERMISOS.politica}
                      accion="EDITAR"
                      fallback={
                        <AtomButton variant="primary" size="large" disabled>
                          Sin permiso para editar
                        </AtomButton>
                      }
                    >
                      <AtomButton
                        variant="primary"
                        size="large"
                        loading={isSaving}
                        onClick={handleGuardar}
                      >
                        Guardar configuración de notas
                      </AtomButton>
                    </PermisoGuard>
                  </Flex>
                </Form>
              </>
            ) : null}
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default PoliticaInstitucionalPage;
