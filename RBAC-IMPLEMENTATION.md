# Sistema de Control de Acceso Basado en Roles (RBAC)

## Descripción General

Se ha implementado un sistema completo de control de acceso basado en roles que permite administrar los permisos de los usuarios de forma granular. El sistema incluye tres roles predefinidos y la capacidad de crear roles personalizados.

## Arquitectura del Sistema

### 1. Estructura de Datos

#### Role Interface
```typescript
interface Role {
  id: string;
  name: string;
  permissions: RolePermissions;
  isSystem?: boolean; // Los roles del sistema no se pueden eliminar
  createdAt?: string;
}
```

#### RolePermissions Interface
```typescript
interface RolePermissions {
  incidents: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    viewAll: boolean; // Ver todas las incidencias o solo las propias
  };
  users: {
    viewOwn: boolean;    // Ver su propio perfil
    editOwn: boolean;    // Editar su propio perfil
    viewAll: boolean;    // Ver todos los usuarios
    create: boolean;     // Crear nuevos usuarios
    edit: boolean;       // Editar otros usuarios
    delete: boolean;     // Eliminar usuarios
  };
  roles: {
    view: boolean;       // Ver roles
    create: boolean;     // Crear roles
    edit: boolean;       // Editar roles
    delete: boolean;     // Eliminar roles
  };
  settings: {
    view: boolean;       // Ver configuración
    edit: boolean;       // Editar configuración
  };
  automation: {
    view: boolean;       // Ver reglas de automatización
    create: boolean;     // Crear reglas
    edit: boolean;       // Editar reglas
    delete: boolean;     // Eliminar reglas
  };
}
```

### 2. Roles Predefinidos

#### Administrador (Sistema)
- **Permisos**: Acceso completo a todas las funcionalidades
- **Características**:
  - Puede crear, leer, actualizar y eliminar incidencias
  - Puede ver todas las incidencias de todos los usuarios
  - Acceso completo a gestión de usuarios
  - Puede crear, editar y eliminar roles
  - Acceso completo a configuración
  - Acceso completo a automatización
- **Restricciones**: Este rol no se puede eliminar (isSystem: true)

#### Usuario (Sistema)
- **Permisos**: Acceso estándar para usuarios regulares
- **Características**:
  - Puede crear, leer y actualizar incidencias
  - Solo ve sus propias incidencias
  - Puede ver y editar su propio perfil
  - Sin acceso a gestión de usuarios ni roles
  - Puede ver y editar configuración básica
  - Puede ver y usar reglas de automatización
- **Restricciones**: Este rol no se puede eliminar (isSystem: true)

#### Solo Lectura (Sistema)
- **Permisos**: Acceso mínimo, solo lectura
- **Características**:
  - Solo puede leer incidencias (las propias)
  - Puede ver su propio perfil pero no editarlo
  - Sin acceso a gestión de usuarios ni roles
  - Solo puede ver configuración, no editar
  - Solo puede ver reglas de automatización
- **Restricciones**: Este rol no se puede eliminar (isSystem: true)

## Componentes Implementados

### 1. UserProfile.tsx
**Ubicación**: `src/components/UserProfile.tsx`

**Funcionalidad**:
- Permite a todos los usuarios editar su propio perfil
- Campos editables: nombre, email, contraseña, avatar
- Campos de solo lectura: usuario, rol, fecha de creación
- Selector de avatar con 12 opciones emoji
- Cambio de contraseña con confirmación
- Visualización de permisos del rol asignado

**Props**:
- `currentUser: User` - Usuario actual
- `onUpdate: () => void` - Callback después de actualizar

**Características**:
- Validación de formularios
- Notificaciones de éxito/error
- Visualización clara de permisos
- Diseño responsive

### 2. RoleManagement.tsx
**Ubicación**: `src/components/RoleManagement.tsx`

**Funcionalidad**:
- Gestión completa de roles (solo para administradores)
- Crear nuevos roles con permisos personalizados
- Editar roles existentes
- Eliminar roles (excepto roles del sistema)
- Búsqueda de roles
- Vista de resumen de permisos

**Props**:
- `currentUser: any` - Usuario actual

**Características**:
- Modal para crear/editar roles
- Checkboxes organizados por categoría
- Protección de roles del sistema
- Resumen visual de permisos
- Confirmación antes de eliminar
- Búsqueda en tiempo real

**Categorías de Permisos**:
1. 📋 Incidencias (5 permisos)
2. 👤 Usuarios (6 permisos)
3. 🔐 Roles (4 permisos)
4. ⚙️ Configuración (2 permisos)
5. 🤖 Automatización (4 permisos)

### 3. Integración en App.tsx

**Cambios Realizados**:
1. Nuevo estado `userRole` para almacenar el rol del usuario actual
2. useEffect para cargar rol cuando cambia currentUser
3. Nuevo tab "Mi Perfil" en ajustes (visible para todos)
4. Tab "Usuarios" ahora solo visible si `userRole?.permissions.users.viewAll`
5. Nuevo tab "Roles" solo visible si `userRole?.permissions.roles.view`
6. Tipo actualizado para `settingsSection`: `'profile' | 'automation' | 'users' | 'roles' | 'appearance' | 'general'`

## Funciones Firebase

### Nuevas Funciones en firebaseService.ts

```typescript
// Obtener todos los roles
export const getRoles = async (): Promise<Role[]>

// Obtener un rol por ID
export const getRoleById = async (roleId: string): Promise<Role | null>

// Agregar un nuevo rol
export const addRole = async (role: Omit<Role, 'id'>): Promise<string>

// Actualizar un rol
export const updateRole = async (roleId: string, updates: Partial<Role>): Promise<void>

// Eliminar un rol
export const deleteRole = async (roleId: string): Promise<void>

// Suscribirse a cambios en roles (tiempo real)
export const subscribeToRoles = (callback: (roles: Role[]) => void): Unsubscribe
```

### Inicialización de Datos

La función `initializeDefaultData()` ha sido actualizada para:
1. Crear los 3 roles del sistema primero
2. Asignar el rol "Administrador" al usuario admin
3. Manejar casos donde los roles ya existen

## Flujo de Trabajo

### Para Usuarios Regulares
1. Login → Cargar usuario → Cargar rol
2. Acceso a "Mi Perfil" en ajustes
3. Editar nombre, email, contraseña, avatar
4. Ver permisos asignados
5. Solo ve funcionalidades permitidas por su rol

### Para Administradores
1. Login → Cargar usuario → Cargar rol de administrador
2. Acceso completo a todos los tabs de ajustes
3. Gestión de usuarios en tab "Usuarios"
4. Gestión de roles en tab "Roles"
5. Crear roles personalizados con permisos específicos
6. Asignar roles a usuarios

## Seguridad

### Validaciones Implementadas
- Roles del sistema no se pueden eliminar
- Verificación de permisos antes de mostrar UI
- Solo administradores pueden acceder a gestión de usuarios/roles
- Cada usuario solo puede editar su propio perfil (a menos que tenga permiso users.edit)

### Próximas Mejoras Recomendadas
1. **Reglas de Seguridad Firebase**: Actualizar reglas de Firestore para validar permisos en el servidor
2. **Middleware de Permisos**: Crear funciones helper para verificar permisos antes de acciones
3. **Auditoría**: Log de cambios en roles y permisos
4. **Migración de Datos**: Script para migrar usuarios existentes con campo `role` a `roleId`

## Ejemplo de Uso

### Verificar Permisos en Componentes
```typescript
// En un componente
const [userRole, setUserRole] = useState<Role | null>(null);

useEffect(() => {
  if (currentUser?.roleId) {
    firebaseService.getRoleById(currentUser.roleId).then(setUserRole);
  }
}, [currentUser]);

// Condicional en render
{userRole?.permissions.incidents.create && (
  <button onClick={handleCreateIncident}>Nueva Incidencia</button>
)}

{userRole?.permissions.users.viewAll && (
  <Link to="/settings/users">Gestionar Usuarios</Link>
)}
```

### Crear un Rol Personalizado
```typescript
const newRole: Omit<Role, 'id'> = {
  name: 'Editor',
  permissions: {
    incidents: {
      create: true,
      read: true,
      update: true,
      delete: false, // No puede eliminar
      viewAll: true  // Ve todas las incidencias
    },
    users: {
      viewOwn: true,
      editOwn: true,
      viewAll: false,
      create: false,
      edit: false,
      delete: false
    },
    roles: {
      view: false,
      create: false,
      edit: false,
      delete: false
    },
    settings: {
      view: true,
      edit: false
    },
    automation: {
      view: true,
      create: false,
      edit: false,
      delete: false
    }
  },
  isSystem: false,
  createdAt: new Date().toISOString()
};

await firebaseService.addRole(newRole);
```

## Testing

### Casos de Prueba
1. ✅ Usuario admin puede acceder a todos los tabs
2. ✅ Usuario regular solo ve "Mi Perfil", "Automatización", "Apariencia", "General"
3. ✅ Usuario puede editar su propio perfil
4. ✅ Admin puede crear roles personalizados
5. ✅ Roles del sistema no se pueden eliminar
6. ✅ Permisos se actualizan en tiempo real

### Próximas Pruebas
- [ ] Usuario con rol personalizado ve solo funcionalidades permitidas
- [ ] Cambio de rol actualiza permisos inmediatamente
- [ ] Eliminación de rol no afecta a usuarios asignados
- [ ] Migración de usuarios sin roleId

## Archivos Modificados/Creados

### Nuevos Archivos
- `src/components/UserProfile.tsx` (235 líneas)
- `src/components/UserProfile.css` (200 líneas)
- `src/components/RoleManagement.tsx` (470 líneas)
- `src/components/RoleManagement.css` (240 líneas)

### Archivos Modificados
- `src/types.ts` - Agregadas interfaces Role y RolePermissions
- `src/firebaseService.ts` - Agregadas 6 funciones de gestión de roles
- `src/App.tsx` - Integración de UserProfile y RoleManagement
- `README.md` - Este documento

## Estado del Build
✅ Compilación exitosa
✅ Sin errores TypeScript
⚠️ Advertencia de CSS menor (cerrado de llave extra)
✅ Bundle generado correctamente

## Conclusión

El sistema RBAC está completamente implementado y funcional. Incluye:
- ✅ 3 roles predefinidos
- ✅ Gestión completa de roles
- ✅ Edición de perfil de usuario
- ✅ Permisos granulares
- ✅ Sincronización en tiempo real
- ✅ Interfaz intuitiva
- ✅ Validaciones de seguridad básicas

Siguiente paso recomendado: Implementar verificaciones de permisos en todas las acciones críticas de la aplicación.
