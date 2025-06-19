#!/bin/bash

# Script para probar la API del sistema de monitoreo de bombas
# Este script ejecuta tests básicos para verificar que la API funciona correctamente

API_BASE="http://localhost:3000/api"
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧪 Iniciando tests de la API de Monitoreo de Bombas${NC}"
echo

# Function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Health check
echo -e "${CYAN}Test 1: Health Check${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$API_BASE/health")
http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    print_test 0 "Health check passed (HTTP $http_code)"
    echo "Response: $(cat /tmp/health_response.json | jq -r '.message')"
else
    print_test 1 "Health check failed (HTTP $http_code)"
fi
echo

# Test 2: User registration
echo -e "${CYAN}Test 2: User Registration${NC}"
timestamp=$(date +%s)
test_user="testapi$timestamp"
test_email="testapi$timestamp@example.com"

response=$(curl -s -w "%{http_code}" -o /tmp/register_response.json \
    -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$test_user\",
        \"email\": \"$test_email\",
        \"password\": \"TestPassword123\",
        \"name\": \"Test API User\"
    }")

http_code="${response: -3}"
if [ "$http_code" = "201" ]; then
    print_test 0 "User registration passed (HTTP $http_code)"
    TOKEN=$(cat /tmp/register_response.json | jq -r '.data.token')
    echo "User created: $test_user"
else
    print_test 1 "User registration failed (HTTP $http_code)"
    echo "Response: $(cat /tmp/register_response.json)"
fi
echo

# Test 3: User login with existing user
echo -e "${CYAN}Test 3: User Login (existing user)${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/login_response.json \
    -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser",
        "password": "password123"
    }')

http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    print_test 0 "User login passed (HTTP $http_code)"
    EXISTING_TOKEN=$(cat /tmp/login_response.json | jq -r '.data.token')
    echo "Logged in as: testuser"
else
    print_test 1 "User login failed (HTTP $http_code)"
    echo "Response: $(cat /tmp/login_response.json)"
fi
echo

# Test 4: Get user profile
if [ ! -z "$EXISTING_TOKEN" ]; then
    echo -e "${CYAN}Test 4: Get User Profile${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/profile_response.json \
        -X GET "$API_BASE/auth/profile" \
        -H "Authorization: Bearer $EXISTING_TOKEN")
    
    http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        print_test 0 "Get profile passed (HTTP $http_code)"
        username=$(cat /tmp/profile_response.json | jq -r '.data.user.username')
        echo "Profile for: $username"
    else
        print_test 1 "Get profile failed (HTTP $http_code)"
    fi
    echo
fi

# Test 5: Get pumps list
if [ ! -z "$EXISTING_TOKEN" ]; then
    echo -e "${CYAN}Test 5: Get Pumps List${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/pumps_response.json \
        -X GET "$API_BASE/pumps" \
        -H "Authorization: Bearer $EXISTING_TOKEN")
    
    http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        print_test 0 "Get pumps passed (HTTP $http_code)"
        count=$(cat /tmp/pumps_response.json | jq -r '.data.count')
        echo "Found $count pumps for testuser"
    else
        print_test 1 "Get pumps failed (HTTP $http_code)"
    fi
    echo
fi

# Test 6: Create new pump
if [ ! -z "$EXISTING_TOKEN" ]; then
    echo -e "${CYAN}Test 6: Create New Pump${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/create_pump_response.json \
        -X POST "$API_BASE/pumps" \
        -H "Authorization: Bearer $EXISTING_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test API Pump",
            "location": "Test Location",
            "capacity": "500 L/min",
            "model": "TEST-500",
            "manufacturer": "TestCorp",
            "powerRating": 8.5,
            "voltage": 220,
            "maxPressure": 50,
            "minPressure": 10,
            "efficiency": 85.0
        }')
    
    http_code="${response: -3}"
    if [ "$http_code" = "201" ]; then
        print_test 0 "Create pump passed (HTTP $http_code)"
        PUMP_ID=$(cat /tmp/create_pump_response.json | jq -r '.data.pump.id')
        pump_name=$(cat /tmp/create_pump_response.json | jq -r '.data.pump.name')
        echo "Created pump: $pump_name (ID: $PUMP_ID)"
    else
        print_test 1 "Create pump failed (HTTP $http_code)"
        echo "Response: $(cat /tmp/create_pump_response.json)"
    fi
    echo
fi

# Test 7: Get pump metrics
if [ ! -z "$EXISTING_TOKEN" ] && [ ! -z "$PUMP_ID" ]; then
    echo -e "${CYAN}Test 7: Get Pump Metrics${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/metrics_response.json \
        -X GET "$API_BASE/metrics/$PUMP_ID/current" \
        -H "Authorization: Bearer $EXISTING_TOKEN")
    
    http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        print_test 0 "Get metrics passed (HTTP $http_code)"
        flow_rate=$(cat /tmp/metrics_response.json | jq -r '.data.metrics.flow_rate')
        echo "Current flow rate: $flow_rate L/min"
    else
        print_test 1 "Get metrics failed (HTTP $http_code)"
    fi
    echo
fi

# Test 8: Simulate metrics
if [ ! -z "$EXISTING_TOKEN" ] && [ ! -z "$PUMP_ID" ]; then
    echo -e "${CYAN}Test 8: Simulate Metrics${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/simulate_response.json \
        -X POST "$API_BASE/metrics/$PUMP_ID/simulate" \
        -H "Authorization: Bearer $EXISTING_TOKEN")
    
    http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        print_test 0 "Simulate metrics passed (HTTP $http_code)"
        flow_rate=$(cat /tmp/simulate_response.json | jq -r '.data.metrics.flow_rate')
        pressure=$(cat /tmp/simulate_response.json | jq -r '.data.metrics.pressure')
        echo "Simulated metrics - Flow: $flow_rate L/min, Pressure: $pressure PSI"
    else
        print_test 1 "Simulate metrics failed (HTTP $http_code)"
    fi
    echo
fi

# Cleanup: Delete created pump
if [ ! -z "$EXISTING_TOKEN" ] && [ ! -z "$PUMP_ID" ]; then
    echo -e "${CYAN}Cleanup: Delete Test Pump${NC}"
    response=$(curl -s -w "%{http_code}" -o /tmp/delete_response.json \
        -X DELETE "$API_BASE/pumps/$PUMP_ID" \
        -H "Authorization: Bearer $EXISTING_TOKEN")
    
    http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        print_test 0 "Delete pump passed (HTTP $http_code)"
    else
        print_test 1 "Delete pump failed (HTTP $http_code)"
    fi
    echo
fi

# Clean up temp files
rm -f /tmp/*_response.json

echo -e "${CYAN}🏁 Tests completados${NC}"
echo -e "${YELLOW}💡 Tip: Para más tests detallados, usa herramientas como Postman o Insomnia${NC}"
