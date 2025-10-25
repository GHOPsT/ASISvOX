#!/bin/bash
# ============================================
# Script para Inicializar la Base de Datos
# Ejecutar desde la carpeta backend/
# ============================================

echo "🗄️  ASISvOX - Database Initialization Script"
echo "=========================================="
echo ""

# Variables de configuración
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-asisvox}"
DB_USER="${DB_USER:-postgres}"
DB_SCHEMA_FILE="src/schema.sql"
DB_SEED_FILE="seed.sql"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verificar que existan los archivos
if [ ! -f "$DB_SCHEMA_FILE" ]; then
    print_error "Archivo $DB_SCHEMA_FILE no encontrado"
fi

if [ ! -f "$DB_SEED_FILE" ]; then
    print_error "Archivo $DB_SEED_FILE no encontrado"
fi

print_info "Configuración:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Opción para crear la BD si no existe
print_info "Intentando conectar a PostgreSQL..."

# Crear BD si no existe
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    {
        print_info "Base de datos '$DB_NAME' no existe. Creando..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER \
            -c "CREATE DATABASE $DB_NAME;" || \
            print_error "Error al crear base de datos"
        print_success "Base de datos '$DB_NAME' creada"
    }

# Ejecutar schema
print_info "Ejecutando schema.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    -f "$DB_SCHEMA_FILE" > /dev/null 2>&1 || \
    print_error "Error al ejecutar schema.sql"
print_success "Schema cargado"

# Ejecutar seed
print_info "Ejecutando seed.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    -f "$DB_SEED_FILE" > /dev/null 2>&1 || \
    print_error "Error al ejecutar seed.sql"
print_success "Datos de prueba cargados"

echo ""
echo "=========================================="
print_success "Base de datos inicializada correctamente"
echo ""
print_info "Credenciales de prueba:"
echo "  Email: profesor@asisVox.com"
echo "  Password: demo123"
echo ""
print_info "Clases asignadas:"
echo "  - Matemáticas 10°A (Aula 101)"
echo "  - Matemáticas 10°B (Aula 102)"
echo ""
print_info "Próximo paso: npm run dev"
