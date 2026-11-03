import { vi } from 'vitest';
import { describeDetailPage, describeFormPage } from '@/test/pageContracts';
import ActividadFormPage from '../actividades/pages/ActividadFormPage';
import ActividadDetailPage from '../actividades/pages/ActividadDetailPage';
import ApoderadoFormPage from '../complementarios/pages/ApoderadoFormPage';
import ApoderadoDetailPage from '../complementarios/pages/ApoderadoDetailPage';
import DiscapacidadFormPage from '../complementarios/pages/DiscapacidadFormPage';
import DiscapacidadDetailPage from '../complementarios/pages/DiscapacidadDetailPage';
import EstadoCivilFormPage from '../complementarios/pages/EstadoCivilFormPage';
import EstadoCivilDetailPage from '../complementarios/pages/EstadoCivilDetailPage';
import IdiomaFormPage from '../complementarios/pages/IdiomaFormPage';
import IdiomaDetailPage from '../complementarios/pages/IdiomaDetailPage';
import DocumentacionFormPage from '../documentacion/pages/DocumentacionFormPage';
import DocumentacionDetailPage from '../documentacion/pages/DocumentacionDetailPage';
import AulaFormPage from '../recursos/pages/AulaFormPage';
import AulaDetailPage from '../recursos/pages/AulaDetailPage';
import TipoEvaluacionFormPage from '../recursos/pages/TipoEvaluacionFormPage';
import TipoEvaluacionDetailPage from '../recursos/pages/TipoEvaluacionDetailPage';

const mocks = vi.hoisted(() => {
  const m = {};
  [
    'actividadForm', 'actividadDetalle', 'apoderadoForm', 'apoderadoDetalle', 'discapacidadForm', 'discapacidadDetalle',
    'estadoCivilForm', 'estadoCivilDetalle', 'idiomaForm', 'idiomaDetalle', 'documentacionForm', 'documentacionDetalle',
    'aulaForm', 'aulaDetalle', 'tipoEvaluacionForm', 'tipoEvaluacionDetalle',
  ].forEach((k) => { m[k] = vi.fn(); });
  return m;
});

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-configuracion/actividades/hooks', async (orig) => ({ ...(await orig()), useActividadForm: mocks.actividadForm, useActividadDetallePage: mocks.actividadDetalle }));
vi.mock('@application-configuracion/complementarios/hooks', async (orig) => ({
  ...(await orig()),
  useApoderadoForm: mocks.apoderadoForm,
  useApoderadoDetallePage: mocks.apoderadoDetalle,
  useDiscapacidadForm: mocks.discapacidadForm,
  useDiscapacidadDetallePage: mocks.discapacidadDetalle,
  useEstadoCivilForm: mocks.estadoCivilForm,
  useEstadoCivilDetallePage: mocks.estadoCivilDetalle,
  useIdiomaForm: mocks.idiomaForm,
  useIdiomaDetallePage: mocks.idiomaDetalle,
}));
vi.mock('@application-configuracion/documentacion/hooks', async (orig) => ({ ...(await orig()), useDocumentacionForm: mocks.documentacionForm, useDocumentacionDetallePage: mocks.documentacionDetalle }));
vi.mock('@application-configuracion/recursos/hooks', async (orig) => ({
  ...(await orig()),
  useAulaForm: mocks.aulaForm,
  useAulaDetallePage: mocks.aulaDetalle,
  useTipoEvaluacionForm: mocks.tipoEvaluacionForm,
  useTipoEvaluacionDetallePage: mocks.tipoEvaluacionDetalle,
}));

const entidad = { id: 1, nombre: 'Entidad de prueba', activo: true };

const casos = [
  { name: 'Actividad', Form: ActividadFormPage, Detail: ActividadDetailPage, f: 'actividadForm', d: 'actividadDetalle', key: 'actividad', perm: 'configuracion.actividad', save: 'Guardar actividad', sec: 'datosActividad', inv: 'Identificador de actividad inválido', empty: 'No se encontró la actividad solicitada', edit: 'Editar actividad', extra: { tipoLabel: 'Académica' } },
  { name: 'Apoderado', Form: ApoderadoFormPage, Detail: ApoderadoDetailPage, f: 'apoderadoForm', d: 'apoderadoDetalle', key: 'apoderado', perm: 'configuracion.complementario.apoderados', save: 'Guardar apoderado', sec: 'datosApoderado', inv: 'Identificador de apoderado inválido', empty: 'No se encontró el apoderado solicitado', edit: 'Editar apoderado' },
  { name: 'Discapacidad', Form: DiscapacidadFormPage, Detail: DiscapacidadDetailPage, f: 'discapacidadForm', d: 'discapacidadDetalle', key: 'discapacidad', perm: 'configuracion.complementario.discapacidad', save: 'Guardar tipo de discapacidad', sec: 'datosDiscapacidad', inv: 'Identificador de tipo de discapacidad inválido', empty: 'No se encontró el tipo de discapacidad solicitado', edit: 'Editar tipo de discapacidad' },
  { name: 'Estado civil', Form: EstadoCivilFormPage, Detail: EstadoCivilDetailPage, f: 'estadoCivilForm', d: 'estadoCivilDetalle', key: 'estadoCivil', perm: 'configuracion.complementario.estado-civil', save: 'Guardar estado civil', sec: 'datosEstadoCivil', inv: 'Identificador de estado civil inválido', empty: 'No se encontró el estado civil solicitado', edit: 'Editar estado civil' },
  { name: 'Idioma', Form: IdiomaFormPage, Detail: IdiomaDetailPage, f: 'idiomaForm', d: 'idiomaDetalle', key: 'idioma', perm: 'configuracion.complementario.idiomas', save: 'Guardar idioma', sec: 'datosIdioma', inv: 'Identificador de idioma inválido', empty: 'No se encontró el idioma solicitado', edit: 'Editar idioma' },
  { name: 'Documentación', Form: DocumentacionFormPage, Detail: DocumentacionDetailPage, f: 'documentacionForm', d: 'documentacionDetalle', key: 'documento', perm: 'configuracion.documentacion', save: 'Guardar documento', sec: 'datosDocumentacion', inv: 'Identificador de documento inválido', empty: 'No se encontró el documento solicitado', edit: 'Editar documento' },
  { name: 'Aula', Form: AulaFormPage, Detail: AulaDetailPage, f: 'aulaForm', d: 'aulaDetalle', key: 'aula', perm: 'configuracion.aula', save: 'Guardar aula', sec: 'datosAula', inv: 'Identificador de aula inválido', empty: 'No se encontró el aula solicitada', edit: 'Editar aula' },
  { name: 'Tipo de evaluación', Form: TipoEvaluacionFormPage, Detail: TipoEvaluacionDetailPage, f: 'tipoEvaluacionForm', d: 'tipoEvaluacionDetalle', key: 'tipoEvaluacion', perm: 'configuracion.tipo-evaluacion', save: 'Guardar tipo de evaluación', sec: 'datosTipoEvaluacion', inv: 'Identificador de tipo de evaluación inválido', empty: 'No se encontró el tipo de evaluación solicitado', edit: 'Editar tipo de evaluación' },
];

casos.forEach((c) => {
  describeFormPage({
    name: `Formulario de ${c.name}`,
    Page: c.Form,
    useHook: mocks[c.f],
    permisoCodigo: c.perm,
    saveLabel: c.save,
    invalidTitle: c.inv,
    sectionKey: c.sec,
  });
  describeDetailPage({
    name: `Ficha de ${c.name}`,
    Page: c.Detail,
    useHook: mocks[c.d],
    entityKey: c.key,
    entity: entidad,
    title: 'ENTIDAD DE PRUEBA',
    invalidTitle: c.inv,
    emptyText: c.empty,
    permisoCodigo: c.perm,
    editLabel: c.edit,
    extraState: c.extra,
  });
});
