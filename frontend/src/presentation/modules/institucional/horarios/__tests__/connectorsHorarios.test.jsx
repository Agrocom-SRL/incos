import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArmadoConnector from '../connectors/ArmadoConnector';
import ConflictosConnector from '../connectors/ConflictosConnector';
import ListConnector from '../connectors/ListConnector';
import PublicacionConnector from '../connectors/PublicacionConnector';

// Los providers de aplicación se reemplazan por envoltorios marcados: se verifica la composición
// conector = Provider de su pantalla + página, sin red ni contenedor de dependencias.
vi.mock('@application-institucional/horarios', () => ({
  HorariosProvider: ({ children }) => <div data-testid="prov-lista">{children}</div>,
  HorariosArmadoProvider: ({ children }) => <div data-testid="prov-armado">{children}</div>,
  HorariosPublicacionProvider: ({ children }) => <div data-testid="prov-publicacion">{children}</div>,
}));
vi.mock('@application-institucional/horarios/providers/HorariosConflictosProvider', () => ({
  HorariosConflictosProvider: ({ children }) => <div data-testid="prov-conflictos">{children}</div>,
}));
vi.mock('../pages/GestionHorariosPage', () => ({ default: () => <p>pagina-lista</p> }));
vi.mock('../pages/GestionHorariosArmadoPage', () => ({ default: () => <p>pagina-armado</p> }));
vi.mock('../pages/GestionHorariosPublicacionPage', () => ({ default: () => <p>pagina-publicacion</p> }));
vi.mock('../pages/GestionHorariosConflictosPage', () => ({ default: () => <p>pagina-conflictos</p> }));

describe('conectores de gestión de horarios', () => {
  it.each([
    ['listado', ListConnector, 'prov-lista', 'pagina-lista'],
    ['armado', ArmadoConnector, 'prov-armado', 'pagina-armado'],
    ['publicación', PublicacionConnector, 'prov-publicacion', 'pagina-publicacion'],
    ['conflictos', ConflictosConnector, 'prov-conflictos', 'pagina-conflictos'],
  ])('%s: la página vive dentro de su provider', (_n, Conector, provider, pagina) => {
    render(<Conector />);
    expect(screen.getByTestId(provider)).toContainElement(screen.getByText(pagina));
  });
});
