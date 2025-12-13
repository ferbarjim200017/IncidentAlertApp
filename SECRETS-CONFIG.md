# 🔐 Configuración de Secrets - COPIAR Y PEGAR

## 📍 Ve a esta URL:
https://github.com/ferbarjim200017/IncidentAlertApp/settings/secrets/actions

---

## ➕ Agrega estos 3 secrets:

### 1️⃣ VERCEL_TOKEN
```
GBYlHOU1tzCihKAdTvh0twEu
```

**Pasos:**
1. Click en "New repository secret"
2. Name: `VERCEL_TOKEN`
3. Secret: Copia y pega el valor de arriba
4. Click "Add secret"

---

### 2️⃣ VERCEL_ORG_ID
```
OKxmNTRaWRBUWcHeUhXMwiqR
```

**Pasos:**
1. Click en "New repository secret"
2. Name: `VERCEL_ORG_ID`
3. Secret: Copia y pega el valor de arriba
4. Click "Add secret"

---

### 3️⃣ VERCEL_PROJECT_ID
```
prj_Rwvekt8RffTjh9kNGtypFTeVuSBb
```

**Pasos:**
1. Click en "New repository secret"
2. Name: `VERCEL_PROJECT_ID`
3. Secret: Copia y pega el valor de arriba
4. Click "Add secret"

---

## ✅ Verificación

Después de agregar los 3 secrets, deberías ver:
- ✓ VERCEL_TOKEN
- ✓ VERCEL_ORG_ID
- ✓ VERCEL_PROJECT_ID

---

## 🚀 ¡Listo!

Una vez configurados los secrets:
1. Cada push a **QA2** desplegará automáticamente
2. Cada push a **main** desplegará automáticamente
3. Puedes ver el progreso en: https://github.com/ferbarjim200017/IncidentAlertApp/actions

---

## 🔗 URLs de tu aplicación (después del primer despliegue):

**QA2 (Testing):**
Vercel te dará una URL como: `https://incident-alert-app-git-qa2-ferbarjim200017.vercel.app`

**Main (Producción):**
Vercel te dará una URL como: `https://incident-alert-app.vercel.app`

Verás las URLs exactas en:
- Vercel Dashboard: https://vercel.com/dashboard
- O en los logs de GitHub Actions después del primer despliegue

---

## 🧪 Probar que funciona:

1. Haz un pequeño cambio en cualquier archivo
2. Commit y push a QA2:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin QA2
   ```
3. Ve a: https://github.com/ferbarjim200017/IncidentAlertApp/actions
4. Verás el workflow ejecutándose
5. Cuando termine, tu app estará desplegada

---

**💡 Tip:** Guarda este archivo, tiene tus IDs y tokens de Vercel por si los necesitas después.
