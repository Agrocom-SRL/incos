# Backlog de correcciones hallado por las pruebas unitarias

**Estado:** pendiente de aplicar — registrado 2026-10-20.
**Origen:** las pruebas unitarias del backend (tandas 2 a 5) y su revisión. Los agentes **reportaron** los bugs sin corregirlos y no dejaron pruebas que fijen el comportamiento erróneo (salvo tres `it.failing` en `tests/unit/configuracion/b.*`, que hay que pasar a `it` al corregir).
**Método de corrección:** un PR por bloque, cada bug con la prueba que lo reproduce (skill `incos-testing`), PR hacia `develop` y de uno en uno (el auto-merge falla con "Base branch was modified" si dos PR se fusionan a la vez).

Decisiones del negocio ya tomadas:
- Seguimiento académico (avance, deserción, acompañamiento), Traspasos y Transitabilidad **no se codifican** en esta versión: no son deuda.
- La asistencia es opcional por docente: una sola columna `ASISTENCIA` por bimestre, siempre componente PRÁCTICO, y su peso en el promedio lo fija el docente con los puntos de la actividad.

## Ya corregido (PR #21, #22)
folioFinal (Abrir/EditarLibro), horasRequeridas (pasantías), ids de ValidarConflicto/UpdateAsignacionHorario, mover bloque entre paralelos, calendario `null` en ListCursosCalificaciones, evaluaciones del cuaderno limitadas a su bimestre y reglas de asistencia en Update.

## Corregido en `fix/pagos-bloque-1`
Bloque 1 completo (recibo sin 400 inventado —el recibo por cabecera nunca leía `baseAmount`—, cuota con monto `''`, `monto_base` `''`/`Infinity`, cuentas por cobrar con `monto_total_deuda` nulo, booleanos `activo`, fechas de compromiso `2026-02-31`, `metodo_pago_id`/`banco_id` no numéricos, edición parcial de cuota en el controller, mensaje de capacitación). Se crea el helper `application/utils/validacionEntrada.js` para los bloques siguientes. Decisiones: recibo y cuota con monto 0 son válidos (generan compromiso de pago); `monto_base` 0 es válido.

## Corregido en `fix/seguridad-bloque-2`
Bloque 2 salvo lo indicado como pendiente: `CambiarEstadoUsuario` recibe `actorId` (no se bloquea a sí mismo) y, junto con `CambiarPasswordUsuario`, `CambiarMiPassword` (conserva la sesión actual) y el cambio de clave en `ActualizarUsuario`, cierra las sesiones del usuario (`AuthRepository.invalidarSesionesUsuario`). Nadie cambia su propio rol; asignar o retirar ADMIN_SISTEMA (también en `CrearUsuario`) exige un actor ADMIN_SISTEMA (`rol-admin-sistema.guard.js`, falla cerrado). `username` vacío rechazado en alta y edición; `tipo_referencia` validado contra el catálogo; `Object.hasOwn` en `ListarUsuarios`; `ValidationError` (400) sin `dominio` en la grilla; permiso 105 filtrado en `ObtenerPermisosUsuario`; `ActualizarPermisosRol` comprueba existencia antes de `rolId===1`; `CambiarMiPassword` cota el `usuarioId` con el usuario del token y rechaza claves de solo espacios.
**Pendiente del Bloque 2:** `BaseSearchUseCase`/`BaseListUseCase` (`searchTerm` nulo, cotas de `page`/`limit`) y el truncado de bcrypt a 72 bytes.

## Corregido en `fix/estudiantes-bloque-7`
Bloque 7 salvo lo indicado como pendiente: `UpdateEnrollment` valida y resuelve **todas** las filas del historial previo antes de borrar (una fila inválida ya no pierde el historial) y responde 404 si los datos académicos o la gestión están huérfanos; `DeleteStudent` rechaza (409) el borrado si hay pagos cobrados (cuota con monto > 0; las de monto 0 no bloquean) y lo comprueba antes de borrar nada; `GenerateActaCompromiso` manda `studentCode` al PDF; `porcentaje` de becas validado 0-100; `GetEnrollmentById` responde 404 (no 400); `GetStudentScholarship*` conservan `false`, `0%` y año 0; `GetHistorialAcademico` rechaza ids como `'5abc'` o `1.5`.
**Pendiente del Bloque 7:** transacción real en el borrado de estudiante y en el reemplazo del historial (los repositorios no aceptan `transaction`; hoy los soft delete son idempotentes y se reintentan) y la decisión sobre `CreateStudentScholarship` con tipo de beca inexistente (la prueba fija hoy que crea igual y avisa).

## Decisiones y preguntas (actualizado 2026-10-20)
Respondidas por el dueño del proyecto:
- **Integrantes de proyecto de grado (pregunta 2):** no se pueden agregar integrantes a un proyecto en estado final (CANCELADO/APROBADO/REPROBADO). → `AddIntegranteProyecto` debe rechazarlo.
- **Tribunal de defensa (pregunta 3):** los 3 miembros deben ser personas distintas. → `RegistrarActaDefensa._resolverTribunal` debe rechazar duplicados.
- **Estados de `paralelos_gestion` (pregunta 4):** no existe "cancelado". Un paralelo PUBLICADO solo se puede despublicar o pasar a "no ofertado". Estados reales: BORRADOR → OFERTADO → PUBLICADO → CERRADO. Máquina propuesta (confirmar al implementar): BORRADOR→OFERTADO; OFERTADO→PUBLICADO o →BORRADOR; PUBLICADO→OFERTADO (despublicar) o →BORRADOR (no ofertado); CERRADO es terminal (no se reabre). Con CERRADO no se cambia aula, cupos ni turno.
- **Estados de `GestionPlan` y `OfertaCurso` (pregunta 5):** el dueño cree que sí tiene máquina de estados, pero no lo recuerda. El código no la tiene hoy (acepta cualquier estado desde cualquiera), mientras que nivelación, folio, proyecto de grado y pasantía sí tienen sus `TRANSICIONES_*` en `domain/constants`. → Seguir ese patrón: definir `TRANSICIONES_*` para ambos y validarlas, empezando por flujos lineales (p. ej. oferta: PROGRAMADA→ACTIVA→CERRADA, y CANCELADA desde PROGRAMADA/ACTIVA) y **confirmar con el dueño antes de bloquear**.

- **Licencias del docente (pregunta 6):** se eliminan. `docentes.licencia.{ver,crear,aprobar}` (sembrados y apagados en el seed 60; no existe la tabla `licencias_docentes`) pasan a "fuera de alcance"; hay que quitarlos del seed y de la matriz. Las licencias de **estudiantes** (`academico.asistencia.licencia.*`) no cambian.

Aún sin resolver:
1. **Compuertas de bimestre.** Hoy `Update/Delete/ResetNotas` de evaluación exigen "bimestre vigente o reabierto" y `Create/Upsert/Guardar` usan `assertBimestreEditable` (estado institucional EN_CURSO o REABIERTO). La pregunta es si las seis acciones de *editar* deben usar la misma regla. El dueño respondió pensando en *consultar* las notas de todos los bimestres aunque no sea el vigente (eso ya es lectura y es válido); falta aclarar que **editar** un bimestre cerrado sigue requiriendo reapertura.
- **Estados de `paralelos_gestion`:** el dueño explicó el sentido de BORRADOR y OFERTADO (OFERTADO = ya pueden empezar las inscripciones) pero el mensaje quedó cortado antes de definir PUBLICADO; completar antes de implementar la máquina de estados.

## Bloque 1 — Dinero y recibos (pagos)
| Prioridad | Archivo | Defecto |
|---|---|---|
| Alta | `GenerateReciboPagoUseCase.js` (~190-200 y `_executeReciboPorCuota`) | `||` en cadena con un `400.00` fijo: con `amountPaid=0` el recibo muestra como pagado el total; con total 0 o ausente imprime 400. |
| Alta | `UpdatePaymentInstallmentUseCase.js` (~52) | `amount: ''` → `Number('')=0`: cuota "gratuita"; en efectivo además borra cuenta, transacción y comprobante. |
| Alta | `UpdateContributionConfigurationUseCase.js` / `Create…` | `monto_base: ''` se guarda como 0 (Create lo rechaza); `Infinity` se acepta. |
| Media | `GetCuentasPorCobrarReporteUseCase.js` (`_buildEstudiante`) | `Number(null)=0` es finito: matriculado sin cabecera queda con deuda 0 y AL_DIA (el comentario dice que cae al monto máximo). |
| Media | `SetEstadoBancoAutorizado/CuentaPago/MetodoPago` | `Boolean(activo)`: sin `activo` desactiva; `'false'` activa. Igual en `activo` de los `Update*`. |
| Media | `UpdateCompromisoUseCase.js` / `UpsertCompromisoUseCase.js` | `'2026-02-31'` rueda a marzo y se acepta. |
| Media | `UpdateAuthorizedBank/UpdatePaymentAccount` | `metodo_pago_id`/`banco_id` no numéricos se guardan como `NaN`. |
| Media | `update-cuota.controller.js` | Manda `null` en cuenta/transacción/comprobante/descripción si se omiten: una edición parcial limpia esos campos. |
| Menor | `CreateInscripcionCapacitacion` | El mensaje de pago inicial mayor al costo dice "saldo pendiente". |

## Bloque 2 — Seguridad y usuarios
| Prioridad | Archivo | Defecto |
|---|---|---|
| Alta | `CambiarEstadoUsuarioUseCase.js` | No recibe `actorId`: un admin puede bloquearse/suspenderse a sí mismo (último admin ⇒ sistema sin admin). `EliminarUsuario` sí lo comprueba. |
| Alta | `CambiarEstadoUsuario`, `CambiarPasswordUsuario`, `CambiarMiPassword` | No invalidan las sesiones del usuario (verificar `AuthRepository`). Tras bloquear o resetear la clave el token sigue vigente. |
| Alta | `ActualizarUsuarioUseCase.js` (~72) | `rol_id` solo comprueba existencia: se puede asignar ADMIN_SISTEMA a cualquiera o degradarse a sí mismo. `CrearUsuario` histórico no valida `tipo_referencia` contra `TIPOS_REFERENCIA_VALUES`. |
| Media | `CrearUsuarioUseCase.js` (~128), `ActualizarUsuarioUseCase.js` (~67) | `username` vacío/espacios se acepta. |
| Baja | `ListarUsuariosUseCase.js` (~41) | `categoria=constructor` toma una clave heredada de Object (posible 500): usar `Object.hasOwn`. |
| Baja | `ObtenerPermisosGrillaRolUseCase.js` (~14) | `Error` genérico (500) si falta `dominio`: debe ser 4xx. |
| Baja | `ObtenerPermisosUsuarioUseCase` | No filtra el permiso técnico 105 (sí lo hacen los de rol). `ActualizarPermisosRol` comprueba `rolId===1` antes de existencia. |
| Baja | `BaseSearchUseCase.js` (~70), `BaseListUseCase.js` (~191) | `searchTerm` nulo ⇒ `TypeError`; `page`/`limit` sin cotas. |
| Baja | `CambiarMiPasswordUseCase.js` (~33) | Busca por `username` y actualiza por `usuarioId` sin cotejar (confirmar que el controller toma ambos del token). Contraseña de 8 espacios aceptada; bcrypt trunca a 72 bytes. |

## Bloque 3 — Cadena de negocio (oferta, docentes, horarios, notas)
| Prioridad | Archivo | Defecto |
|---|---|---|
| Alta | `UpdateTeacherAssignmentUseCase.js` (~162) | Reactivar una asignación inactiva (`{vigente:true}`) no retira las demás ⇒ dos vigentes para la misma oferta. `willBeVigente` debe depender del resultado final. |
| Alta | `AssignTeacherToCourseUseCase.js` (~109) | `carga_horaria:'abc'`/negativa en asignación vigente existente ⇒ `hours: NaN`; sin rango 0-200. |
| Alta | `UpdateParaleloGestionEstadoUseCase.js` | Solo valida transiciones a OFERTADO/PUBLICADO: un CERRADO se reabre y un PUBLICADO vuelve a BORRADOR. |
| Alta | `UpdateParaleloGestionUseCase.js` | Permite cambiar aula/cupos en PUBLICADO/CERRADO; acepta `cupo_maximo:-5`, `cupo_minimo>cupo_maximo`, `"abc"`. |
| Alta | `DeleteOfertaCursoUseCase.js` | Solo revisa matrículas: borra una oferta con `asignaciones_docentes` o bloques, dejando la cadena colgando. |
| Alta | `CreateOfertaCursoUseCase.js` | No comprueba que la asignatura sea del plan/periodo del paralelo ni el estado del paralelo; ids sin convertir. |
| Alta | `PutParaleloScheduleUseCase.js` (~117-139) | Bloques duplicados (mismo curso, día y hora) se insertan repetidos; un `cursoId` repetido sobrescribe en silencio. |
| Media | `MarcarGestionVigenteUseCase.js`, `MarcarPlanEstudiosVigenteUseCase.js` | Desmarca y marca sin transacción: si falla el segundo, queda sin vigente. |
| Media | `CambiarTurnoParaleloGestionUseCase.js` (TODO "Sprint 5") | No reubica los bloques; existe `…ConBloquesUseCase` en `horarios/`: confirmar cuál usa la ruta. |
| Media | `ListTeachersUseCase.js` (~31) | `_skipTeachingStats` en la instancia: riesgo de contagio entre peticiones si el use case es singleton. |
| Media | `CambiarTurno…ConBloques` (~35-44) | Validación `assertParaleloGestionHorarioEditable` muerta; lecturas fuera de la transacción. |
| Baja | `CreatePrerrequisitoUseCase.js` | Permite auto-prerrequisito, ciclos, duplicados y asignaturas de otro plan. |

## Bloque 4 — Fechas, licencias y asistencia
| Prioridad | Archivo | Defecto |
|---|---|---|
| Alta | `CrearLicenciaUseCase.js` (44-62), `EditarLicenciaUseCase.js` (71-95) | Fechas no parseables: `totalDays: NaN` y el tope de días (`NaN>15`) no salta. |
| Alta | `asistenciaCalendario.js` (`toISODate`, ~14) | No valida el formato: `'abc'` esquiva los `if(!fecha)` en CrearSesionEspecial, EliminarSesionEspecial, planilla semanal y Bulk. Arreglarlo cierra varios. |
| Media | `CerrarRegistroAsistencia`, `ReabrirRegistroAsistencia` | `fecha` sin validar; bimestre inválido da `NotFoundError` (debería ser `ValidationError`; las pruebas hoy fijan el NotFound). |
| Media | `RegistrarEventoHistorialMatriculaUseCase.js` (`_resolverAncla`, ~691) | Ancla no numérica pasa y llega como `NaN` a `expireCurrentBySubjectEnrollmentId` y `create`. |
| Media | `CreateGestion/UpdateGestion` (43-56 / 78-90) | `fecha_inicio='abc'` pasa (Invalid Date); `UpdateGestion` compara `id` con `!==` estricto. |
| Media | `UpdatePeriodoFechasUseCase.js`, `CreateActividadCronograma`, `UpdateActividadCronograma` | Fechas no obligatorias o sin validar el rango. |
| Baja | `ListParalelos`, `ListGestiones` (`?vigente=true`⇒false), `GetHorariosPublicacionPlanes`/`SidebarPendientes` (`paralelo_id=null`⇒0), `ProgramarNivelacion` | Filtros con `NaN`; booleanos; ids nulos. |

## Bloque 5 — Titulación y pasantías
| Prioridad | Archivo | Defecto |
|---|---|---|
| Alta | `RegistrarActaDefensaUseCase.js` (`_validarCalificaciones`, ~191) | `calificacionFinal` nulo o `''` ⇒ 0: acta EMITIDA con nota 0 y REPRUEBA sin error. Tribunal con docentes repetidos (el tribunal debe tener 3 docentes distintos: decidido). |
| Alta | `AprobarEtapaProyectoUseCase.js` (~115-130) | `nota:'abc'` ⇒ notas en `NaN`; sin rango 0-100. |
| Media | `CreateProyectoGradoUseCase.js` (~90) | `titulo` ausente ⇒ `"undefined"`; vacío se guarda vacío. |
| Media | `CreateBitacoraEntradaUseCase.js` (79-101) | `porcentajeAvance:'abc'` pasa la regla monotónica y se guarda; sin tope 0-100. |
| Media | `ListProyectosGrado`, `ListEstudiantesElegibles…`, `GetSeguimientoTutoria*`, `GetAvanceTutoriaCarrera` | Filtros `NaN`; `mes` fuera de 1-12; `page`/`limit` negativos ⇒ `totalPages` negativo. |
| Media | `AsignarTutorProyecto`, `UpdateProyectoGrado`, `UpdateIntegranteProyecto`, `UpdateBitacoraEntrada` | Ids/valores (`estado`, `rol`, notas) sin validar (confirmar validación en ruta). |
| Info | Seguimientos e informes de pasantías | `fecha`/`nivelDesempeno` y `resultado` no se validan en el use case, pero sí en `pasantias.validator.js` y en el ENUM del modelo: sin acción. |

## Bloque 6 — Configuración, referencia, capacitación, fichas
| Prioridad | Archivo | Defecto |
|---|---|---|
| Alta | `paraleloPayload.js` (14, 37-39) | `UpdateParalelo` no admite actualización parcial: `execute(3,{turno:'NOCHE'})` ⇒ `ValidationError('nombre es requerido')`. `nombre` numérico ⇒ `TypeError`; `parseInt("12abc")` se acepta. (Dos `it.failing`.) |
| Media | `CreatePeriodo`, `CreateAsignaturaPlan`, `CreatePlanEstudios`, `CreatePrerrequisito` | `!valor` sin tipo: `"abc"`/negativos pasan. `Update*` sin ninguna validación y con `??` que impide vaciar un campo con `null`. |
| Media | `CreateCursoCapacitacion`, `UpdateCursoCapacitacion` | `cupoMaximo` `NaN`/negativo/decimal y fechas basura. |
| Media | `RegisterPagoCapacitacionUseCase.js` (84-90) | `cuentaPagoId:'abc'` ⇒ `NaN` falsy: se salta la validación de la cuenta y se guarda `NaN`. |
| Media | `ListMaterias`, `ListProvincias`, `ListMunicipios`, `ListInscripcionesCapacitacion`, `ListFichasSeguimiento`, `ListTeacherAssignments` | Filtros no numéricos ⇒ `NaN` al repositorio. |
| Media | `CreateMateriaUseCase.js` + `SubjectMapper` | Guarda `knowledgeArea` pero el mapper no devuelve `areaConocimiento`. |
| Baja | `CreateDocumentacion` / `UpdateDocumentacion` | `documentoPadreId: 0` se trata distinto; no se puede quitar el padre con `null`. |
| Baja | 4 `Get*ById` de catálogos | Devuelven `null` (no `NotFoundError`): revisar el controller (podría dar 200 vacío). |
| Baja | `DeleteAsignaturaPlan/Periodo/Prerrequisito` | Sin log y sin comprobar referencias (dependen de FK). |
| Baja | `GetTeacherDetail`, `UpdateTeacher`, `Get/UpdateFichaSeguimiento`, `CreateFichaSeguimiento` | `id` sin validar; `estudiantesAsistentes:'abc'` pasa la coherencia. |

## Bloque 7 — Estudiantes, becas e inscripciones
| Prioridad | Archivo | Defecto |
|---|---|---|
| Alta | `UpdateEnrollmentUseCase.js` (`_replacePriorEnrollmentHistory`) | Borra todo el historial previo y luego valida cada fila (`parsePriorHistoryItem`) sin transacción: con una fila inválida se pierde el historial y se lanza `ValidationError`. Validar todo antes de borrar o usar transacción. |
| Alta | `DeleteStudentUseCase.js` | Borrado en cascada sin transacción; borra pagos, cuotas y becas sin comprobar cuotas ya cobradas; si falla el delete del estudiante, los hijos ya se perdieron. |
| Alta | `GenerateActaCompromisoUseCase.js:247` | `student.codigoEstudiante` sobre la entidad de dominio (`studentCode`): llega `undefined` al PDF. (`GenerateDeclaracionJurada` está bien: usa el estudiante normalizado.) |
| Media | `CreateBecaDescuentoUseCase`, `UpdateBecaDescuentoUseCase` | `porcentaje` sin validar (`NaN`, `-5`, `150`); en `CreateStudentScholarship` produce descuento `NaN` o mayor que el monto base. |
| Media | `GetEnrollmentByIdUseCase.js` (`_get*ById`) | Lanza `ValidationError` (400) en vez de `NotFoundError` (404) cuando no existe. |
| Media | `UpdateEnrollmentUseCase.js` (`executePriorHistoryOnly` y rama `priorHistory`) | `academicDataId` huérfano ⇒ `TypeError` (500) en vez de `NotFoundError`. |
| Media | `CreateStudentScholarshipUseCase.js` | Si el tipo de beca no existe al actualizar el aporte, crea la asignación igual y solo avisa (la prueba lo fija hoy; confirmar si es lo deseado). |
| Baja | `GetStudentScholarshipByIdUseCase.js` | `a || b` devuelve `undefined` en vez de `false`/`null` (`documentsComplete`, fechas de entrega). |
| Baja | `GetStudentScholarshipsByStudentIdUseCase.js` | `percentage || null` convierte 0% en `null`; igual `managementYear` 0. |
| Baja | `GetHistorialAcademicoUseCase.js` | `parseInt('5abc')` ⇒ 5; `1.5` ⇒ 1. |

## Patrón común (atacar con un helper)
Casi todo es el mismo fallo: `Number('abc')` = `NaN`, que es *falsy* o no entra en comparaciones. Propuesta: helper de validación compartido en `application/utils/` (ids enteros positivos, números en rango, fechas ISO reales —rechazando `2026-02-31`—, booleanos estrictos, paginación acotada) y que lancen `ValidationError`. Después, repasar los use cases listados arriba. Cada uso lleva su prueba.

## Orden sugerido
1. Dinero (Bloque 1) y seguridad (Bloque 2).
2. Cadena de negocio y estados (Bloque 3) y notas/actas (Bloque 5, alta).
3. Helper común + el resto de validaciones numéricas y de fecha (Bloques 4 a 6).
4. Bloque 7 (historial de inscripción y borrado de estudiante, ambos sin transacción) justo después de dinero y seguridad.
5. Resolver las preguntas abiertas y, si procede, convertirlas en reglas.
