.PHONY: help install dev build start lint type-check clean format test db-up db-down db-migrate db-generate

# Default target
help:
	@echo "TCG Master Guide - Available Make Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server (with Docker DB)"
	@echo "  make build        - Build production bundle"
	@echo "  make start        - Start production server"
	@echo ""
	@echo "Database:"
	@echo "  make db-up        - Start SQL Server in Docker"
	@echo "  make db-down      - Stop SQL Server Docker container"
	@echo "  make db-migrate   - Run Prisma migrations"
	@echo "  make db-generate  - Generate Prisma client"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint         - Run ESLint"
	@echo "  make type-check   - Run TypeScript type checking"
	@echo "  make format       - Format code with Prettier (when configured)"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Remove build artifacts and dependencies"
	@echo "  make clean-deps   - Remove node_modules only"
	@echo "  make clean-build  - Remove build artifacts only"
	@echo ""

# Install dependencies
install:
	npm install

# Start SQL Server in Docker
db-up:
	@docker compose up -d
	@echo "Waiting for SQL Server to be ready..."
	@until docker compose exec -T mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "LocalDev123!" -C -Q "SELECT 1" > /dev/null 2>&1; do \
		sleep 2; \
	done
	@echo "SQL Server is ready!"
	@docker compose exec -T mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "LocalDev123!" -C -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'tcgmasterguide') CREATE DATABASE tcgmasterguide" > /dev/null 2>&1 || true

# Stop SQL Server Docker container
db-down:
	docker compose down

# Run Prisma migrations
db-migrate: db-up
	npx prisma migrate dev

# Generate Prisma client
db-generate:
	npx prisma generate

# Development server (starts Docker DB first)
dev: db-up db-generate
	npm run dev

# Production build
build:
	npm run build

# Start production server
start:
	npm run start

# Linting
lint:
	npm run lint

# Type checking
type-check:
	npm run type-check

# Format code (placeholder for when prettier is added)
format:
	@echo "Prettier not yet configured. Run 'npm install -D prettier' to add formatting."

# Clean all
clean: clean-deps clean-build
	@echo "Cleaned all build artifacts and dependencies"

# Clean dependencies
clean-deps:
	rm -rf node_modules
	rm -f package-lock.json
	@echo "Removed node_modules and package-lock.json"

# Clean build artifacts
clean-build:
	rm -rf .next
	rm -rf out
	rm -rf dist
	@echo "Removed build artifacts"
