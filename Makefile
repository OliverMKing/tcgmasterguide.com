.PHONY: help install dev build start lint type-check clean format test

# Default target
help:
	@echo "TCG Master Guide - Available Make Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build production bundle"
	@echo "  make start        - Start production server"
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

# Development server
dev:
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
