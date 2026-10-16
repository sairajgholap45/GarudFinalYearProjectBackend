#!/bin/bash
# Admin Panel API Test Script

# Configuration
API_URL="http://localhost:5000/api"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Garud Admin Panel API Test ===${NC}\n"

# Test 1: Admin Login
echo -e "${BLUE}1. Testing Admin Login...${NC}"
curl -X POST "$API_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }"
echo -e "\n\n"

# Test 2: Get Dashboard
echo -e "${BLUE}2. Testing Get Dashboard...${NC}"
curl -X GET "$API_URL/admin/dashboard" \
  -H "x-admin-email: $ADMIN_EMAIL" \
  -H "x-admin-password: $ADMIN_PASSWORD" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 3: Get All Enquiries
echo -e "${BLUE}3. Testing Get All Enquiries...${NC}"
curl -X GET "$API_URL/admin/enquiries?status=all&limit=10" \
  -H "x-admin-email: $ADMIN_EMAIL" \
  -H "x-admin-password: $ADMIN_PASSWORD" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 4: Get New Enquiries Only
echo -e "${BLUE}4. Testing Get New Enquiries...${NC}"
curl -X GET "$API_URL/admin/enquiries?status=new" \
  -H "x-admin-email: $ADMIN_EMAIL" \
  -H "x-admin-password: $ADMIN_PASSWORD" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 5: Get Analytics
echo -e "${BLUE}5. Testing Get Analytics...${NC}"
curl -X GET "$API_URL/admin/analytics/enquiries" \
  -H "x-admin-email: $ADMIN_EMAIL" \
  -H "x-admin-password: $ADMIN_PASSWORD" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 6: Export as JSON
echo -e "${BLUE}6. Testing Export Enquiries (JSON)...${NC}"
curl -X GET "$API_URL/admin/export/enquiries?format=json" \
  -H "x-admin-email: $ADMIN_EMAIL" \
  -H "x-admin-password: $ADMIN_PASSWORD" \
  -H "Content-Type: application/json" \
  -o "enquiries-export.json"
echo -e "\n${GREEN}Exported to enquiries-export.json${NC}\n"

# Test 7: Export as CSV
echo -e "${BLUE}7. Testing Export Enquiries (CSV)...${NC}"
curl -X GET "$API_URL/admin/export/enquiries?format=csv" \
  -H "x-admin-email: $ADMIN_EMAIL" \
  -H "x-admin-password: $ADMIN_PASSWORD" \
  -H "Content-Type: application/json" \
  -o "enquiries-export.csv"
echo -e "\n${GREEN}Exported to enquiries-export.csv${NC}\n"

echo -e "${GREEN}=== Tests Complete ===${NC}"
