/**
 * Bimestre cerrado — resumen práctico / teórico / total (solo lectura).
 * Un administrador puede reabrirlo para editar nuevamente el cuaderno.
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Button, Card, Flex, Spin, Switch } from 'antd';
import { ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useAcciones } from '@application-shared/hooks';
import { useBimestreConsolidado } from '@application-academico/calificaciones/hooks/useBimestreConsolidado.js';
import { useExportRegistroPedagogicoExcel } from '@application-academico/calificaciones/hooks/useExportRegistroPedagogicoExcel.js';
import { useBimestrePagerTeclado } from '@application-academico/calificaciones/hooks/useBimestrePagerTeclado.js';
import { useNavegacionBimestres } from '@application-academico/calificaciones/hooks/useNavegacionBimestres.js';
import { useRouteViewMode } from '@navigation/hooks/useRouteViewMode.js';
import {
  CALIFICACIONES_VIEW_ROUTE_KEY,
  cuadernoBimestrePath,
} from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import CuadernoContextoPanel from '../components/CuadernoContextoPanel.jsx';
import BimestreConsolidadoSeparador from '../components/BimestreConsolidadoSeparador.jsx';
import BimestreConsolidadoGrid from '../components/BimestreConsolidadoGrid.jsx';
import BimestreConsolidadoBimestrePager from '../components/BimestreConsolidadoBimestrePager.jsx';
import CuadernoSkeleton from '../components/CuadernoSkeleton.jsx';
import { calificacionesSectionCardProps } from '../utils/calificacionesSectionCard.js';
import '@presentation/styles/pages/detail-page.css';
import '../styles/calificaciones.css';

const hojaCardProps = {
  ...calificacionesSectionCardProps,
  styles: {
    body: { padding: 0 },
  },
};

const BimestreConsolidadoPage = () => {
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();
  const { contextName: docenteNombreCoordinacion } = useRouteViewMode(CALIFICACIONES_VIEW_ROUTE_KEY);
  const ajusteAdmin = useAcciones(CALIFICACIONES_PERMISOS.bimestreAjusteAdmin);
  const puedeEdicionAdmin = ajusteAdmin.puedeEditar;
  const {
    curso,
    docente,
    estudiantes,
    evaluaciones,
    cuotaTeorico,
    cuotaPractico,
    bimestreActivo,
    bimestreVigente,
    bimestreTitulo,
    periodoConsolidado,
    isLoading,
    isRefetching,
    error,
    breadcrumbItems,
    tituloPagina,
    volverPath,
    cursoId,
    esVistaCoordinacion,
    reabrirBimestre,
  } = useBimestreConsolidado();

  const { exportar: exportarRegistroPedagogico, loading: exportandoExcel } =
    useExportRegistroPedagogicoExcel();

  const handleExportarRegistro = useCallback(async () => {
    const result = await exportarRegistroPedagogico(cursoId, bimestreActivo);
    if (!result.success) {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintente en unos segundos.',
      });
    }
  }, [exportarRegistroPedagogico, cursoId, bimestreActivo, notification]);

  const navegacionBimestres = useNavegacionBimestres(cursoId, bimestreActivo, bimestreVigente);
  useBimestrePagerTeclado({
    habilitado: Boolean(cursoId) && !isLoading,
    puedeAnterior: navegacionBimestres.puedeAnterior,
    puedeSiguiente: navegacionBimestres.puedeSiguiente,
    onAnterior: navegacionBimestres.irAnterior,
    onSiguiente: navegacionBimestres.irSiguiente,
  });

  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [reabriendo, setReabriendo] = useState(false);

  const estudiantesFiltrados = useMemo(() => {
    const q = busquedaEstudiante.trim().toLowerCase();
    if (!q) return estudiantes;
    return estudiantes.filter((e) => {
      const nombre = (e.nombre ?? '').toLowerCase();
      const codigo = (e.codigo ?? '').toLowerCase();
      const nro = String(e.nro ?? '');
      return nombre.includes(q) || codigo.includes(q) || nro.includes(q);
    });
  }, [estudiantes, busquedaEstudiante]);

  const handleReabrir = useCallback(async () => {
    setReabriendo(true);
    try {
      await reabrirBimestre();
      notification.success({
        title: 'Bimestre reabierto',
        description: 'El bimestre quedó abierto para editar el cuaderno.',
      });
      navigate(cuadernoBimestrePath(cursoId, bimestreActivo));
    } catch (err) {
      notification.error({
        title: 'No se pudo reabrir el bimestre',
        description: typeof err?.message === 'string' ? err.message : 'Reintente en unos segundos.',
      });
      setReabriendo(false);
    }
  }, [reabrirBimestre, notification, navigate, cursoId, bimestreActivo]);

  const handleToggleReabrir = useCallback(
    (checked) => {
      if (!checked) return;
      modal.confirm({
        title: 'Reabrir bimestre',
        okText: 'Reabrir',
        cancelText: 'Cancelar',
        content: (
          <span>
            El bimestre quedará <strong>abierto para edición</strong>: el docente podrá modificar
            evaluaciones y notas del cuaderno de {bimestreTitulo}. Deberá cerrarlo nuevamente para
            consolidarlo.
          </span>
        ),
        onOk: handleReabrir,
      });
    },
    [modal, bimestreTitulo, handleReabrir],
  );

  const tituloHeader = (
    <Flex align="center" wrap="wrap" gap={8} className="cal-cuaderno-page-title">
      <BimestreConsolidadoBimestrePager
        asignacionId={cursoId}
        bimestreActivo={bimestreActivo}
        bimestreVigente={bimestreVigente}
      />
      <span>{tituloPagina}</span>
    </Flex>
  );

  const pageHeader = (
    <PageHeader
      title={tituloHeader}
      breadcrumbItems={breadcrumbItems}
      actions={
        <Flex gap={8} wrap="wrap">
          <ActionButton
            permiso={CALIFICACIONES_PERMISOS.cuaderno}
            accion="EXPORTAR"
            variant="info"
            icon={<FileExcelOutlined />}
            loading={exportandoExcel}
            disabled={isLoading || estudiantes.length === 0}
            onClick={handleExportarRegistro}
          >
            Registro pedagógico
          </ActionButton>
          <BackButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(volverPath)}
            aria-label="Volver al registro académico"
          >
            Volver
          </BackButton>
        </Flex>
      }
    />
  );

  const cardContexto = (
    <Card className="cal-cuaderno-contexto-card" {...calificacionesSectionCardProps}>
      <CuadernoContextoPanel
        curso={curso}
        docente={docente}
        bimestreTitulo={bimestreTitulo}
        bimestreActivo={bimestreActivo}
        bimestreVigente={bimestreVigente}
        modoEdicion={false}
        esVistaCoordinacion={esVistaCoordinacion}
        docenteNombre={docenteNombreCoordinacion}
      />
    </Card>
  );

  const toolbarAdmin = puedeEdicionAdmin ? (
    <Flex
      align="center"
      justify="space-between"
      wrap="wrap"
      gap={12}
      className="cal-bimestre-consolidado-toolbar"
    >
      <Flex align="center" gap={8}>
        <Switch
          checked={reabriendo}
          loading={reabriendo}
          onChange={handleToggleReabrir}
          aria-label="Reabrir bimestre para editar el cuaderno"
        />
        <span className="cal-bimestre-consolidado-toolbar__label">
          Reabrir bimestre para editar el cuaderno
        </span>
      </Flex>
    </Flex>
  ) : null;

  const cardGrilla = (
    <Card className="cal-cuaderno-hoja-card cal-bimestre-consolidado-card" {...hojaCardProps}>
      <div className="cal-cuaderno-hoja cal-bimestre-consolidado">
        {toolbarAdmin}
        <BimestreConsolidadoSeparador
          bimestreTitulo={bimestreTitulo}
          fechaInicio={periodoConsolidado?.fechaInicio}
          fechaFin={periodoConsolidado?.fechaFin}
          busqueda={busquedaEstudiante}
          onBusquedaChange={setBusquedaEstudiante}
          totalEstudiantes={estudiantes.length}
          filtrados={estudiantesFiltrados.length}
        />
        <BimestreConsolidadoGrid
          estudiantes={estudiantesFiltrados}
          bimestreTitulo={bimestreTitulo}
          cuotaTeorico={cuotaTeorico}
          cuotaPractico={cuotaPractico}
          soloLectura
          evaluacionesCount={evaluaciones.length}
        />
        <p className="cal-bimestre-consolidado-leyenda" role="note">
          Consolidado de solo lectura del bimestre cerrado (máx. {cuotaPractico + cuotaTeorico} pts =
          práctico + teórico). Un administrador puede reabrirlo para que el docente vuelva a editar el
          cuaderno.
        </p>
      </div>
    </Card>
  );

  if (isLoading && estudiantes.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <CuadernoSkeleton />
        </MainContent>
      </Flex>
    );
  }

  if (error && estudiantes.length === 0) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>{pageHeader}</PageHeaderArea>
        <MainContent>
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el consolidado"
            description={typeof error === 'string' ? error : String(error)}
            action={
              <Button size="small" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            }
          />
        </MainContent>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>{pageHeader}</PageHeaderArea>

      <MainContent>
        <Spin spinning={isRefetching} tip="Actualizando consolidado…">
          <Flex vertical gap={allSpacing.marginLG} className="sd cal-cuaderno cal-bimestre-consolidado-page">
            {error ? (
              <Alert
                type="error"
                showIcon
                title="Error al actualizar"
                description={typeof error === 'string' ? error : String(error)}
              />
            ) : null}
            {cardContexto}
            {cardGrilla}
          </Flex>
        </Spin>
      </MainContent>
    </Flex>
  );
};

export default BimestreConsolidadoPage;
