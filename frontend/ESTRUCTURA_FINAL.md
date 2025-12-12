# 📁 ESTRUCTURA FINAL SIMPLIFICADA

## Solo lo necesario para crear estudiante

---

## 🎯 ESTRUCTURA ACTUAL (LIMPIA)

```text
frontend/src/
├── core/                           # 🎯 LÓGICA DE NEGOCIO
│   ├── entities/
│   │   ├── Student.js              # ✅ Entidad con lógica de negocio
│   │   └── index.js
│   ├── repositories/
│   │   ├── IStudentRepository.js  # ✅ Contrato del repositorio
│   │   └── index.js
│   └── useCases/
│       └── estudiantes/
│           ├── CreateStudentUseCase.js  # ✅ ÚNICO use case
│           └── index.js
│
├── application/                     # 🎯 CONECTA UI CON NEGOCIO
│   └── modules/
│       └── estudiantes/
│           ├── hooks/
│           │   ├── useCreateStudent.js  # ✅ Hook que conecta UI con use case
│           │   └── index.js
│           ├── providers/
│           │   ├── StudentProvider.jsx  # ✅ Provider con Context API
│           │   └── index.js
│           └── index.js
│
├── infrastructure/                  # 🎯 IMPLEMENTACIONES TÉCNICAS
│   ├── api/
│   │   └── client.js               # ✅ Cliente HTTP (Axios)
│   └── repositories/
│       └── StudentRepository.js    # ✅ Implementa IStudentRepository
│
├── presentation/                    # 🎯 UI Y COMPONENTES
│   ├── components/
│   │   ├── atoms/                  # Componentes básicos
│   │   ├── molecules/              # Componentes compuestos
│   │   │   └── NavigationMenu/
│   │   │       └── useNavigationMenu.jsx  # ⚠️ Hook de COMPONENTE (UI)
│   │   └── organisms/              # Componentes complejos
│   └── pages/
│       └── estudiantes/
│           └── Create/
│               └── Create.jsx      # ✅ Página (aún no refactorizada)
│
└── shared/                         # 🎯 CÓDIGO TÉCNICO
    ├── config/
    ├── utils/
    └── constants/
```

---

## 🔑 DIFERENCIAS CLAVE

### 1. HOOKS

#### ✅ `application/modules/estudiantes/hooks/useCreateStudent.js` **Hook de APLICACIÓN**

- ✅ Usa use cases
- ✅ Conecta UI con lógica de negocio
- ✅ Reutilizable en múltiples páginas

#### ⚠️ `presentation/components/.../useNavigationMenu.jsx` **Hook de COMPONENTE**

- ⚠️ Solo lógica de UI
- ⚠️ Específico del componente
- ⚠️ NO usa use cases

**Regla:** Si usa use cases → `application/`, si solo es UI → `presentation/`

---

### 2. PROVIDERS

#### ✅ `application/modules/estudiantes/providers/StudentProvider.jsx` **Provider de MÓDULO**

- ✅ Estado compartido del módulo Estudiantes
- ✅ Usa hooks de aplicación
- ✅ Se usa en múltiples páginas

**NO hay:** `application/providers/` (eliminado, estaba vacío)

---

### 3. SERVICES

**NO hay servicios por ahora** (carpetas eliminadas)

Si necesitas servicios en el futuro:

- **Lógica de negocio** → `core/services/`
- **Lógica de aplicación** → `application/modules/[modulo]/services/`

---

## 📊 FLUJO SIMPLIFICADO

```text
Create.jsx (PRESENTATION)
    ↓ usa
useStudentContext() (APPLICATION - Provider)
    ↓ usa
useCreateStudent() (APPLICATION - Hook)
    ↓ llama
CreateStudentUseCase.execute() (DOMAIN - Use Case)
    ↓ crea y valida
new Student() (DOMAIN - Entity)
    ↓ llama
StudentRepository.create() (INFRASTRUCTURE)
    ↓ llama
apiClient.post() (INFRASTRUCTURE)
    ↓
BACKEND API
```

---

## ✅ ARCHIVOS CLAVE (Solo crear estudiante)

1. **Domain Layer:**
   - `core/entities/Student.js` - Entidad con lógica
   - `core/repositories/IStudentRepository.js` - Contrato
   - `core/useCases/estudiantes/CreateStudentUseCase.js` - Use case

2. **Application Layer:**
   - `application/modules/estudiantes/hooks/useCreateStudent.js` - Hook
   - `application/modules/estudiantes/providers/StudentProvider.jsx` - Provider

3. **Infrastructure Layer:**
   - `infrastructure/repositories/StudentRepository.js` - Implementación
   - `infrastructure/api/client.js` - Cliente HTTP

4. **Presentation Layer:**
   - `presentation/pages/estudiantes/Create/Create.jsx` - Página (a refactorizar)

---

## 🎓 RESUMEN

**Estructura limpia:**

- ✅ Solo lo necesario para crear estudiante
- ✅ Sin carpetas vacías
- ✅ Separación clara de responsabilidades
- ✅ Fácil de entender y mantener

**Próximo paso:** Refactorizar `Create.jsx` para usar `useStudentContext()`

---

**¿Todo más claro ahora?** 🎯
