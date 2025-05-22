# Sistema de Monitoreo de Bombas

Sistema de monitoreo y gestión de bombas desarrollado con Vue.js. Esta aplicación permite a los usuarios registrar, monitorear y gestionar bombas de agua en tiempo real.

## 🚀 Características

- 👤 **Autenticación de Usuarios**
  - Registro de nuevos usuarios
  - Inicio de sesión
  - Persistencia de sesión
  - Protección de rutas

- 💧 **Gestión de Bombas**
  - Registro de nuevas bombas
  - Listado de bombas por usuario
  - Información detallada de cada bomba
  - Persistencia de datos

- 📊 **Monitoreo en Tiempo Real**
  - Visualización de métricas clave
  - Estado operacional
  - Caudal actual
  - Presión
  - Temperatura

## 🛠️ Tecnologías

- Vue.js 3
- Vue Router 4
- Vuex 4
- SCSS para estilos
- LocalStorage para persistencia de datos

## ⚙️ Configuración del Proyecto

### Requisitos Previos
- Node.js (v22.15.1 o superior)
- npm (incluido con Node.js)

### Instalación
```bash
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## 🚦 Uso

### Desarrollo
```bash
npm run serve
```
La aplicación estará disponible en `http://localhost:8080`

### Producción
```bash
npm run build
```

### Linting y Corrección de Archivos
```bash
npm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes reutilizables
├── router/         # Configuración de rutas
├── store/          # Estado global (Vuex)
└── views/          # Vistas principales
    ├── LoginView.vue       # Inicio de sesión
    ├── SignupView.vue     # Registro de usuarios
    ├── BombListView.vue   # Lista de bombas
    └── BombMonitorView.vue # Monitoreo de bomba
```

## 💾 Persistencia de Datos

La aplicación utiliza LocalStorage para persistir:
- Información de usuarios registrados
- Datos de sesión actual
- Información de bombas registradas

## 🔐 Seguridad

- Validación de formularios
- Protección de rutas
- Segregación de datos por usuario
- Gestión de sesiones

## 📝 Notas Importantes

- Esta es una aplicación de demostración que utiliza almacenamiento local
- En este entorno:
  - No se implementa un backend real
  - No se usa una base de datos
  - No se agrega encriptación de contraseñas
  - No se implementan tokens JWT para autenticación

[Documentación de Vue CLI](https://cli.vuejs.org/config/).
