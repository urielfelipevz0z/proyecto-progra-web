# Pump Monitoring Backend API

Backend completo para el sistema de monitoreo de bombas desarrollado con Node.js, Express y PostgreSQL.

## 🚀 Características

- **Autenticación JWT** con bcrypt para seguridad de contraseñas
- **API RESTful** con arquitectura MVC
- **Base de datos PostgreSQL** con Sequelize ORM
- **Validación robusta** con express-validator
- **Middleware de seguridad** con helmet y rate limiting
- **Logging estructurado** para debugging
- **CORS configurado** para desarrollo con Vue.js
- **Seeds de datos de prueba** para testing rápido

## 📋 Requisitos Previos

- Node.js >= 16.0.0
- PostgreSQL 17.5 (ya instalado)
- npm o yarn

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pump_monitoring
DB_USER=postgres
DB_PASSWORD=tu_password_postgresql

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=24h

# Frontend
FRONTEND_URL=http://localhost:8080
```

### 3. Crear base de datos
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE pump_monitoring;
\q
```

### 4. Ejecutar migraciones y seeds
```bash
# Ejecutar migraciones
npm run migrate

# Ejecutar seeds (datos de prueba)
npm run seed
```

### 5. Iniciar el servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📊 Usuarios de Prueba

El seeder crea estos usuarios para testing:

| Username | Email | Password | Pumps |
|----------|-------|----------|-------|
| testuser | test@example.com | password123 | 2 bombas |
| admin | admin@example.com | password123 | 1 bomba |

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión  
- `GET /api/auth/profile` - Obtener perfil (requiere auth)
- `POST /api/auth/logout` - Cerrar sesión (requiere auth)
- `GET /api/auth/verify` - Verificar token (requiere auth)

### Gestión de Bombas
- `GET /api/pumps` - Listar bombas del usuario (requiere auth)
- `POST /api/pumps` - Crear bomba (requiere auth)
- `GET /api/pumps/:id` - Obtener bomba específica (requiere auth)
- `PUT /api/pumps/:id` - Actualizar bomba (requiere auth)
- `DELETE /api/pumps/:id` - Eliminar bomba (requiere auth)

### Métricas
- `GET /api/metrics/:id/current` - Métricas actuales (requiere auth)
- `GET /api/metrics/:id/history` - Historial de métricas (requiere auth)
- `POST /api/metrics/:id/update` - Actualizar métricas (requiere auth)
- `POST /api/metrics/:id/simulate` - Generar métricas simuladas (requiere auth)

### Utilidad
- `GET /api/health` - Health check
- `GET /` - Información de la API

## 🧪 Ejemplos de Requests

### 1. Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "Password123",
    "name": "New User"
  }'
```

### 2. Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 3. Listar bombas (con token)
```bash
curl -X GET http://localhost:3000/api/pumps \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

### 4. Crear bomba
```bash
curl -X POST http://localhost:3000/api/pumps \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nueva Bomba",
    "location": "Edificio B",
    "capacity": "500 L/min",
    "model": "WP-500",
    "manufacturer": "AquaTech",
    "powerRating": 10.5,
    "voltage": 220,
    "maxPressure": 60,
    "minPressure": 15,
    "efficiency": 87.5
  }'
```

### 5. Obtener métricas actuales
```bash
curl -X GET http://localhost:3000/api/metrics/1/current \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

### 6. Simular métricas para testing
```bash
curl -X POST http://localhost:3000/api/metrics/1/simulate \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

## 🗄️ Estructura de Base de Datos

### Tabla Users
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Hashed password
- `name` - Optional display name
- `created_at`, `updated_at` - Timestamps

### Tabla Pumps  
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Pump name
- `location` - Installation location
- `status` - active/inactive/maintenance/error
- Technical specs: `capacity`, `model`, `manufacturer`, etc.
- `created_at`, `updated_at` - Timestamps

### Tabla PumpMetrics
- `id` - Primary key  
- `pump_id` - Foreign key to pumps
- `flow_rate` - Flow rate in L/min
- `pressure` - Pressure in PSI
- `temperature` - Temperature in Celsius
- `power_consumption` - Power in kW
- `current_efficiency` - Efficiency percentage
- `is_operating` - Boolean operation status
- `timestamp` - Metric timestamp
- `created_at`, `updated_at` - Timestamps

## 🔧 Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo (nodemon)
npm run migrate    # Ejecutar migraciones
npm run seed       # Ejecutar seeds
npm run db:setup   # Ejecutar migraciones y seeds
npm test           # Ejecutar tests (configurar Jest)
```

## 🛡️ Seguridad

- **Rate limiting**: 100 requests por 15 minutos por IP
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado solo para tu frontend
- **JWT**: Tokens con expiración configurable
- **Bcrypt**: Hash de contraseñas con salt rounds 12
- **Validación**: Todos los inputs validados con express-validator

## 📝 Logging

El sistema incluye logging estructurado con colores:
- **INFO**: Información general
- **SUCCESS**: Operaciones exitosas  
- **WARN**: Advertencias
- **ERROR**: Errores con stack trace
- **DEBUG**: Solo en modo desarrollo

## 🔄 Integración con Frontend Vue.js

Para integrar con tu aplicación Vue.js:

1. **Cambiar el store** para usar la API en lugar de localStorage
2. **Configurar axios** para requests HTTP
3. **Gestionar tokens JWT** en localStorage/sessionStorage
4. **Actualizar interceptores** para manejo de errores 401/403

Ejemplo de configuración axios:
```javascript
// En tu Vue app
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## 🐛 Debugging

Para debugging detallado, configura `NODE_ENV=development` en tu `.env`:
- Logs de Sequelize habilitados
- Morgan en modo 'dev'
- Stack traces en respuestas de error
- Logs DEBUG habilitados

## 📞 Soporte

Si encuentras problemas:
1. Verifica que PostgreSQL esté corriendo
2. Confirma que la base de datos existe
3. Revisa las variables de entorno
4. Verifica que las migraciones se ejecutaron
5. Consulta los logs en consola para errores específicos
