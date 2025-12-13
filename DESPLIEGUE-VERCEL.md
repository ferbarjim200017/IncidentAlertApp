# Guía de Despliegue - Ramas Main y QA2

## 📋 Configuración Actual

Este proyecto tiene dos ramas principales:
- **main** - Rama de producción
- **QA2** - Rama de pruebas/pre-producción

## 🚀 Despliegue en Vercel

### Paso 1: Configuración Inicial en Vercel

1. **Accede a Vercel**
   - Ve a: https://vercel.com
   - Inicia sesión con tu cuenta de GitHub

2. **Importa el Proyecto**
   - Click en "Add New..." → "Project"
   - Selecciona tu repositorio: `ferbarjim200017/IncidentAlertApp`
   - Click en "Import"

3. **Configuración del Proyecto**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Production Branch**: `main`
   - Click en "Deploy"

4. **Obtener Tokens para Despliegue Automático**
   - Ve a tu perfil: https://vercel.com/account/tokens
   - Click en "Create Token"
   - Nombre: "GitHub Actions Deploy"
   - Scope: "Full Account"
   - Copia el token (guárdalo, no se mostrará de nuevo)

5. **Obtener IDs del Proyecto**
   - En tu proyecto de Vercel, ve a "Settings" → "General"
   - Copia el **Project ID**
   - Ve a tu perfil → "Settings" → "General"
   - Copia el **Team/Org ID** (o usa tu User ID si es personal)

### Paso 2: Configurar Secrets en GitHub

1. **Ve a tu repositorio en GitHub**
   - https://github.com/ferbarjim200017/IncidentAlertApp

2. **Configurar Secrets**
   - Click en "Settings" → "Secrets and variables" → "Actions"
   - Click en "New repository secret"
   
3. **Agregar estos 3 secrets:**
   - **VERCEL_TOKEN**: El token que generaste en Vercel
   - **VERCEL_ORG_ID**: Tu Team/Org ID de Vercel
   - **VERCEL_PROJECT_ID**: El Project ID de tu proyecto

### Paso 3: Activar Despliegues Automáticos

Una vez configurados los secrets, los GitHub Actions se activarán automáticamente:
- Cada push a **main** desplegará a producción
- Cada push a **QA2** desplegará a preview/QA

### URLs que obtendrás:

**Ambas ramas se despliegan en Vercel:**

**Main (Producción)**:
```
https://incident-alert-app.vercel.app
https://incident-alert-app-git-main-[tu-username].vercel.app
```

**QA2 (Pre-producción/Testing)**:
```
https://incident-alert-app-git-qa2-[tu-username].vercel.app
```

**¿Dónde ver las URLs?**
- Vercel Dashboard: https://vercel.com/dashboard
- O en el log de GitHub Actions después de cada despliegue

### Despliegue Manual (Opcional)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Iniciar sesión
vercel login

# Desplegar rama QA2
git checkout QA2
vercel --prod

# Desplegar rama main
git checkout main
vercel --prod
```

---

## 🔄 Workflow de Desarrollo

### Trabajar en QA2
```bash
# Cambiar a rama QA2
git checkout QA2

# Hacer cambios...
# git add .
# git commit -m "Tu mensaje"
git push origin QA2
```
✅ Vercel desplegará automáticamente en la URL de QA2

### Pasar a Producción (Main)
Una vez probado todo en QA2:

```bash
# Cambiar a main
git checkout main

# Traer cambios de QA2
git merge QA2

# Subir a main
git push origin main
```
✅ Vercel desplegará automáticamente en la URL de producción

---

## 📊 Configuración de Firebase

Si usas Firebase, necesitarás configurar variables de entorno en Vercel:

1. Ve a tu proyecto en Vercel
2. "Settings" → "Environment Variables"
3. Agrega las siguientes variables (si aplica):
   ```
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

---

## 🔗 Enlaces Útiles

- **Repositorio GitHub**: https://github.com/ferbarjim200017/IncidentAlertApp
- **Rama Main**: https://github.com/ferbarjim200017/IncidentAlertApp/tree/main
- **Rama QA2**: https://github.com/ferbarjim200017/IncidentAlertApp/tree/QA2
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🎯 Resumen Rápido

### Estás en: Rama QA2 ✅

**Para hacer cambios:**
```bash
# Ya estás en QA2, solo haz:
git add .
git commit -m "Descripción de cambios"
git push origin QA2
```

**Para probar los cambios:**
- Espera el despliegue automático de Vercel
- Visita: `https://incident-alert-app-git-qa2-ferbarjim200017.vercel.app`

**Para subir a producción:**
```bash
git checkout main
git merge QA2
git push origin main
```

---

## ⚠️ Notas Importantes

1. **Siempre prueba en QA2 primero** antes de mergear a main
2. Los despliegues son automáticos en ambas ramas
3. Cada push a cualquier rama despliega automáticamente
4. Puedes ver el progreso en: https://vercel.com/dashboard
5. Si no tienes cuenta en Vercel, créala con tu GitHub

---

## 🆘 Problemas Comunes

### "No puedo hacer push a QA2"
```bash
git config credential.username "ferbarjim200017"
git push origin QA2
```

### "Los cambios no se ven reflejados"
- Espera 1-2 minutos para el despliegue
- Recarga la página con Ctrl+F5 (limpia caché)
- Verifica en Vercel Dashboard el estado del despliegue

### "Quiero volver a main"
```bash
git checkout main
```
