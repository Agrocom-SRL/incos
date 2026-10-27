/**
 * Providers de Finanzas que ensamblan lecturas + mutaciones: el Context debe
 * publicar cada campo desde su fuente (contrato que consumen las páginas).
 */
import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const H = vi.hoisted(() => ({
  gestiones: [],
  aporteCatalog: null,
  aporteMut: null,
  cfgCatalog: null,
  cfgMut: null,
  becaCatalog: null,
  becaMut: null,
  aporteArg: null,
}));

vi.mock('@application-shared/hooks', async (orig) => ({
  ...(await orig()),
  useGestionesCatalogApi: () => ({ gestiones: H.gestiones }),
}));
vi.mock('@application-finanzas/aportes/hooks/api/useAporteCatalogApi', () => ({
  useAporteCatalogApi: (gestion) => { H.aporteArg = gestion; return H.aporteCatalog; },
}));
vi.mock('@application-finanzas/aportes/hooks/api/useAporteMutations', () => ({ useAporteMutations: () => H.aporteMut }));
vi.mock('@application-finanzas/hooks/api/useConfigPagosCatalogsApi', () => ({ useConfigPagosCatalogsApi: () => H.cfgCatalog }));
vi.mock('@application-finanzas/hooks/api/useConfigPagosMutations', () => ({ useConfigPagosMutations: () => H.cfgMut }));
vi.mock('@application-finanzas/becas-descuentos/hooks/api/useBecaDescuentoCatalogApi', () => ({ useBecaDescuentoCatalogApi: () => H.becaCatalog }));
vi.mock('@application-finanzas/becas-descuentos/hooks/api/useBecaDescuentoMutations', () => ({ useBecaDescuentoMutations: () => H.becaMut }));

import { AporteProvider } from '@/application/modules/finanzas/aportes/providers/AporteProvider';
import { ConfigPagosProvider } from '@/application/modules/finanzas/providers/ConfigPagosProvider';
import { BecaDescuentoProvider } from '@/application/modules/finanzas/becas-descuentos/providers/BecaDescuentoProvider';
import { AporteContext } from '@application-finanzas/aportes/context/AporteContext';
import { ConfigPagosContext } from '@application-finanzas/context/ConfigPagosContext';
import { BecaDescuentoContext } from '@application-finanzas/becas-descuentos/context/BecaDescuentoContext';

const leer = (Proveedor, Contexto) => {
  const capturas = [];
  const Lector = () => { capturas.push(useContext(Contexto)); return null; };
  render(<Proveedor><Lector /></Proveedor>);
  return capturas.at(-1);
};

const fn = () => vi.fn();

beforeEach(() => {
  H.gestiones = [{ id: 1, vigente: false }, { id: 2, vigente: true }];
  H.aporteCatalog = { aporteVigente: { id: 9 }, loading: true, error: 'e1', refetch: fn() };
  H.aporteMut = { saving: true, guardarConfiguracionAporte: fn() };
  H.cfgCatalog = { metodos: [1], bancos: [2], cuentas: [3], loading: false, error: null, refetch: fn() };
  H.cfgMut = {
    saving: true, actualizarMetodoPago: fn(), guardarBanco: fn(), guardarCuenta: fn(), eliminarBanco: fn(),
    eliminarCuenta: fn(), cambiarEstadoMetodo: fn(), cambiarEstadoBanco: fn(), cambiarEstadoCuenta: fn(),
  };
  H.becaCatalog = { becasDescuentos: [{ id: 1 }], loading: false, error: 'x', refetch: fn() };
  H.becaMut = { saving: false, crear: fn(), actualizar: fn(), eliminar: fn() };
});

describe('AporteProvider', () => {
  it('publica la gestión vigente, la lectura del aporte y su mutación', () => {
    const v = leer(AporteProvider, AporteContext);
    expect(v.gestionVigente).toEqual({ id: 2, vigente: true });
    expect(H.aporteArg).toEqual({ id: 2, vigente: true });
    expect(v).toMatchObject({ aporteVigente: { id: 9 }, loading: true, error: 'e1', saving: true });
    expect(v.refetch).toBe(H.aporteCatalog.refetch);
    expect(v.guardarConfiguracionAporte).toBe(H.aporteMut.guardarConfiguracionAporte);
  });

  it('sin gestión vigente usa la primera del catálogo y, sin catálogo, null', () => {
    H.gestiones = [{ id: 5 }, { id: 6 }];
    expect(leer(AporteProvider, AporteContext).gestionVigente).toEqual({ id: 5 });
    H.gestiones = undefined;
    expect(leer(AporteProvider, AporteContext).gestionVigente).toBeNull();
  });
});

describe('ConfigPagosProvider', () => {
  it('publica las tres lecturas y todas las mutaciones', () => {
    const v = leer(ConfigPagosProvider, ConfigPagosContext);
    expect(v).toMatchObject({ metodos: [1], bancos: [2], cuentas: [3], loading: false, error: null, saving: true });
    expect(v.refetch).toBe(H.cfgCatalog.refetch);
    for (const k of ['actualizarMetodoPago', 'guardarBanco', 'guardarCuenta', 'eliminarBanco', 'eliminarCuenta', 'cambiarEstadoMetodo', 'cambiarEstadoBanco', 'cambiarEstadoCuenta']) {
      expect(v[k]).toBe(H.cfgMut[k]);
    }
  });
});

describe('BecaDescuentoProvider', () => {
  it('publica el catálogo y el CRUD', () => {
    const v = leer(BecaDescuentoProvider, BecaDescuentoContext);
    expect(v).toMatchObject({ becasDescuentos: [{ id: 1 }], loading: false, error: 'x', saving: false });
    expect(v.refetch).toBe(H.becaCatalog.refetch);
    expect(v.crear).toBe(H.becaMut.crear);
    expect(v.actualizar).toBe(H.becaMut.actualizar);
    expect(v.eliminar).toBe(H.becaMut.eliminar);
  });
});
