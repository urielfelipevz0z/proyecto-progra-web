#!/bin/bash

# Pump Monitoring Backend Setup Script
# Este script automatiza la configuración completa del backend

set -e  # Exit on any error

echo "🚀 Iniciando configuración del Backend de Monitoreo de Bombas..."
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the backend directory
if [[ ! -f "package.json" ]]; then
    print_error "Este script debe ejecutarse desde el directorio backend/"
    print_error "Uso: cd backend && ./setup.sh"
    exit 1
fi

# Step 1: Install dependencies
print_status "Instalando dependencias de Node.js..."
if npm install; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error instalando dependencias"
    exit 1
fi

echo

# Step 2: Setup environment file
print_status "Configurando archivo de variables de entorno..."
if [[ ! -f ".env" ]]; then
    cp .env.example .env
    print_success "Archivo .env creado desde .env.example"
    print_warning "IMPORTANTE: Edita el archivo .env con tus configuraciones de base de datos"
    print_warning "Especialmente: DB_PASSWORD, JWT_SECRET"
else
    print_warning "El archivo .env ya existe, no se sobrescribirá"
fi

echo

# Step 3: Check PostgreSQL connection
print_status "Verificando conexión a PostgreSQL..."

# Try to read database config from .env file
if [[ -f ".env" ]]; then
    DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2)
    DB_USER=$(grep "^DB_USER=" .env | cut -d '=' -f2)
    DB_HOST=$(grep "^DB_HOST=" .env | cut -d '=' -f2)
    DB_PORT=$(grep "^DB_PORT=" .env | cut -d '=' -f2)
    
    # Set defaults if not found
    DB_NAME=${DB_NAME:-pump_monitoring}
    DB_USER=${DB_USER:-postgres}
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
else
    DB_NAME="pump_monitoring"
    DB_USER="postgres"
    DB_HOST="localhost"
    DB_PORT="5432"
fi

print_status "Configuración de BD: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

# Check if PostgreSQL is running
if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
    print_success "PostgreSQL está ejecutándose y es accesible"
else
    print_warning "No se puede conectar a PostgreSQL en $DB_HOST:$DB_PORT"
    print_warning "Asegúrate de que PostgreSQL esté ejecutándose y sea accesible"
fi

echo

# Step 4: Create database if it doesn't exist
print_status "Verificando/Creando base de datos '$DB_NAME'..."

# Check if database exists
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "La base de datos '$DB_NAME' ya existe"
else
    print_status "Creando base de datos '$DB_NAME'..."
    if createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"; then
        print_success "Base de datos '$DB_NAME' creada correctamente"
    else
        print_error "Error creando la base de datos"
        print_error "Ejecuta manualmente: createdb -U $DB_USER $DB_NAME"
        exit 1
    fi
fi

echo

# Step 5: Run migrations
print_status "Ejecutando migraciones de base de datos..."
if npm run migrate; then
    print_success "Migraciones ejecutadas correctamente"
else
    print_error "Error ejecutando migraciones"
    exit 1
fi

echo

# Step 6: Run seeds
print_status "Ejecutando seeds (datos de prueba)..."
if npm run seed; then
    print_success "Seeds ejecutados correctamente"
    print_success "Usuarios de prueba creados:"
    echo "  - testuser / test@example.com / password123"
    echo "  - admin / admin@example.com / password123"
else
    print_error "Error ejecutando seeds"
    exit 1
fi

echo

# Step 7: Test server startup
print_status "Probando el inicio del servidor..."
timeout 10s npm start &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Servidor iniciado correctamente"
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null
else
    print_warning "El servidor no se inició correctamente"
fi

echo
echo "🎉 ¡Configuración completada!"
echo
print_success "El backend está listo para usar. Para iniciarlo:"
echo "  npm run dev    # Modo desarrollo (recomendado)"
echo "  npm start      # Modo producción"
echo
print_success "API disponible en: http://localhost:3000"
print_success "Health check: http://localhost:3000/api/health"
echo
print_warning "Próximos pasos:"
echo "1. Verifica la configuración en .env (especialmente DB_PASSWORD y JWT_SECRET)"
echo "2. Inicia el servidor con: npm run dev"
echo "3. Prueba la API con los ejemplos del README.md"
echo "4. Integra con tu aplicación Vue.js"
echo

exit 0
