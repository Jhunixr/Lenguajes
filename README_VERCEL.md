# 🚀 Guía de Deploy en Vercel

## Pasos para desplegar en Vercel

### 1. Preparar el proyecto

Asegúrate de que tu proyecto tenga:
- ✅ `package.json` con todas las dependencias
- ✅ Script `build` configurado
- ✅ Archivo `vercel.json` (ya está incluido)

### 2. Conectar con Vercel

#### Opción A: Desde la Web de Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub/GitLab/Bitbucket
3. Haz clic en "New Project"
4. Importa tu repositorio
5. Vercel detectará automáticamente que es un proyecto React

#### Opción B: Desde la CLI
```bash
npm i -g vercel
vercel
```

### 3. Configurar Variables de Entorno

**IMPORTANTE:** Debes configurar las variables de entorno en Vercel:

1. En tu proyecto de Vercel, ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

```
REACT_APP_SUPABASE_URL = https://thbfcdmtultbzuclhfcv.supabase.co
REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoYmZjZG10dWx0Ynp1Y2xoZmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODgyMDYsImV4cCI6MjA3ODU2NDIwNn0.5gD6ASKJSnrCD9TmUr9XL8Qvr76vmk4Q7xnd6zZa--4
```

3. Asegúrate de seleccionar todos los ambientes (Production, Preview, Development)
4. Haz clic en "Save"

### 4. Configuración del Build

Vercel debería detectar automáticamente:
- **Framework Preset:** Create React App
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

Si no se detecta automáticamente, configúralo manualmente en **Settings** → **General** → **Build & Development Settings**

### 5. Hacer Deploy

1. Haz push a tu repositorio
2. Vercel desplegará automáticamente
3. O haz clic en "Deploy" en el dashboard de Vercel

## Solución de Problemas

### Error: "Module not found: @supabase/supabase-js"
✅ **Solución:** Ya está resuelto. La dependencia está en `package.json`

### Error: "Environment variables not found"
✅ **Solución:** Configura las variables de entorno en Vercel (paso 3)

### Error: "404 Not Found" al navegar
✅ **Solución:** El archivo `vercel.json` ya está configurado para manejar rutas SPA

### La app carga pero no se conecta a Supabase
✅ **Solución:** 
1. Verifica que las variables de entorno estén configuradas
2. Asegúrate de que los valores sean correctos (sin espacios)
3. Haz un nuevo deploy después de agregar las variables

### Build falla
✅ **Solución:**
1. Verifica que `npm run build` funcione localmente
2. Revisa los logs de build en Vercel
3. Asegúrate de que todas las dependencias estén en `package.json`

## Verificar el Deploy

Después del deploy, verifica:
1. ✅ La página carga correctamente
2. ✅ Puedes registrarte/iniciar sesión
3. ✅ Las citas se guardan (verifica en Supabase)
4. ✅ El chatbot funciona
5. ✅ El diseño responsive funciona

## Notas Importantes

- Las variables de entorno deben empezar con `REACT_APP_` para que React las reconozca
- Después de agregar variables de entorno, necesitas hacer un nuevo deploy
- Vercel hace deploy automático en cada push a la rama principal
- Puedes ver los logs de build en tiempo real en el dashboard de Vercel

