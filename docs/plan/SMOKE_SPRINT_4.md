# Smoke manual — Sprint 4 (asignación docente + continuidad operativa)

Ejecutar con BD local tras seeders **27 → 30 → 31+** (oferta y asignaciones docentes).

Rol sugerido: **SEC_ACADEMICA** (rol 5) o **DIR_ACADEMICO** (3), con permisos 108–110.

## Pista A — Asignación docente

1. `/institucional/horarios/asignacion-docente` — elegir gestión, plan y paralelo-gestión; cargar matriz.
2. Asignar docente sin color → debe abrir picker; guardar color único → completar asignación.
3. Forzar sobrecarga (docente al límite) → aviso y confirmación → asignación guardada.
4. `/institucional/horarios/carga-docentes/:gestionId` — KPIs, tabla, drawer de detalle.
5. Quitar asignación desde matriz → fila queda sin docente.

## Pista B — Oferta + armado + notas

6. `/institucional/oferta` — paralelo con oferta generada (o generar oferta).
7. `/institucional/horarios` → abrir armado de un paralelo → tab **Gestión de cursos**: lista oferta vía API `oferta-cursos`.
8. Mismo armado → tab **Plan semanal**: carga y guarda bloques (`GET/PUT /paralelos/:id/schedule` sobre `asignacion_horarios`).
9. Alta manual de materia faltante (si aplica) → aparece en tabla.
10. Inscripción de estudiante en gestión vigente → matrículas con oferta del paralelo.
11. `/academico/calificaciones/mis-cursos` (docente seed 31+) → listado con `asignacion_docente_id`.
12. Cuaderno bimestre de un curso con matriculados → notas cargan sin 500.

## Cierre

Marque al ejecutar en su entorno (backend `:3000`, seeders 27→30→31+):

- [ ] Pasos 1–5 OK (Pista A)  
- [ ] Pasos 6–12 OK (Pista B)  

**Código Sprint 4:** cerrado en repo (2026-06-01). La validación operativa queda en este checklist antes de merge a `development`.
