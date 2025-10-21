# Suite de Pruebas Unitarias - Alexandria Web

## 📋 Resumen General

Se ha implementado una suite completa de pruebas unitarias para el proyecto Alexandria Web utilizando **Jest** y **React Testing Library**. La suite cubre los módulos principales del sistema con un total de **49 pruebas** distribuidas en **8 archivos de test**.

## ✅ Estado de las Pruebas

```
Test Suites: 8 passed, 8 total
Tests:       49 passed, 49 total
Snapshots:   0 total
```

## 🎯 Módulos Cubiertos

### 1. **Utilidades Generales** (`lib/utils.ts`)
**Archivo:** `lib/__tests__/utils.test.ts`  
**Pruebas:** 7 tests

Cobertura de la función `cn()` para combinar clases CSS:
- ✓ Combinación básica de clases
- ✓ Manejo de clases condicionales
- ✓ Merge de clases Tailwind
- ✓ Manejo de inputs vacíos
- ✓ Manejo de valores undefined y null
- ✓ Manejo de arrays de clases
- ✓ Manejo de objetos con valores booleanos

### 2. **Cliente HTTP** (`lib/api/http.ts`)
**Archivo:** `lib/api/__tests__/http.test.ts`  
**Pruebas:** 10 tests

Cobertura de la función `fetchJson()`:
- ✓ Fetch y parseo JSON exitoso
- ✓ Adición de trailing slash para POST requests
- ✓ Adición de trailing slash para rutas search/
- ✓ Manejo correcto de query parameters
- ✓ Manejo de errores HTTP
- ✓ Inclusión de Content-Type header
- ✓ Parseo como texto cuando se especifica
- ✓ Preservación de headers personalizados
- ✓ No agregar trailing slash a archivos con extensión
- ✓ Normalización de paths

### 3. **Autenticación - Cookies** (`lib/auth/cookies.ts`)
**Archivo:** `lib/auth/__tests__/cookies.test.ts`  
**Pruebas:** 6 tests

Cobertura de constantes y configuración de cookies:
- ✓ Exportación de constantes ACCESS_COOKIE y REFRESH_COOKIE
- ✓ Valor correcto de refreshMaxAge (7 días)
- ✓ Configuración httpOnly
- ✓ Configuración sameSite
- ✓ Configuración path
- ✓ Configuración secure basada en NODE_ENV

### 4. **Autenticación - Password Reset API** (`lib/auth/password/api.ts`)
**Archivo:** `lib/auth/password/__tests__/api.test.ts`  
**Pruebas:** 8 tests

Cobertura de funciones de reset de contraseña:
- ✓ `requestPasswordReset()` - Envío de solicitud
- ✓ `requestPasswordReset()` - Manejo de errores
- ✓ `requestPasswordReset()` - Manejo de errores de parseo
- ✓ `resendPasswordReset()` - Reenvío de email
- ✓ `confirmPasswordReset()` - Confirmación con OTP
- ✓ `confirmPasswordReset()` - Validación de errores
- ✓ `passwordResetStatus()` - Consulta de estado
- ✓ `passwordResetStatus()` - Encoding de caracteres especiales

### 5. **Search Store - Utilidades** (`lib/search/store/utils.ts`)
**Archivo:** `lib/search/store/__tests__/utils.test.ts`  
**Pruebas:** 3 tests

Cobertura de la función `nextDraftId()`:
- ✓ Generación de IDs negativos secuenciales
- ✓ Generación de IDs únicos
- ✓ Garantía de números negativos

### 6. **Search Store - Types** (`lib/search/store/types.ts`)
**Archivo:** `lib/search/store/__tests__/types.test.ts`  
**Pruebas:** 6 tests

Cobertura de la función `toUIMessage()`:
- ✓ Conversión de mensaje API a formato UI
- ✓ Manejo de rol assistant
- ✓ Manejo de rol system
- ✓ Preservación de ID de mensaje
- ✓ Conversión de text a content y created_at a createdAt
- ✓ Exclusión de propiedades internas (session, feedback)

### 7. **Next.js URLs** (`lib/next/urls.ts`)
**Archivo:** `lib/next/__tests__/urls.test.ts`  
**Pruebas:** 6 tests

Cobertura de la función `getBaseUrl()`:
- ✓ Construcción de URL desde headers x-forwarded
- ✓ Fallback a header host
- ✓ Protocolo por defecto (http)
- ✓ Host por defecto (localhost:3000)
- ✓ Manejo de números de puerto
- ✓ Priorización de x-forwarded-host

### 8. **App Paths** (`lib/appPaths.ts`)
**Archivo:** `lib/__tests__/appPaths.test.ts`  
**Pruebas:** 3 tests

Cobertura de constantes de rutas:
- ✓ Exportación de HOME_PATH
- ✓ Verificación de tipo string
- ✓ Verificación de formato de ruta

## 🛠️ Configuración Implementada

### Archivos de Configuración

1. **`jest.config.js`**
   - Configuración de Next.js para Jest
   - Mapeo de alias `@/` 
   - Configuración de cobertura con umbral del 50%
   - Exclusión de archivos no relevantes

2. **`jest.setup.js`**
   - Importación de `@testing-library/jest-dom`
   - Mock de Next.js router y navigation
   - Mock global de fetch
   - Reset de mocks antes de cada test

### Dependencias Instaladas

```json
{
  "devDependencies": {
    "jest": "^30.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "jest-environment-jsdom": "^30.x",
    "@types/jest": "^29.x",
    "ts-jest": "^29.x"
  }
}
```

## 🚀 Comandos Disponibles

### Ejecutar todas las pruebas
```bash
npm test
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

### Generar reporte de cobertura
```bash
npm run test:coverage
```

### Ejecutar en CI/CD
```bash
npm run test:ci
```

## 📊 Estructura de Archivos de Test

```
lib/
├── __tests__/
│   ├── utils.test.ts
│   └── appPaths.test.ts
├── api/
│   └── __tests__/
│       └── http.test.ts
├── auth/
│   ├── __tests__/
│   │   └── cookies.test.ts
│   └── password/
│       └── __tests__/
│           └── api.test.ts
├── next/
│   └── __tests__/
│       └── urls.test.ts
└── search/
    └── store/
        └── __tests__/
            ├── utils.test.ts
            └── types.test.ts
```

## 🎨 Patrones de Testing Implementados

### 1. **Mocking de Fetch API**
```typescript
global.fetch = jest.fn()
;(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => mockData,
})
```

### 2. **Mocking de Next.js Modules**
```typescript
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))
```

### 3. **Testing de Funciones Puras**
```typescript
it('should merge class names correctly', () => {
  const result = cn('foo', 'bar')
  expect(result).toBe('foo bar')
})
```

### 4. **Testing de Manejo de Errores**
```typescript
await expect(
  requestPasswordReset({ email: 'invalid' })
).rejects.toThrow('Invalid email')
```

## 📈 Métricas de Calidad

- **Total de Tests:** 49
- **Tasa de Éxito:** 100%
- **Módulos Cubiertos:** 8
- **Tiempo de Ejecución:** ~3.5 segundos

## 🔍 Áreas de Cobertura

### Funcionalidades Cubiertas
- ✅ Utilidades CSS y helpers
- ✅ Cliente HTTP y manejo de APIs
- ✅ Autenticación y gestión de cookies
- ✅ Reset de contraseñas (flujo completo)
- ✅ Store de búsqueda (utilidades y tipos)
- ✅ Manejo de URLs y rutas
- ✅ Constantes de aplicación

### Tipos de Tests Implementados
- ✅ Tests unitarios de funciones puras
- ✅ Tests de integración con APIs mockeadas
- ✅ Tests de manejo de errores
- ✅ Tests de validación de datos
- ✅ Tests de transformación de tipos

## 💡 Recomendaciones para Extensión

### Próximos Módulos a Testear
1. **Componentes React** - Agregar tests para componentes UI principales
2. **Store Completo** - Testear `coreSlice.ts` con sus acciones
3. **API Routes** - Testear endpoints de Next.js
4. **Hooks Personalizados** - Testear `useTheme` y otros hooks
5. **Validaciones de Formularios** - Testear schemas de Zod

### Mejoras Sugeridas
- Implementar tests de integración E2E con Playwright
- Agregar tests de snapshot para componentes
- Configurar CI/CD para ejecutar tests automáticamente
- Aumentar umbral de cobertura gradualmente
- Agregar tests de performance para funciones críticas

## 📝 Notas Adicionales

- Los tests están configurados para ejecutarse en un entorno jsdom que simula el navegador
- Se incluyen mocks para Next.js navigation y headers
- Todos los tests son independientes y pueden ejecutarse en paralelo
- La configuración está optimizada para TypeScript y Next.js 15

## ✨ Conclusión

La suite de pruebas implementada proporciona una base sólida para garantizar la calidad del código en Alexandria Web. Con **49 tests pasando al 100%**, los módulos principales del sistema están cubiertos, facilitando el desarrollo seguro y la detección temprana de regresiones.

---

**Fecha de Implementación:** Octubre 2025  
**Framework de Testing:** Jest + React Testing Library  
**Versión de Node:** 23.11.0  
**Versión de Next.js:** 15.4.6
