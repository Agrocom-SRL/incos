/**
 * Providers delgados (hook de estado -> Context): cada uno debe publicar tal cual
 * el valor de su hook. Los hooks se simulan; los Context son los reales.
 */
import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const H = vi.hoisted(() => ({
  valores: {},
  llamadas: [],
  hook(nombre, args) {
    H.llamadas.push([nombre, args]);
    return H.valores[nombre];
  },
}));

vi.mock('@application-docentes/hooks', () => ({ useDocentesDetailPage: (...a) => H.hook('useDocentesDetailPage', a) }));
vi.mock('@application-docentes/hooks/api/useDocentesApi', () => ({ useDocentesApi: (...a) => H.hook('useDocentesApi', a) }));
vi.mock('@application-docentes/hooks/state/useDocentesFormPage', () => ({ useDocentesFormPage: (...a) => H.hook('useDocentesFormPage', a) }));
vi.mock('@/application/modules/configuracion/academico/hooks/features/useMateriasList', () => ({ useMateriasList: (...a) => H.hook('useMateriasList', a) }));
vi.mock('@/application/modules/configuracion/academico/hooks/features/useCarrerasList', () => ({ useCarrerasList: (...a) => H.hook('useCarrerasList', a) }));
vi.mock('@/application/modules/configuracion/recursos/hooks/features/useTiposEvaluacionList', () => ({ useTiposEvaluacionList: (...a) => H.hook('useTiposEvaluacionList', a) }));
vi.mock('@/application/modules/configuracion/recursos/hooks/features/useAulasList', () => ({ useAulasList: (...a) => H.hook('useAulasList', a) }));
vi.mock('@/application/modules/configuracion/recursos/hooks/features/useParalelosList', () => ({ useParalelosList: (...a) => H.hook('useParalelosList', a) }));
vi.mock('@/application/modules/configuracion/actividades/hooks/features/useActividadesList', () => ({ useActividadesList: (...a) => H.hook('useActividadesList', a) }));
vi.mock('@/application/modules/configuracion/documentacion/hooks/features/useDocumentacionList', () => ({ useDocumentacionList: (...a) => H.hook('useDocumentacionList', a) }));
vi.mock('@/application/modules/configuracion/complementarios/hooks/features/useApoderadosList', () => ({ useApoderadosList: (...a) => H.hook('useApoderadosList', a) }));
vi.mock('@/application/modules/configuracion/complementarios/hooks/features/useIdiomasList', () => ({ useIdiomasList: (...a) => H.hook('useIdiomasList', a) }));
vi.mock('@/application/modules/configuracion/complementarios/hooks/features/useDiscapacidadesList', () => ({ useDiscapacidadesList: (...a) => H.hook('useDiscapacidadesList', a) }));
vi.mock('@/application/modules/configuracion/complementarios/hooks/features/useEstadosCivilesList', () => ({ useEstadosCivilesList: (...a) => H.hook('useEstadosCivilesList', a) }));
vi.mock('@/application/modules/seguridad/hooks/state/useSeguridadUsuariosListPage', () => ({ useSeguridadUsuariosListPage: (...a) => H.hook('useSeguridadUsuariosListPage', a) }));
vi.mock('@/application/modules/seguridad/hooks/state/useSeguridadUsuarioPermisosPage', () => ({ useSeguridadUsuarioPermisosPage: (...a) => H.hook('useSeguridadUsuarioPermisosPage', a) }));
vi.mock('@/application/modules/seguridad/hooks/state/useSeguridadRolPermisosPage', () => ({ useSeguridadRolPermisosPage: (...a) => H.hook('useSeguridadRolPermisosPage', a) }));
vi.mock('@/application/modules/seguridad/hooks/state/useSeguridadRolDetailPage', () => ({ useSeguridadRolDetailPage: (...a) => H.hook('useSeguridadRolDetailPage', a) }));
vi.mock('@/application/modules/seguridad/hooks/state/useSeguridadRolesListPage.jsx', () => ({ useSeguridadRolesListPage: (...a) => H.hook('useSeguridadRolesListPage', a) }));
vi.mock('@/application/modules/seguridad/hooks/state/useSeguridadUsuarioDetailPage', () => ({ useSeguridadUsuarioDetailPage: (...a) => H.hook('useSeguridadUsuarioDetailPage', a) }));
vi.mock('@/application/modules/seguridad/hooks/state/useSeguridadUsuarioCreatePage', () => ({ useSeguridadUsuarioCreatePage: (...a) => H.hook('useSeguridadUsuarioCreatePage', a) }));
vi.mock('@application-matricula/becas/hooks/state/useBecasData', () => ({ useBecasData: (...a) => H.hook('useBecasData', a) }));
vi.mock('@/application/modules/perfil/hooks/state/usePerfilPage', () => ({ usePerfilPage: (...a) => H.hook('usePerfilPage', a) }));

import { DocentesDetailProvider } from '@/application/modules/docentes/providers/DocentesDetailProvider';
import { DocentesDetailContext } from '@application-docentes/context/DocentesDetailContext';
import { DocentesProvider } from '@/application/modules/docentes/providers/DocentesProvider';
import { DocentesContext } from '@application-docentes/context/DocentesContext';
import { DocentesFormProvider } from '@/application/modules/docentes/providers/DocentesFormProvider';
import { DocentesFormContext } from '@application-docentes/context/DocentesFormContext';
import { MateriaProvider } from '@/application/modules/configuracion/academico/providers/MateriaProvider';
import { MateriaContext } from '@/application/modules/configuracion/academico/context/MateriaContext';
import { CarreraProvider } from '@/application/modules/configuracion/academico/providers/CarreraProvider';
import { CarreraContext } from '@/application/modules/configuracion/academico/context/CarreraContext';
import { TipoEvaluacionProvider } from '@/application/modules/configuracion/recursos/providers/TipoEvaluacionProvider';
import { TipoEvaluacionContext } from '@/application/modules/configuracion/recursos/context/TipoEvaluacionContext';
import { AulaProvider } from '@/application/modules/configuracion/recursos/providers/AulaProvider';
import { AulaContext } from '@/application/modules/configuracion/recursos/context/AulaContext';
import { ParaleloProvider } from '@/application/modules/configuracion/recursos/providers/ParaleloProvider';
import { ParaleloContext } from '@/application/modules/configuracion/recursos/context/ParaleloContext';
import { ActividadProvider } from '@/application/modules/configuracion/actividades/providers/ActividadProvider';
import { ActividadContext } from '@/application/modules/configuracion/actividades/context/ActividadContext';
import { DocumentacionProvider } from '@/application/modules/configuracion/documentacion/providers/DocumentacionProvider';
import { DocumentacionContext } from '@/application/modules/configuracion/documentacion/context/DocumentacionContext';
import { ApoderadoProvider } from '@/application/modules/configuracion/complementarios/providers/ApoderadoProvider';
import { ApoderadoContext } from '@/application/modules/configuracion/complementarios/context/ApoderadoContext';
import { IdiomaProvider } from '@/application/modules/configuracion/complementarios/providers/IdiomaProvider';
import { IdiomaContext } from '@/application/modules/configuracion/complementarios/context/IdiomaContext';
import { DiscapacidadProvider } from '@/application/modules/configuracion/complementarios/providers/DiscapacidadProvider';
import { DiscapacidadContext } from '@/application/modules/configuracion/complementarios/context/DiscapacidadContext';
import { EstadoCivilProvider } from '@/application/modules/configuracion/complementarios/providers/EstadoCivilProvider';
import { EstadoCivilContext } from '@/application/modules/configuracion/complementarios/context/EstadoCivilContext';
import { SeguridadUsuariosListProvider } from '@/application/modules/seguridad/providers/SeguridadUsuariosListProvider';
import { SeguridadUsuariosListPageContext } from '@/application/modules/seguridad/context/SeguridadUsuariosListPageContext';
import { SeguridadUsuarioPermisosProvider } from '@/application/modules/seguridad/providers/SeguridadUsuarioPermisosProvider';
import { SeguridadUsuarioPermisosPageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioPermisosPageContext';
import { SeguridadRolPermisosProvider } from '@/application/modules/seguridad/providers/SeguridadRolPermisosProvider';
import { SeguridadRolPermisosPageContext } from '@/application/modules/seguridad/context/SeguridadRolPermisosPageContext';
import { SeguridadRolDetailProvider } from '@/application/modules/seguridad/providers/SeguridadRolDetailProvider';
import { SeguridadRolDetailPageContext } from '@/application/modules/seguridad/context/SeguridadRolDetailPageContext';
import { SeguridadRolesListProvider } from '@/application/modules/seguridad/providers/SeguridadRolesListProvider';
import { SeguridadRolesListPageContext } from '@/application/modules/seguridad/context/SeguridadRolesListPageContext';
import { SeguridadUsuarioDetailProvider } from '@/application/modules/seguridad/providers/SeguridadUsuarioDetailProvider';
import { SeguridadUsuarioDetailPageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioDetailPageContext';
import { SeguridadUsuarioCreateProvider } from '@/application/modules/seguridad/providers/SeguridadUsuarioCreateProvider';
import { SeguridadUsuarioCreatePageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioCreatePageContext';
import { BecasProvider } from '@/application/modules/matricula/becas/providers/BecasProvider';
import { BecasContext } from '@application-matricula/becas/context/BecasContext';
import { PerfilPageProvider } from '@/application/modules/perfil/providers/PerfilPageProvider';
import { PerfilPageContext } from '@/application/modules/perfil/context/PerfilPageContext';

const CASOS = [
  { nombre: 'DocentesDetailProvider', Proveedor: DocentesDetailProvider, contexto: DocentesDetailContext, hook: 'useDocentesDetailPage' },
  { nombre: 'DocentesProvider', Proveedor: DocentesProvider, contexto: DocentesContext, hook: 'useDocentesApi' },
  { nombre: 'DocentesFormProvider', Proveedor: DocentesFormProvider, contexto: DocentesFormContext, hook: 'useDocentesFormPage' },
  { nombre: 'MateriaProvider', Proveedor: MateriaProvider, contexto: MateriaContext, hook: 'useMateriasList' },
  { nombre: 'CarreraProvider', Proveedor: CarreraProvider, contexto: CarreraContext, hook: 'useCarrerasList' },
  { nombre: 'TipoEvaluacionProvider', Proveedor: TipoEvaluacionProvider, contexto: TipoEvaluacionContext, hook: 'useTiposEvaluacionList' },
  { nombre: 'AulaProvider', Proveedor: AulaProvider, contexto: AulaContext, hook: 'useAulasList' },
  { nombre: 'ParaleloProvider', Proveedor: ParaleloProvider, contexto: ParaleloContext, hook: 'useParalelosList' },
  { nombre: 'ActividadProvider', Proveedor: ActividadProvider, contexto: ActividadContext, hook: 'useActividadesList' },
  { nombre: 'DocumentacionProvider', Proveedor: DocumentacionProvider, contexto: DocumentacionContext, hook: 'useDocumentacionList' },
  { nombre: 'ApoderadoProvider', Proveedor: ApoderadoProvider, contexto: ApoderadoContext, hook: 'useApoderadosList' },
  { nombre: 'IdiomaProvider', Proveedor: IdiomaProvider, contexto: IdiomaContext, hook: 'useIdiomasList' },
  { nombre: 'DiscapacidadProvider', Proveedor: DiscapacidadProvider, contexto: DiscapacidadContext, hook: 'useDiscapacidadesList' },
  { nombre: 'EstadoCivilProvider', Proveedor: EstadoCivilProvider, contexto: EstadoCivilContext, hook: 'useEstadosCivilesList' },
  { nombre: 'SeguridadUsuariosListProvider', Proveedor: SeguridadUsuariosListProvider, contexto: SeguridadUsuariosListPageContext, hook: 'useSeguridadUsuariosListPage' },
  { nombre: 'SeguridadUsuarioPermisosProvider', Proveedor: SeguridadUsuarioPermisosProvider, contexto: SeguridadUsuarioPermisosPageContext, hook: 'useSeguridadUsuarioPermisosPage' },
  { nombre: 'SeguridadRolPermisosProvider', Proveedor: SeguridadRolPermisosProvider, contexto: SeguridadRolPermisosPageContext, hook: 'useSeguridadRolPermisosPage' },
  { nombre: 'SeguridadRolDetailProvider', Proveedor: SeguridadRolDetailProvider, contexto: SeguridadRolDetailPageContext, hook: 'useSeguridadRolDetailPage' },
  { nombre: 'SeguridadRolesListProvider', Proveedor: SeguridadRolesListProvider, contexto: SeguridadRolesListPageContext, hook: 'useSeguridadRolesListPage' },
  { nombre: 'SeguridadUsuarioDetailProvider', Proveedor: SeguridadUsuarioDetailProvider, contexto: SeguridadUsuarioDetailPageContext, hook: 'useSeguridadUsuarioDetailPage' },
  { nombre: 'SeguridadUsuarioCreateProvider', Proveedor: SeguridadUsuarioCreateProvider, contexto: SeguridadUsuarioCreatePageContext, hook: 'useSeguridadUsuarioCreatePage' },
  { nombre: 'BecasProvider', Proveedor: BecasProvider, contexto: BecasContext, hook: 'useBecasData' },
  { nombre: 'PerfilPageProvider', Proveedor: PerfilPageProvider, contexto: PerfilPageContext, hook: 'usePerfilPage' },
];

const Lector = ({ contexto, onValor }) => {
  onValor(useContext(contexto));
  return <span>consumidor</span>;
};

describe.each(CASOS)('$nombre', ({ Proveedor, contexto, hook }) => {
  beforeEach(() => {
    H.llamadas.length = 0;
    H.valores = { [hook]: { sentinela: hook } };
  });

  it('publica en su Context el valor que devuelve el hook', () => {
    let visto;
    const { getByText } = render(
      <Proveedor>
        <Lector contexto={contexto} onValor={(v) => { visto = v; }} />
      </Proveedor>,
    );
    expect(getByText('consumidor')).toBeTruthy();
    expect(visto).toBe(H.valores[hook]);
    expect(H.llamadas.some(([nombre]) => nombre === hook)).toBe(true);
  });

  it('sin provider el Context no tiene el valor del hook', () => {
    let visto = 'sin-leer';
    render(<Lector contexto={contexto} onValor={(v) => { visto = v; }} />);
    expect(visto).not.toBe(H.valores[hook]);
    expect(H.llamadas).toHaveLength(0);
  });
});
