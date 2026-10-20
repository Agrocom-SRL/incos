/**
 * Preview del folio (P3) — réplica en pantalla del folio físico del
 * centralizador ("LIBRO LLENADO SISTEMAS 11 dic 2025"): cabecera institucional
 * y nómina con nota final por materia. Anular gated por APROBAR; edición de
 * la observación de fila gated por EDITAR y deshabilitada si el folio está
 * ANULADO (terminal).
 *
 * Bloque de firmas condicionado al estado del LIBRO (`folio.libroEstado`, no
 * del folio: el folio no tiene un estado "firmado" propio) — mismo criterio
 * que el export Excel (`ExportLibroExcelUseCase`): con el libro ABIERTO se
 * muestra una nota "DOCUMENTO BORRADOR" en vez de las firmas.
 */

import { useState } from 'react';
import { Alert, Empty, Spin } from 'antd';
import { EditOutlined, FileTextOutlined, StopOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, IconButton, StatusPill } from '@atoms';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useAuthContext } from '@application-auth';
import { useFolioPreview } from '@application-academico/libros/hooks';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';
import { LIBRO_DOC } from '@application-academico/libros/utils/libroDoc';
import {
  formatFolioEstadoDisplay,
  formatEstadoAcademico,
  getFolioEstadoDisplayPillClass,
  getEstadoAcademicoPillClass,
} from '@application-academico/libros/utils/librosEstados';
import EditarFilaFolioModal from '../components/organisms/EditarFilaFolioModal.jsx';
import AnularFolioModal from '../components/organisms/AnularFolioModal.jsx';
import '@presentation/styles/pages/detail-page.css';
import '../styles/libros.css';

const formatCi = (ci, expedicion) => [ci, expedicion].filter(Boolean).join(' ') || '—';

const FolioPreviewPage = () => {
  const { hasPermiso } = useAuthContext();
  const {
    folio,
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    handleVolverAlLibro,

    handleAnular,
    cambiandoEstado,

    filaEnEdicion,
    abrirEdicionFila,
    cerrarEdicionFila,
    handleGuardarFila,
    guardandoFila,
  } = useFolioPreview();

  const [anularModalOpen, setAnularModalOpen] = useState(false);

  const puedeAprobar = hasPermiso(LIBROS_PERMISOS.libro, 'APROBAR');
  const puedeEditarFila = hasPermiso(LIBROS_PERMISOS.libro, 'EDITAR');

  const headerActions = <DetailPageHeaderActions onVolver={handleVolverAlLibro} />;

  if (isInvalidId) {
    return (
      <PageTemplate header={<PageHeader title="Folio" breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
        <Alert type="error" showIcon title="Identificador de libro o folio inválido" />
      </PageTemplate>
    );
  }

  const esAnulado = folio?.estado === 'ANULADO';
  const esLibroCerrado = folio?.libroEstado === 'CERRADO';
  // Las observaciones se cargan mientras el libro está ABIERTO; al cerrarlo
  // quedan congeladas (igual criterio que las firmas / el bloque ESTADÍSTICAS
  // del export Excel).
  const filaEditable = puedeEditarFila && !esAnulado && !esLibroCerrado;
  const puedeAnular = puedeAprobar && folio?.estado === 'BORRADOR';

  const handleAnularConfirmado = async (motivo) => {
    const result = await handleAnular(motivo);
    if (result.success) setAnularModalOpen(false);
  };

  return (
    <PageTemplate
      header={<PageHeader title="Folio" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
      sidebar={null}
    >
      <Spin spinning={loading} size="large" tip="Cargando folio…">
        <div className="sd sd-spin-body">
          {!loading && error ? (
            <Alert type="error" showIcon title="No se pudo cargar el folio" description={error} style={{ marginBottom: 16 }} />
          ) : null}

          {!loading && !error && !folio ? (
            <Empty description="No se encontró el folio solicitado." style={{ marginTop: 32 }} />
          ) : null}

          {!loading && !error && folio ? (
            <>
              <DetailProfileCard
                avatarInitials={<FileTextOutlined />}
                active={!esAnulado}
                title={folio.folioLabel}
                subtitle={`${folio.cursoLabel} · ${folio.turno || '—'}`}
                metaExtra={
                  <StatusPill
                    label={formatFolioEstadoDisplay(folio.estado, folio.libroEstado)}
                    className={getFolioEstadoDisplayPillClass(folio.estado, folio.libroEstado)}
                  />
                }
                actions={
                  puedeAnular ? (
                    <ActionButton
                      permiso={LIBROS_PERMISOS.libro}
                      accion="APROBAR"
                      variant="danger"
                      icon={<StopOutlined />}
                      onClick={() => setAnularModalOpen(true)}
                    >
                      Anular folio
                    </ActionButton>
                  ) : null
                }
              />

              <article className="folio-sheet">
                <div className="folio-sheet__band">{LIBRO_DOC.titulo}</div>

                <div className="folio-sheet__meta">
                  <div className="folio-sheet__meta-col">
                    <div className="folio-sheet__meta-row">
                      <span className="folio-sheet__meta-label">Código de registro</span>
                      <span className="folio-sheet__meta-value">{folio.codigoRegistro || '—'}</span>
                    </div>
                    <div className="folio-sheet__meta-row">
                      <span className="folio-sheet__meta-label">Libro N°</span>
                      <span className="folio-sheet__meta-value">{folio.numeroLibro ?? '—'}</span>
                    </div>
                    <div className="folio-sheet__meta-row">
                      <span className="folio-sheet__meta-label">Folio N°</span>
                      <span className="folio-sheet__meta-value">{folio.numeroFolio ?? '—'}</span>
                    </div>
                    <div className="folio-sheet__meta-row">
                      <span className="folio-sheet__meta-label">Turno</span>
                      <span className="folio-sheet__meta-value">{folio.turno || '—'}</span>
                    </div>
                  </div>
                  <div className="folio-sheet__meta-col">
                    <div className="folio-sheet__meta-row">
                      <span className="folio-sheet__meta-label">Institución</span>
                      <span className="folio-sheet__meta-value">{LIBRO_DOC.institucion}</span>
                    </div>
                    <div className="folio-sheet__meta-row">
                      <span className="folio-sheet__meta-label">R.M.</span>
                      <span className="folio-sheet__meta-value">{LIBRO_DOC.resolucionMinisterial} · {LIBRO_DOC.caracter}</span>
                    </div>
                    <div className="folio-sheet__meta-row">
                      <span className="folio-sheet__meta-label">Gestión</span>
                      <span className="folio-sheet__meta-value">{folio.gestionNombre || folio.gestionAnio || '—'}</span>
                    </div>
                    <div className="folio-sheet__meta-row">
                      <span className="folio-sheet__meta-label">Carrera</span>
                      <span className="folio-sheet__meta-value">{folio.carreraNombre || '—'} · {LIBRO_DOC.nivel} · {LIBRO_DOC.regimen}</span>
                    </div>
                  </div>
                </div>

                <div className="folio-sheet__curso">{folio.cursoLabel}</div>

                <div className="folio-sheet__table-wrap">
                  <table className="folio-sheet__table">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Nómina</th>
                        <th>C.I.</th>
                        {(folio.asignaturas ?? []).map((asignatura) => (
                          <th key={asignatura.ofertaCursoId} title={asignatura.nombre}>
                            {asignatura.sigla || asignatura.nombre}
                          </th>
                        ))}
                        <th>Estado</th>
                        <th>Observaciones</th>
                        {filaEditable ? <th aria-hidden /> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {(folio.estudiantes ?? []).map((fila) => (
                        <tr key={fila.id}>
                          <td>{fila.numeroOrden}</td>
                          <td className="folio-sheet__nomina">{fila.nombreCompleto}</td>
                          <td>{formatCi(fila.ci, fila.expedicion)}</td>
                          {(folio.asignaturas ?? []).map((asignatura) => {
                            const valor = fila.celdas?.[asignatura.ofertaCursoId] ?? 'NP';
                            const esNp = valor === 'NP';
                            return (
                              <td key={asignatura.ofertaCursoId} className={esNp ? 'folio-sheet__np' : undefined}>
                                {valor}
                              </td>
                            );
                          })}
                          <td>
                            <StatusPill
                              label={formatEstadoAcademico(fila.estadoAcademico)}
                              className={getEstadoAcademicoPillClass(fila.estadoAcademico)}
                            />
                          </td>
                          <td>{fila.observaciones || '—'}</td>
                          {filaEditable ? (
                            <td className="folio-sheet__acciones">
                              <IconButton
                                icon={<EditOutlined />}
                                variant="warning"
                                size="small"
                                title="Editar observación"
                                onClick={() => abrirEdicionFila(fila)}
                              />
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {esLibroCerrado ? (
                  <div className="folio-sheet__firmas">
                    {LIBRO_DOC.firmas.map((firma) => (
                      <div className="folio-sheet__firma" key={firma}>
                        <div className="folio-sheet__firma-line" />
                        <span className="folio-sheet__firma-label">{firma}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="folio-sheet__borrador-nota">
                    DOCUMENTO BORRADOR — sin firmas; el libro aún está ABIERTO y la numeración puede reajustarse
                  </div>
                )}

                <div className="folio-sheet__leyenda">
                  {LIBRO_DOC.leyendaNotas.map((linea) => (
                    <div key={linea}>{linea}</div>
                  ))}
                </div>
              </article>
            </>
          ) : null}
        </div>
      </Spin>

      <EditarFilaFolioModal
        open={Boolean(filaEnEdicion)}
        fila={filaEnEdicion}
        guardando={guardandoFila}
        onGuardar={handleGuardarFila}
        onCancelar={cerrarEdicionFila}
      />

      <AnularFolioModal
        open={anularModalOpen}
        anulando={cambiandoEstado}
        onAnular={handleAnularConfirmado}
        onCancelar={() => setAnularModalOpen(false)}
      />
    </PageTemplate>
  );
};

export default FolioPreviewPage;
