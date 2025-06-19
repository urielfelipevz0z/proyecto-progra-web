#!/bin/bash

# Script para verificar que el entorno esté correctamente configurado
# para el sistema de monitoreo de bombas

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verificando entorno del sistema de monitoreo de bombas...${NC}"
echo

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check Node.js
echo "1. Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js está instalado: $NODE_VERSION"
    
    # Check version (need >= 16)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        print_status 0 "Versión de Node.js es compatible (>= 16)"
    else
        print_status 1 "Versión de Node.js es muy antigua (necesita >= 16)"
    fi
else
    print_status 1 "Node.js no está instalado"
fi
echo

# Check npm
echo "2. Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm está instalado: $NPM_VERSION"
else
    print_status 1 "npm no está instalado"
fi
echo

# Check PostgreSQL
echo "3. Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    print_status 0 "PostgreSQL está instalado: $PSQL_VERSION"
    
    # Check if PostgreSQL is running
    if pg_isready -q; then
        print_status 0 "PostgreSQL está ejecutándose"
    else
        print_status 1 "PostgreSQL no está ejecutándose"
        print_info "Ejecuta: sudo systemctl start postgresql"
    fi
else
    print_status 1 "PostgreSQL no está instalado"
fi
echo

# Check if we're in backend directory
echo "4. Verificando estructura del proyecto..."
if [[ -f "package.json" ]]; then
    print_status 0 "Estás en el directorio backend"
    
    # Check package.json content
    if grep -q "pump-monitoring-backend" package.json; then
        print_status 0 "package.json es correcto"
    else
        print_status 1 "package.json no parece ser del proyecto correcto"
    fi
else
    print_status 1 "No estás en el directorio backend o package.json no existe"
    print_info "Ejecuta: cd backend"
fi
echo

# Check dependencies
echo "5. Verificando dependencias..."
if [[ -d "node_modules" ]]; then
    print_status 0 "Dependencias de Node.js están instaladas"
else
    print_status 1 "Dependencias no están instaladas"
    print_info "Ejecuta: npm install"
fi
echo

# Check environment file
echo "6. Verificando configuración..."
if [[ -f ".env" ]]; then
    print_status 0 "Archivo .env existe"
    
    # Check required variables
    if grep -q "DB_NAME=" .env && grep -q "JWT_SECRET=" .env; then
        print_status 0 "Variables de entorno básicas están configuradas"
    else
        print_status 1 "Variables de entorno incompletas"
        print_info "Verifica DB_NAME, JWT_SECRET en .env"
    fi
else
    print_status 1 "Archivo .env no existe"
    print_info "Ejecuta: cp .env.example .env"
fi
echo

# Check database connection (if .env exists)
if [[ -f ".env" ]]; then
    echo "7. Verificando conexión a base de datos..."
    
    # Extract DB config from .env
    DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2)
    DB_USER=$(grep "^DB_USER=" .env | cut -d '=' -f2)
    DB_HOST=$(grep "^DB_HOST=" .env | cut -d '=' -f2)
    DB_PORT=$(grep "^DB_PORT=" .env | cut -d '=' -f2)
    
    DB_NAME=${DB_NAME:-pump_monitoring}
    DB_USER=${DB_USER:-postgres}
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_status 0 "Base de datos '$DB_NAME' existe"
    else
        print_status 1 "Base de datos '$DB_NAME' no existe"
        print_info "Ejecuta: createdb -U $DB_USER $DB_NAME"
    fi
    echo
fi

# Check migrations
echo "8. Verificando migraciones..."
if [[ -d "migrations" ]] && [[ $(ls -1 migrations/*.js 2>/dev/null | wc -l) -gt 0 ]]; then
    print_status 0 "Archivos de migración existen"
else
    print_status 1 "Archivos de migración no encontrados"
fi
echo

# Check scripts
echo "9. Verificando scripts..."
if [[ -f "setup.sh" ]] && [[ -x "setup.sh" ]]; then
    print_status 0 "Script de setup está disponible y es ejecutable"
else
    print_status 1 "Script de setup no está disponible o no es ejecutable"
    print_info "Ejecuta: chmod +x setup.sh"
fi

if [[ -f "test-api.sh" ]] && [[ -x "test-api.sh" ]]; then
    print_status 0 "Script de test está disponible y es ejecutable"
else
    print_status 1 "Script de test no está disponible o no es ejecutable"
    print_info "Ejecuta: chmod +x test-api.sh"
fi
echo

# Final recommendations
echo -e "${BLUE}📋 Resumen y próximos pasos:${NC}"
echo

if [[ -f ".env" ]] && [[ -d "node_modules" ]]; then
    print_info "El entorno parece estar configurado correctamente"
    echo
    echo "Para iniciar el servidor:"
    echo "  npm run dev    # Modo desarrollo"
    echo "  npm start      # Modo producción"
    echo
    echo "Para probar la API:"
    echo "  ./test-api.sh"
    echo
    echo "Para más información:"
    echo "  cat README.md"
else
    print_warning "El entorno necesita configuración adicional"
    echo
    echo "Pasos recomendados:"
    if [[ ! -f ".env" ]]; then
        echo "1. Configura el entorno: cp .env.example .env"
        echo "2. Edita .env con tus configuraciones"
    fi
    if [[ ! -d "node_modules" ]]; then
        echo "3. Instala dependencias: npm install"
    fi
    echo "4. Ejecuta setup completo: ./setup.sh"
fi

echo
