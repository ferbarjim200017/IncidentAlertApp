# 🎯 Resumen: Despliegues Automáticos

## ✅ Lo que tienes configurado:

### Ramas en GitHub:
- ✅ **main** - Producción
- ✅ **QA2** - Pruebas (rama activa actual)

### Despliegues en Vercel:
Ambas ramas se desplegarán automáticamente en **Vercel** (no en GitHub):

| Rama | URL en Vercel |
|------|---------------|
| main | `https://[tu-proyecto].vercel.app` |
| QA2  | `https://[tu-proyecto]-git-qa2-[tu-user].vercel.app` |

**GitHub** = Solo código fuente  
**Vercel** = Aplicación web desplegada (ambas ramas)

---

## 🚀 Cómo activar los despliegues automáticos:

### Paso 1: Configura Vercel (5 minutos)

1. Ve a https://vercel.com e inicia sesión con GitHub
2. Importa tu repositorio: `ferbarjim200017/IncidentAlertApp`
3. Configura:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click "Deploy"

### Paso 2: Obtén los tokens

**En Vercel:**
1. Perfil → Account → Tokens → Create Token
2. Copia el token generado

**En tu proyecto Vercel:**
1. Settings → General → copia **Project ID**
2. Account Settings → General → copia **Team ID** (o User ID)

### Paso 3: Configura GitHub Secrets

1. Ve a: https://github.com/ferbarjim200017/IncidentAlertApp/settings/secrets/actions
2. Click "New repository secret" y agrega:

```
VERCEL_TOKEN = [el token que copiaste]
VERCEL_ORG_ID = [tu team/user ID]
VERCEL_PROJECT_ID = [el project ID]
```

### Paso 4: ¡Listo! 🎉

Ahora cada vez que hagas push:
- **Push a QA2** → Despliega automáticamente en Vercel (URL de QA2)
- **Push a main** → Despliega automáticamente en Vercel (URL de producción)

---

## 📝 Workflow diario:

### Trabajar en QA2 (ya estás aquí ✅):
```bash
# Hacer cambios en el código...
git add .
git commit -m "Descripción"
git push origin QA2
```
→ Se despliega automáticamente en Vercel (URL de QA2)

### Pasar a producción:
```bash
git checkout main
git merge QA2
git push origin main
```
→ Se despliega automáticamente en Vercel (URL de producción)

---

## 🔗 Enlaces importantes:

- **Repositorio**: https://github.com/ferbarjim200017/IncidentAlertApp
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Secrets de GitHub**: https://github.com/ferbarjim200017/IncidentAlertApp/settings/secrets/actions

---

## ❓ Preguntas frecuentes:

**Q: ¿Necesito hacer algo en GitHub Pages?**  
A: No, todo se despliega en Vercel.

**Q: ¿Cómo veo las URLs de despliegue?**  
A: En el dashboard de Vercel o en los logs de GitHub Actions.

**Q: ¿Puedo tener ambas URLs activas a la vez?**  
A: Sí, main y QA2 tendrán sus propias URLs en Vercel.

**Q: ¿Los despliegues son realmente automáticos?**  
A: Sí, una vez configures los secrets de GitHub (Paso 3).

---

## 📌 Estado actual:

- ✅ Estás en rama QA2
- ✅ GitHub Actions configurados
- ⏳ Pendiente: Configurar secrets en GitHub (Paso 3)
- ⏳ Pendiente: Importar proyecto en Vercel (Paso 1)

**Siguiente paso:** Sigue el "Paso 1" para configurar Vercel.
