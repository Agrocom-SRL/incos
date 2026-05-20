# Plan de desarrollo · Módulo de Calificaciones

**Proyecto:** Sistema de Gestión Académica — Instituto INCOS
**Stack frontend:** React + Ant Design + React Router v6
**Stack backend:** Node.js + Express + MySQL + Sequelize + Redis (Clean Architecture)

---

## Principios rectores

Estos principios son **invariantes** de todo el módulo. Cualquier decisión durante el desarrollo debe respetarlos.

1. **El docente entra directo a su trabajo.** No hay pantalla de "elegir docente" en el flujo docente. El sistema sabe quién es por el usuario logueado.
2. **El cuaderno es el centro de gravedad.** Grilla con estudiantes en filas y evaluaciones en columnas, análoga al cuaderno físico del docente.
3. **El plan se construye haciendo, no antes de hacer.** Las evaluaciones se crean inline desde la grilla. No hay pantalla previa de "plan de calificaciones".
4. **Configuración y operación están separadas.** El cuaderno no muestra pesos, validadores ni decisiones de política. Los configura el docente en un panel aparte cuando los necesita.
5. **Apertura secuencial de bimestres.** Solo un bimestre vigente a la vez. Los siguientes están bloqueados hasta que se cierre el actual.
6. **El cierre lo decide Coordinación, no el docente.** El docente carga; coordinación cierra. Esta separación de roles es estricta.
7. **Las overrides del docente son trazables.** Si un docente cambia la cuota institucional o la política de asistencia para su curso, el sistema lo registra y el coordinador puede verlo.
8. **No se modifica el schema SQL existente.** El módulo se construye encima del schema actual. Cualquier necesidad nueva se discute y se documenta antes de tocar SQL.

---

## Arquitectura de 3 niveles

```
┌──────────────────────────────────────────────────────────────────┐
│ NIVEL 1 — POLÍTICA INSTITUCIONAL (coordinación)                  │
│ Define los defaults de la gestión. Una vez al año.               │
│   • Cuota teórico/práctico default (30/70)                       │
│   • Pesos default de bimestres (25/25/25/25)                     │
│   • Política institucional de asistencia                         │
│   • Evaluaciones finales habilitadas a nivel institucional       │
└──────────────────────────────────────────────────────────────────┘
                            │ alimenta defaults
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ NIVEL 2 — TABLERO DEL AÑO (coordinación)                         │
│ Control de bimestres durante la gestión.                         │
│   • Iniciar Bimestre N (dispara INSCRITO → CURSANDO)             │
│   • Cerrar Bimestre N (cálculos masivos, persiste notas)         │
│   • Métricas globales del avance                                 │
└──────────────────────────────────────────────────────────────────┘
                            │ habilita carga
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ NIVEL 3 — CUADERNO DOCENTE (operación diaria)                    │
│ Carga de evaluaciones y notas. Configuración propia del curso.   │
│   • Grilla de notas con auto-guardado                            │
│   • Agregar evaluación inline                                    │
│   • Panel de ajustes del curso (override de cuota, finales,      │
│     política de asistencia propia)                               │
│   • Vista previa de notas calculadas                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Fases de desarrollo

### Fase 0 — Limpieza
Eliminar páginas obsoletas y dejar solo los componentes reutilizables.

**Rutas a eliminar:**
- `/academico/calificaciones` (selección de docente para perfil docente)
- `/academico/calificaciones/docente/:id/cursos`
- `/academico/calificaciones/docente/:id/curso/:cid/plan`
- `/academico/calificaciones/docente/:id/curso/:cid/notas`

**Componentes a conservar:** breadcrumb, header institucional, sidebar.

### Fase 1 — Esqueleto del cuaderno docente
Construir las dos pantallas base del flujo docente sin lógica de carga real.

**Rutas nuevas:**
- `/mis-cursos` — Pantalla A: cards de cursos del docente.
- `/mis-cursos/:cursoId` — Pantalla B: cuaderno con tabs de bimestres y grilla vacía.

**Entrega:** UI navegable con datos mockeados o endpoints stub. Validación visual con coordinación antes de seguir.

### Fase 2 — Grilla de notas funcional
Hacer operativa la carga de notas con persistencia real.

**Funcionalidades:**
- Listado real de estudiantes desde `matriculas_materia` filtrado por `asignaciones_docentes` del docente logueado.
- Drawer "Agregar evaluación" (inserta filas en `evaluaciones` para todos los estudiantes del curso, con `nota = NULL`).
- Edición de celdas con auto-guardado por blur (UPDATE `evaluaciones.nota`).
- Tabs de bimestres con bloqueo: solo el vigente es editable; los anteriores son lectura; los futuros tienen candado.
- Indicador de "Guardado automático · hace X seg".

### Fase 3 — Ajustes del curso (panel docente)
Drawer o página de configuración propia del curso, accesible desde el cuaderno.

**Funcionalidades:**
- Override de cuota teórico/práctico del curso (default heredado de `configuracion_evaluacion`).
- Activación de evaluaciones finales propias del curso (proyecto integrador, examen anual, feria) con sus pesos.
- Override de política de asistencia del curso (asistencia mínima, qué pasa si no llega, si aporta puntos al práctico).
- Cada cambio registra `updated_by` y queda visible para coordinación.

**Decisión de schema:** los overrides del docente probablemente requieren columnas nuevas en `asignaciones_docentes` (a confirmar antes de tocar SQL).

### Fase 4 — Vista previa de notas
Drawer lateral que muestra cómo se calcularía cada nota con lo cargado hasta ahora.

**Funcionalidades:**
- Cálculo en vivo de `nota_teorico`, `nota_practico`, `nota_bimestre` por estudiante (sin persistir).
- Detección de pesos que no suman 100 (mensaje claro y accionable).
- Detección de estudiantes con notas faltantes.
- Botón "Volver al cuaderno" para seguir cargando.

### Fase 5 — Tablero de coordinación (Nivel 2)
Pantalla administrativa de control del año.

**Rutas nuevas:**
- `/academico/tablero` — vista del año con los 4 bimestres y su estado.

**Funcionalidades:**
- Iniciar Bimestre 1 (transición masiva `INSCRITO → CURSANDO` en `matriculas_materia` de la gestión).
- Cerrar Bimestre N: modal de confirmación, validaciones masivas, cálculo y persistencia de `bimestres_matricula` con `estado = CERRADO`.
- Métricas globales: cursos completos, planes sin definir, notas faltantes.

### Fase 6 — Vista administrativa (impersonación)
Permite a coordinación entrar al cuaderno de cualquier docente.

**Rutas nuevas:**
- `/academico/docentes` — lista de docentes (rediseño de la pantalla 1 actual).
- `/academico/docentes/:id` — vista de cursos del docente (similar a `/mis-cursos` pero con banner).
- `/academico/docentes/:id/curso/:cursoId` — cuaderno con banner amarillo "Estás viendo el cuaderno de [Nombre]".

**Funcionalidades:**
- Reutiliza los componentes del cuaderno docente (no duplicar código).
- Banner amarillo permanente en modo impersonación.
- Cualquier edición se registra con `updated_by` = usuario administrativo real.

### Fase 7 — Política institucional (Nivel 1)
Pantalla administrativa de configuración inicial de la gestión.

**Rutas nuevas:**
- `/academico/configuracion/gestion/:id` — política académica de la gestión.

**Funcionalidades:**
- Cuota teórico/práctico institucional (default 30/70).
- Pesos default de bimestres (default 25/25/25/25).
- Política institucional de asistencia.
- Activación de evaluaciones finales a nivel institucional.

---

## Patrón de cada prompt al agente IA

Cada prompt debe respetar esta estructura para que el agente trabaje sin ambigüedades y devuelva feedback útil:

1. **Contexto del proyecto** — qué existe, qué stack, qué decisiones rigen.
2. **Objetivo de la fase** — qué pantalla/funcionalidad concreta se construye.
3. **Qué destruir** — rutas/archivos/componentes obsoletos.
4. **Qué construir** — pantallas, componentes, rutas, contratos de datos.
5. **Restricciones técnicas** — stack permitido, dependencias prohibidas, no tocar schema SQL.
6. **Criterios de aceptación** — lista verificable de comportamientos esperados.
7. **Informe de cierre esperado** — el agente debe devolver al final un informe con:
   - Archivos creados (rutas).
   - Archivos eliminados.
   - Decisiones de diseño tomadas (con justificación breve).
   - Mocks o stubs que usó.
   - Dudas o ambigüedades que encontró.
   - Pendientes que detectó para fases siguientes.

---

## Loop de feedback humano → IA → humano

```
[Carlos] entrega prompt N al agente
         │
         ▼
[Agente IA] construye + devuelve informe de cierre
         │
         ▼
[Carlos] copia el informe y lo pega en su chat con Claude
         │
         ▼
[Claude] analiza el informe, ajusta el plan si es necesario,
         y arma el prompt N+1 incorporando lo aprendido
         │
         ▼
[Carlos] entrega prompt N+1 al agente
```

Este loop permite que el plan se adapte a la realidad del código que va emergiendo, sin que ninguna fase termine ciega.
