# Workflow de Git - Ramas Main y QA2

## Resumen
Este documento explica el proceso para trabajar con las ramas `main` y `QA2` del repositorio IncidentAlertApp.

- **main**: Rama de producción con código estable
- **QA2**: Rama de pre-producción para pruebas antes de subir a main

---

## Configuración Inicial

### 1. Crear la rama QA2 (Ya completado)
```bash
# Asegurarse de estar en main con los últimos cambios
git checkout main
git pull origin main

# Crear la nueva rama QA2 desde main
git checkout -b QA2

# Subir la rama QA2 al repositorio remoto
git push -u origin QA2
```

**Nota sobre autenticación**: Si tienes problemas de autenticación (error 403), necesitarás:
- Configurar un Personal Access Token (PAT) de GitHub
- O usar GitHub CLI (`gh auth login`)
- O configurar SSH keys

---

## Workflow Diario

### 2. Trabajar en la rama QA2

#### Cambiar a la rama QA2
```bash
git checkout QA2
```

#### Actualizar tu rama local con los cambios remotos
```bash
git pull origin QA2
```

#### Hacer cambios y commitearlos
```bash
# Ver archivos modificados
git status

# Agregar archivos específicos
git add <archivo1> <archivo2>

# O agregar todos los cambios
git add .

# Hacer commit con mensaje descriptivo
git commit -m "Descripción clara de los cambios realizados"
```

#### Subir cambios a QA2 en GitHub
```bash
git push origin QA2
```

---

## Pasar Cambios de QA2 a Main

### 3. Una vez probado todo en QA2, mover a Main

#### Opción A: Merge desde línea de comandos (Recomendado)

```bash
# 1. Asegurarse de tener los últimos cambios de QA2
git checkout QA2
git pull origin QA2

# 2. Cambiar a main y actualizar
git checkout main
git pull origin main

# 3. Mergear QA2 en main
git merge QA2

# 4. Resolver conflictos si los hay (ver sección de conflictos abajo)

# 5. Subir los cambios a main
git push origin main
```

#### Opción B: Pull Request en GitHub (Más seguro)

1. Ve a GitHub: https://github.com/ferbarjim200017/IncidentAlertApp
2. Click en "Pull requests" → "New pull request"
3. Selecciona:
   - **Base**: `main`
   - **Compare**: `QA2`
4. Click en "Create pull request"
5. Revisa los cambios
6. Click en "Merge pull request"
7. Confirma el merge
8. Actualiza tu repositorio local:
```bash
git checkout main
git pull origin main
```

---

## Comandos Útiles

### Ver en qué rama estás
```bash
git branch
```
La rama actual aparece con un asterisco (*)

### Ver todas las ramas (locales y remotas)
```bash
git branch -a
```

### Ver diferencias entre ramas
```bash
# Ver qué commits tiene QA2 que no tiene main
git log main..QA2

# Ver diferencias de archivos entre ramas
git diff main..QA2
```

### Ver historial de commits
```bash
git log --oneline -10
```

### Deshacer cambios no commiteados
```bash
# Descartar cambios en un archivo específico
git checkout -- <archivo>

# Descartar todos los cambios no commiteados
git reset --hard HEAD
```

---

## Resolver Conflictos

Si hay conflictos al hacer merge:

```bash
# 1. Git te mostrará qué archivos tienen conflictos
git status

# 2. Abre cada archivo con conflicto y busca las marcas:
#    <<<<<<< HEAD (tu código actual en main)
#    código de main
#    =======
#    código de QA2
#    >>>>>>> QA2

# 3. Edita el archivo para mantener el código correcto

# 4. Una vez resueltos todos los conflictos:
git add <archivo-resuelto>

# 5. Completa el merge
git commit -m "Merge QA2 into main - conflictos resueltos"

# 6. Sube los cambios
git push origin main
```

---

## Sincronizar QA2 con Main

Si haces cambios directos en main y quieres actualizarlos en QA2:

```bash
# 1. Cambiar a QA2
git checkout QA2

# 2. Traer los cambios de main a QA2
git merge main

# 3. Resolver conflictos si los hay

# 4. Subir QA2 actualizado
git push origin QA2
```

---

## Buenas Prácticas

1. **Commits frecuentes**: Haz commits pequeños y descriptivos
2. **Mensajes claros**: Usa mensajes que expliquen QUÉ y POR QUÉ
   - ✅ "Fix: Corregir validación de email en formulario de login"
   - ❌ "arreglos"
3. **Prueba en QA2 primero**: NUNCA hagas cambios directamente en main
4. **Pull antes de Push**: Siempre haz `git pull` antes de `git push`
5. **Revisa antes de mergear**: Verifica que todo funciona en QA2 antes de mergear a main

---

## Resumen de Comandos Principales

### Trabajo en QA2
```bash
git checkout QA2                          # Cambiar a QA2
git pull origin QA2                       # Actualizar desde remoto
# ... hacer cambios en los archivos ...
git add .                                 # Agregar cambios
git commit -m "Mensaje descriptivo"       # Commitear
git push origin QA2                       # Subir a GitHub
```

### Pasar de QA2 a Main
```bash
git checkout main                         # Cambiar a main
git pull origin main                      # Actualizar main
git merge QA2                             # Traer cambios de QA2
git push origin main                      # Subir a GitHub
```

### Sincronizar QA2 con Main (después de merge)
```bash
git checkout QA2                          # Cambiar a QA2
git merge main                            # Actualizar desde main
git push origin QA2                       # Subir a GitHub
```

---

## Solución de Problemas Comunes

### Error: "Your branch is behind"
```bash
git pull origin <nombre-rama>
```

### Error: "Updates were rejected"
```bash
# Primero hacer pull, luego push
git pull origin <nombre-rama>
git push origin <nombre-rama>
```

### Error 403: Authentication failed
Configura tu autenticación de GitHub:
```bash
# Opción 1: Usando GitHub CLI
gh auth login

# Opción 2: Configurar PAT (Personal Access Token)
# 1. Crear token en: https://github.com/settings/tokens
# 2. Usar el token como contraseña al hacer push
```

### Ver el estado actual
```bash
git status                                # Estado de archivos
git branch                                # Ver rama actual
git remote -v                             # Ver repositorios remotos
```

---

## Contacto y Ayuda

Si tienes dudas sobre Git:
- Documentación oficial: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com

**Recuerda**: QA2 es tu zona segura para probar. Main debe siempre tener código estable y funcional.
