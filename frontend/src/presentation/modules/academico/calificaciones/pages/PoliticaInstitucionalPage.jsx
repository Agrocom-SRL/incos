/**
 * Configuración institucional de evaluación (Nivel 1) — gestión vigente.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button as AtomButton } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { usePoliticaInstitucional } from '@application-academico/calificaciones/hooks/usePoliticaInstitucional.js';
import { usePoliticaCatalogo } from '@application-academico/calificaciones/hooks/usePoliticaCatalogo.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import { CALIFICACIONES_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import { sumaPesos } from '@application-academico/calificaciones/utils/politicaPorcentajeUtils.js';
import PoliticaConfiguracionResumenCard, {
  buildResumenDesdePolitica,
} from '../components/PoliticaConfiguracionResumenCard.jsx';
import PoliticaPonderacionTeoricoPractico from '../components/PoliticaPonderacionTeoricoPractico.jsx';
import PoliticaPonderacionBimestres from '../components/PoliticaPonderacionBimestres.jsx';
import PoliticaEvaluacionesFinalesReglasSection from '../components/PoliticaEvaluacionesFinalesReglasSection.jsx';
import PoliticaAsistenciaPanel from '../components/PoliticaAsistenciaPanel.jsx';
import PoliticaPorcentajeSlider from '../components/PoliticaPorcentajeSlider.jsx';
import { Card } from '@atoms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';
import '../styles/politica-institucional.css';

const PoliticaInstitucionalPage = () => {
  const navigate = useNavigate();
  const { message, notification } = App.useApp();
  const [form] = Form.useForm();
  const {
    politica,
    politicaGestionAnterior,
    gestionVigente,
    isLoading: isLoadingPolitica,
    isSaving,
    error: errorPolitica,
    refetch: refetchPolitica,
    guardar,
    breadcrumbItems,
  } = usePoliticaInstitucional();
  const {
    catalogo,
    isLoading: isLoadingCatalogo,
    error: errorCatalogo,
    refetch: refetchCatalogo,
  } = usePoliticaCatalogo();
  const [errorGuardado, setErrorGuardado] = useState(null);

  const isLoading = isLoadingPolitica || isLoadingCatalogo;
  const error = errorPolitica || errorCatalogo;
  const refetch = () => {
    refetchPolitica();
    refetchCatalogo();
  };

  const cuotaTeorico = Form.useWatch('cuotaTeorico', form);
  const cuotaPractico = Form.useWatch('cuotaPractico', form);
  const pesosBimestres = Form.useWatch('pesosBimestres', form) ?? [];
  const notaMinimaAprobacion = Form.useWatch('notaMinimaAprobacion', form);
  const reglasFinalesWatch = Form.useWatch('evaluacionesFinalesReglas', form);
  const asistenciaWatch = Form.useWatch('politicaAsistenciaDefault', form);

  const tiposEvaluacion = catalogo?.tiposEvaluacionFinales ?? [];
  const carrerasCatalogo = catalogo?.carreras ?? [];
  const periodosCatalogo = catalogo?.periodosPlan ?? [];

  const mostrarResumenAnterior = Boolean(
    politica && !politica.configurada && politicaGestionAnterior?.configurada,
  );

  const aplicarPoliticaAlFormulario = useCallback(
    (origen) => {
      if (!origen) return;
      form.setFieldsValue({
        cuotaTeorico: origen.cuotaTeorico,
        cuotaPractico: origen.cuotaPractico,
        pesosBimestres: [...(origen.pesosBimestres ?? [25, 25, 25, 25])],
        evaluacionesFinalesReglas: (origen.evaluacionesFinalesReglas ?? []).map((r) => ({
          ...r,
          id: r.id ?? `regla-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        })),
        politicaAsistenciaDefault: { ...(origen.politicaAsistenciaDefault ?? { politica: 'NO_AFECTA' }) },
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

  const resumenVigente = useMemo(() => {
    const base = {
      gestionNombre: gestionVigente ?? politica?.gestionNombre,
      configurada: politica?.configurada,
      cuotaTeorico: cuotaTeorico ?? politica?.cuotaTeorico,
      cuotaPractico: cuotaPractico ?? politica?.cuotaPractico,
      pesosBimestres: pesosBimestres?.length ? pesosBimestres : politica?.pesosBimestres,
      evaluacionesFinalesReglas:
        reglasFinalesWatch ?? politica?.evaluacionesFinalesReglas ?? [],
      politicaAsistenciaDefault: asistenciaWatch ?? politica?.politicaAsistenciaDefault,
      notaMinimaAprobacion: notaMinimaAprobacion ?? politica?.notaMinimaAprobacion ?? 61,
      ultimaModificacion: politica?.ultimaModificacion,
      sumaCuota,
      sumaBimestres,
    };
    return buildResumenDesdePolitica(base, {
      carreras: carrerasCatalogo,
      periodos: periodosCatalogo,
    });
  }, [
    gestionVigente,
    politica,
    cuotaTeorico,
    cuotaPractico,
    pesosBimestres,
    reglasFinalesWatch,
    asistenciaWatch,
    notaMinimaAprobacion,
    sumaCuota,
    sumaBimestres,
    carrerasCatalogo,
    periodosCatalogo,
  ]);

  const resumenAnterior = useMemo(
    () =>
      buildResumenDesdePolitica(politicaGestionAnterior, {
        carreras: carrerasCatalogo,
        periodos: periodosCatalogo,
      }),
    [politicaGestionAnterior, carrerasCatalogo, periodosCatalogo],
  );

  const construirPayload = useCallback((values) => {
    const pad = values.politicaAsistenciaDefault ?? { politica: 'NO_AFECTA' };
    const codigoAsistencia = pad.politica ?? 'NO_AFECTA';
    return {
      cuotaTeorico: values.cuotaTeorico,
      cuotaPractico: values.cuotaPractico,
      pesosBimestres: values.pesosBimestres,
      notaMinimaAprobacion: values.notaMinimaAprobacion,
      evaluacionesFinalesReglas: (values.evaluacionesFinalesReglas ?? []).map((r) => ({
        id: r.id,
        tipoEvaluacionCodigo: r.tipoEvaluacionCodigo,
        tipoEvaluacionNombre: r.tipoEvaluacionNombre,
        ponderacion: r.ponderacion,
        alcance: r.alcance,
        carreraId: r.carreraId ?? null,
        carreraNombre: r.carreraNombre ?? null,
        periodoId: r.periodoId ?? null,
        periodoNombre: r.periodoNombre ?? null,
      })),
      politicaAsistenciaDefault: {
        politica: codigoAsistencia,
        pesoAsistencia: codigoAsistencia === 'COMPUTA_NOTA' ? pad.pesoAsistencia : null,
        minimoAsistencia:
          codigoAsistencia === 'CAUSA_REPROBACION' ? pad.minimoAsistencia : null,
        notaReprobada: codigoAsistencia === 'CAUSA_REPROBACION' ? pad.notaReprobada : null,
      },
    };
  }, []);

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      if (Math.abs(sumaCuota - 100) > 0.01) {
        message.warning('La ponderación teórico + práctico debe sumar 100%');
        return;
      }
      if (Math.abs(sumaBimestres - 100) > 0.01) {
        message.warning('La ponderación de los 4 bimestres debe sumar 100%');
        return;
      }
      setErrorGuardado(null);
      await guardar(construirPayload(values));
      notification.success({
        title: 'Configuración guardada',
        description: 'Los cursos sin override heredarán estos valores.',
      });
    } catch (err) {
      if (err?.errorFields) return;
      setErrorGuardado(err?.message || 'No se pudo guardar. Reintentar.');
    }
  };

  const handleVolver = useCallback(() => {
    navigate(CALIFICACIONES_PATH);
  }, [navigate]);

  const handleUsarGestionAnterior = useCallback(async () => {
    if (!politicaGestionAnterior || isSaving) return;
    try {
      setErrorGuardado(null);
      const guardada = await guardar(construirPayload(politicaGestionAnterior));
      if (guardada) {
        aplicarPoliticaAlFormulario(guardada);
      }
      notification.success({
        title: 'Configuración copiada y guardada',
        description: `Se aplicó la configuración de ${politicaGestionAnterior.gestionNombre} a ${gestionVigente ?? politica?.gestionNombre}.`,
      });
    } catch (err) {
      setErrorGuardado(err?.message || 'No se pudo copiar la configuración. Reintentar.');
    }
  }, [
    politicaGestionAnterior,
    isSaving,
    guardar,
    construirPayload,
    aplicarPoliticaAlFormulario,
    gestionVigente,
    politica?.gestionNombre,
  ]);

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
                {mostrarResumenAnterior && resumenAnterior ? (
                  <PoliticaConfiguracionResumenCard
                    variant="anterior"
                    gestionVigenteNombre={gestionVigente ?? politica.gestionNombre}
                    {...resumenAnterior}
                    onUsarConfiguracion={handleUsarGestionAnterior}
                    usarConfiguracionDisabled={isLoading || isSaving}
                  />
                ) : resumenVigente ? (
                  <PoliticaConfiguracionResumenCard variant="vigente" {...resumenVigente} />
                ) : null}

                <Form form={form} layout="vertical" className="cal-politica__form">
                  <Card
                    title="Ponderación teórico / práctico (gestión)"
                    className="cal-politica-panel-card"
                    headerColor="primary"
                    variant="outlined"
                    shadow={false}
                  >
                    <PoliticaPonderacionTeoricoPractico form={form} disabled={isSaving} />
                  </Card>

                  <Card
                    title="Ponderación de cada bimestre en la nota anual"
                    className="cal-politica-panel-card"
                    headerColor="primary"
                    variant="outlined"
                    shadow={false}
                  >
                    <PoliticaPonderacionBimestres form={form} disabled={isSaving} />
                  </Card>

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

                  <PoliticaEvaluacionesFinalesReglasSection
                    form={form}
                    tiposEvaluacion={tiposEvaluacion}
                    carreras={carrerasCatalogo}
                    periodos={periodosCatalogo}
                    catalogoLoading={isLoadingCatalogo}
                    disabled={isSaving}
                  />

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
