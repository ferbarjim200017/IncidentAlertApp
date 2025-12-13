# 🌐 URLs de Despliegue

## ✅ Estado Actual - URLs PERMANENTES

### 🔴 Producción (Main)
**URL permanente:**
- https://incident-alert-app.vercel.app ← **URL PRINCIPAL DE PRODUCCIÓN**

### 🟡 QA2 (Testing/Preview)
**URL permanente:**
- https://incident-alert-app-qa2.vercel.app ← **URL PERMANENTE DE QA2** ✅

---

## 🎉 ¡AMBAS RAMAS TIENEN URLs PERMANENTES!

**Main (Producción):**
```
https://incident-alert-app.vercel.app
```

**QA2 (Testing):**
```
https://incident-alert-app-qa2.vercel.app
```

Estas URLs **nunca cambian** y siempre apuntan a la última versión de cada rama

---

## 🔍 Cómo funciona

### Main (Producción)
- URL permanente: `incident-alert-app.vercel.app`
- Cada push a **main** actualiza automáticamente esta URL
- Siempre muestra la última versión de producción

### QA2 (Testing)
- URL permanente: `incident-alert-app-qa2.vercel.app`
- Cada push a **QA2** actualiza automáticamente esta URL
- Siempre muestra la última versión de QA2 para testing

---

## 📊 Configuración Completa

✅ **Dominios configurados en Vercel:**
- `incident-alert-app.vercel.app` → Rama: main
- `incident-alert-app-qa2.vercel.app` → Rama: QA2

✅ **GitHub Actions configurados:**
- Push a main → Despliega en producción
- Push a QA2 → Despliega en preview/testing

✅ **Workflow:**
1. Desarrollas en QA2
2. Push a QA2 → https://incident-alert-app-qa2.vercel.app se actualiza
3. Pruebas en QA2
4. Merge a main → https://incident-alert-app.vercel.app se actualiza

---

## 🔗 Enlaces rápidos

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Ver dominios**: https://vercel.com/fernando-barreras-projects/incident-alert-app/settings/domains
- **GitHub Actions**: https://github.com/ferbarjim200017/IncidentAlertApp/actions
