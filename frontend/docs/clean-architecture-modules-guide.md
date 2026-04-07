# Guía de Módulos Frontend (Clean Architecture)

## Objetivo

Estandarizar cómo crear y mantener módulos frontend para evitar auditorías frecuentes y reducir mezcla de responsabilidades entre capas.

Esta guía se basa en la migración del módulo `SEG` (Seguridad) en INCOS.

---

## Reglas de Dependencia (obligatorias)

- `presentation -> application -> domain`
- `infrastructure -> domain`
- Nunca al revés.
- `presentation` no debe importar `infrastructure`.
- `application` no debe importar `presentation`.
- `domain` no debe depender de React, Ant Design ni clientes HTTP.

---

## Estructura recomendada por módulo

```text
src/
  domain/
    entities/
    repositories/                  // Interfaces/contratos
  infrastructure/
    repositories/<modulo>/         // Implementaciones HTTP concretas
  application/
    use-cases/<modulo>/            // Casos de uso (orquestación + reglas de dominio)
    modules/<modulo>/hooks/        // Estado de negocio para UI (sin JSX)
    container/modules/             // Registro DI
  presentation/
    modules/<modulo>/
      pages/                       // JSX + handlers UI
      components/                  // UI pura
      config/                      // Columnas, config visual
      routes.jsx
```

---

## Qué va en cada capa

### Domain
- Entidades y contratos de repositorio.
- Reglas puras de negocio (sin framework ni HTTP).

### Infrastructure
- `apiCall`, endpoints, parseo de respuesta.
- Sin validaciones de negocio complejas.

### Application
- Casos de uso: validan reglas de dominio y orquestan repositorios.
- Hooks de módulo: estado, carga, guardado, coordinación entre use-cases.
- Sin JSX ni componentes visuales.

### Presentation
- Renderizado, navegación, mensajes, modales y eventos UI.
- Consume hooks de `application`.
- No construye URLs ni llama `apiCall`.

---

## Plantilla de implementación de módulo

## 1) Domain
- Crear entidades del módulo.
- Crear interfaces de repositorio (`I*Repository`) con métodos explícitos.
- Exportar interfaces en `src/domain/repositories/index.js`.

## 2) Infrastructure
- Crear repositorios concretos en `src/infrastructure/repositories/<modulo>/`.
- Implementar cada método del contrato con `apiCall` + endpoints.
- Mantener retornos consistentes y errores con `throw`.

## 3) Application
- Crear use-cases en `src/application/use-cases/<modulo>/`.
- Agregar validaciones de dominio (no de UI).
- Crear hooks en `src/application/modules/<modulo>/hooks/`.
- Registrar módulo en `src/application/container/modules/<modulo>.container.js`.
- Integrar registro en `src/application/container/modules/index.js`.

## 4) Presentation
- Refactor páginas para usar hooks de `application`.
- Dejar en páginas solo UI + handlers de navegación/notificaciones.
- Mover o eliminar hooks HTTP viejos de `presentation`.

---

## Checklist de aceptación por módulo

- [ ] No hay `apiCall` en `src/presentation/modules/<modulo>/`
- [ ] No hay `fetch(` en `src/presentation/modules/<modulo>/`
- [ ] Páginas del módulo importan hooks desde `application/modules/<modulo>/hooks`
- [ ] Hooks de `application` no importan de `presentation`
- [ ] Repositorios de `infrastructure` no importan de `application`
- [ ] `npm run build` compila sin errores

Comandos de verificación sugeridos:

```bash
rg "apiCall" src/presentation/modules/<modulo>/
rg "fetch\(" src/presentation/modules/<modulo>/
```

---

## Convenciones recomendadas

- Nombres de casos de uso:
  - `ListarXUseCase`
  - `ObtenerXUseCase`
  - `CrearXUseCase`
  - `ActualizarXUseCase`
  - `EliminarXUseCase`
- Nombre de métodos públicos en use-case: `ejecutar(...)`.
- Hooks de aplicación:
  - prefijo `use`
  - exponer `loading`, `error`, estado y acciones.
- Errores:
  - validaciones de dominio con `throw new Error("...")`.
  - páginas muestran feedback visual (`message.error`, `Alert`, etc.).

---

## Cambios aplicados en SEG (resumen)

### Se creó

- `domain/entities/`
  - `User.js`
  - `Role.js`
  - `Permission.js`
  - `UserPermissionOverride.js`
- `domain/repositories/`
  - `IUsuarioAdminRepository.js`
  - `IRolAdminRepository.js`
  - `IPermisoRepository.js`
- `infrastructure/repositories/seguridad/`
  - `UsuarioAdminRepository.js`
  - `RolAdminRepository.js`
  - `PermisoAdminRepository.js`
- `application/use-cases/seguridad/`
  - `ListarUsuariosUseCase.js`
  - `ObtenerUsuarioUseCase.js`
  - `CrearUsuarioUseCase.js`
  - `ActualizarUsuarioUseCase.js`
  - `CambiarEstadoUsuarioUseCase.js`
  - `CambiarPasswordUseCase.js`
  - `ObtenerPermisosUsuarioUseCase.js`
  - `AgregarOverridePermisoUseCase.js`
  - `EliminarOverridePermisoUseCase.js`
  - `ListarRolesUseCase.js`
  - `ObtenerPermisosRolUseCase.js`
  - `ActualizarPermisosRolUseCase.js`
  - `ListarPermisosUseCase.js`
  - `index.js`
- `application/modules/seguridad/hooks/`
  - `useUsuariosList.js`
  - `useUsuarioDetail.js`
  - `useUsuarioPermisos.js`
  - `useRolesList.js`
  - `useRolPermisos.js`
  - `usePermisosCatalogo.js`
  - `index.js`
- `application/container/modules/`
  - `seguridad.container.js`

### Se actualizó

- `application/container/modules/index.js`
- `domain/repositories/index.js`
- páginas en `presentation/modules/seguridad/pages/` para consumir `application`.

### Se eliminó

- `presentation/modules/seguridad/hooks/useUsuarios.js`
- `presentation/modules/seguridad/hooks/useRoles.js`
- `presentation/modules/seguridad/hooks/usePermisos.js`

