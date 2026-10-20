# Tarjeta informativa — patrón de referencia (PRIORIDAD 1)

> Regla resumida en `.claude/skills/incos-ui-system/SKILL.md` §4.0.1. Este
> documento es la anatomía completa: léelo **antes** de diseñar cualquier
> tarjeta que muestre información (ficha de resumen, tarjeta de selección,
> tile de entidad, panel de datos). No se inventa una tarjeta nueva por
> pantalla: se instancia esta.

## Origen

2026-08-14 — el paso de cierre del wizard de matrícula («Resumen de la
inscripción» + «Paralelos por periodo») se veía **pálido y sin forma**: cada
dato en su propia caja gris, el nombre del estudiante en un bloque verde
aparte, y las tarjetas planas sobre el lienzo. Se compararon tres direcciones
de diseño y se eligió **«jerarquía limpia»**: una sola tarjeta con franjas
separadas por divisores, color reservado a lo que informa estado, y elevación
real para que la pieza se despegue del fondo. Implementación de referencia:
`InscripcionSeleccionResumen.jsx` + `ParaleloCard.jsx`.

## Anatomía (en este orden)

```
┌─────────────────────────────────────────────────────────────┐
│  (SP)  NOMBRE / TÍTULO FUERTE                    [ PILL ]   │  ← 1. Identidad
│        rótulo dato · rótulo dato                            │
├───────────────┬───────────────┬───────────────┬─────────────┤
│ RÓTULO        │ RÓTULO        │ RÓTULO        │ RÓTULO      │  ← 2. Datos
│ valor         │ valor         │ valor         │ valor       │
├─────────────────────────────────────────────────────────────┤
│ Bloque        8 elementos · dato                            │  ← 3. Detalle
│   COD-101  Nombre del elemento                              │     (opcional)
│   COD-102  Nombre del elemento                              │
└─────────────────────────────────────────────────────────────┘
```

1. **Identidad** — avatar/inicial + título fuerte (`--font-size-lg`,
   `--font-weight-strong`) + metadatos secundarios; a la derecha, las pills de
   estado (`margin-inline-start: auto`). Cierra con un divisor
   (`border-bottom: 1px solid var(--color-border-secondary)`).
2. **Datos** — columnas separadas por divisor vertical
   (`border-inline-start`, sin borde en la primera), cada una con **rótulo en
   versalitas** (`--font-size-xxs`, `text-transform: uppercase`,
   `letter-spacing: .1em`, `--color-text-tertiary`) **sobre** el valor
   (`--font-size-sm` o `--font-size-lg` si el número es el protagonista).
   Grid `auto-fit` con `minmax(min(<min>, 100%), 1fr)`.
3. **Detalle** (listas de elementos) — dos columnas como máximo; cada fila con
   el código en **monoespaciada** (`--font-family-code`) teñido de primario y
   el nombre a continuación, separadas por `border-bottom` sutil.

## Reglas no negociables

| # | Regla | Por qué |
|---|-------|---------|
| 1 | **Una sola tarjeta**, franjas separadas por divisores | Tres cajas sueltas leen como tres cosas distintas; la información de una inscripción es una sola |
| 2 | **Elevación real**: `box-shadow: var(--shadow-elevation-2)` en reposo | La tarjeta sobresale del lienzo; un borde suelto se lee como "dibujo en la página" |
| 3 | **Sin fondos de color por sector** | El color se reserva para lo que informa estado (pills, tonos de género, acentos). Fondos teñidos por zona vuelven la ficha ruidosa |
| 4 | Separación por **divisor + escala tipográfica**, no por fondo | Es lo que da la "jerarquía limpia" |
| 5 | **Rótulo en versalitas sobre el valor** | Etiqueta y dato se distinguen sin negritas compitiendo |
| 6 | Datos de ancho fijo (C.I., códigos, siglas) en `--font-family-code` | Alinean en columna y se leen como cifra, no como prosa |
| 7 | Pills de estado **a la derecha** de la identidad | Un solo sitio donde buscar el estado, en toda la app |
| 8 | Cero `#hex`, `px` de color o `fontSize` numérico | §2 de la skill: tokens al origen |

## Estados

- **Seleccionable** (tarjeta que se elige): hover con `--shadow-elevation-3` y
  `translateY(-2px)`; elegida con borde primario + anillo
  (`0 0 0 2px var(--color-primary-border)`) + tinte `--color-primary-bg`.
  El hover **no** se aplica sobre la elegida (borde doble).
- **Marca de elección**: pill primaria («Elegido») que solo aparece en la
  tarjeta activa; nunca cambiar el layout entre estados.
- **Color de categoría** (turno, tipo, sexo): pill + acento del avatar/inicial.
  El tono de género usa las clases globales `cfg-genero-tone--m/--f`
  (`table-cells.css`), que tiñen **icono y rótulo**, y expone
  `--cfg-genero-color` para contextos que fuercen el color del texto.

## Implementaciones de referencia

| Pieza | Archivo | CSS |
|-------|---------|-----|
| Ficha de resumen (identidad + datos + detalle) | `matricula/registro/components/organisms/InscripcionSeleccionResumen.jsx` | `styles/components/organisms/materias-planilla.css` (`.insc-resumen*`) |
| Tarjeta seleccionable con métricas | `matricula/registro/components/molecules/ParaleloCard.jsx` | `styles/pages/step2-periodo-materias.css` (`.paralelo-card*`) |

## Antipatrones (los que motivaron esta regla)

1. Cada dato en su **caja gris** independiente → parece un formulario, no una ficha.
2. La identidad en un **bloque de color** distinto al resto → rompe la unidad.
3. Tarjeta **sin sombra** sobre fondo claro → se pierde en el lienzo.
4. Valores numéricos al mismo tamaño que el texto corrido → el dato no manda.
5. Truncar nombres por meter **4 columnas** donde caben 2 → el resumen deja de
   ser verificable de un vistazo.
6. Repetir el mismo dato en dos formas ("Gestión Regular 2026 · 2026").
