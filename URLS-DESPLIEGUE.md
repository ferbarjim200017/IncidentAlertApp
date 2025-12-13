# 🌐 URLs de Despliegue

## ✅ Estado Actual

### 🔴 Producción (Main)
**URLs permanentes:**
- https://incident-alert-app.vercel.app ← **URL principal**
- https://incident-alert-app-fernando-barreras-projects.vercel.app
- https://incident-alert-app-ferbarjim200017-fernando-barreras-projects.vercel.app

### 🟡 QA2 (Testing/Preview)
**URLs de despliegue:**

Vercel crea URLs únicas por cada commit en QA2, algo como:
- `https://incident-alert-[hash]-fernando-barreras-projects.vercel.app`

**Para ver la URL actual de QA2:**
1. Ve a: https://vercel.com/dashboard
2. Busca tu proyecto "incident-alert-app"
3. Verás todos los despliegues con sus ramas
4. Los de QA2 tendrán el tag "Preview"

**O ve a GitHub Actions:**
1. https://github.com/ferbarjim200017/IncidentAlertApp/actions
2. Click en el último workflow de QA2
3. En los logs verás la URL de despliegue

---

## 🔍 Cómo funciona

### Main (Producción)
- Tiene URLs permanentes que **nunca cambian**
- Cada push actualiza el contenido en las mismas URLs

### QA2 (Preview)
- Cada push crea una **URL única** nueva
- Esto es por diseño de Vercel para previews
- Puedes ver todas las URLs en el dashboard

---

## 🎯 Solución: URL Permanente para QA2

Si quieres una URL permanente para QA2, hay 3 opciones:

### Opción 1: Usar "Latest" de Preview
En Vercel dashboard:
1. Ve a tu proyecto → Settings → Domains
2. Click "Add Domain"
3. Agrega: `incident-alert-app-qa2.vercel.app`
4. Asigna este dominio a la rama "QA2"

### Opción 2: Cambiar rama de producción temporalmente
- Puedes hacer que QA2 sea la rama de producción temporalmente
- Esto le dará la URL principal mientras pruebas

### Opción 3: Usar dominios personalizados
- Comprar un dominio (ej: `qa2.tudominio.com`)
- Configurarlo para apuntar siempre a QA2

---

## 📊 Resumen

**Actualmente tienes:**
- ✅ 1 dominio permanente para Main (producción)
- ✅ URLs de preview para cada commit de QA2 (por diseño)

**Esto es normal en Vercel:**
- Producción = URL fija
- Preview (otras ramas) = URLs dinámicas por commit

Si necesitas URL fija para QA2, puedo ayudarte a configurar la Opción 1.

---

## 🔗 Enlaces rápidos

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Ver dominios**: https://vercel.com/fernando-barreras-projects/incident-alert-app/settings/domains
- **GitHub Actions**: https://github.com/ferbarjim200017/IncidentAlertApp/actions
