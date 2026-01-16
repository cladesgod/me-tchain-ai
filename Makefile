# =============================================
# me.tchain.ai Makefile
# =============================================

.PHONY: help install dev build test lint clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development servers"
	@echo "  make build       - Build for production"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linters"
	@echo "  make clean       - Clean build artifacts"

# ---------------------------------------------
# Installation
# ---------------------------------------------
install: install-backend install-frontend

install-backend:
	cd backend && pip install -r requirements.txt -r requirements-dev.txt

install-frontend:
	cd frontend && pnpm install

# ---------------------------------------------
# Development
# ---------------------------------------------
dev:
	@echo "Starting development servers..."
	@make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

dev-frontend:
	cd frontend && pnpm dev

# ---------------------------------------------
# Build
# ---------------------------------------------
build: build-backend build-frontend

build-backend:
	@echo "Backend is Python - no build needed"

build-frontend:
	cd frontend && pnpm build

# ---------------------------------------------
# Testing
# ---------------------------------------------
test: test-backend test-frontend

test-backend:
	cd backend && pytest -v --cov=app tests/

test-frontend:
	cd frontend && pnpm test

test-e2e:
	cd frontend && pnpm test:e2e

# ---------------------------------------------
# Linting
# ---------------------------------------------
lint: lint-backend lint-frontend

lint-backend:
	cd backend && ruff check . && ruff format --check .

lint-frontend:
	cd frontend && pnpm lint

format:
	cd backend && ruff format .
	cd frontend && pnpm format

# ---------------------------------------------
# Database
# ---------------------------------------------
db-migrate:
	cd backend && alembic upgrade head

db-rollback:
	cd backend && alembic downgrade -1

db-reset:
	cd backend && rm -f data/app.db && alembic upgrade head

# ---------------------------------------------
# Cleanup
# ---------------------------------------------
clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .ruff_cache -exec rm -rf {} +
	find . -type d -name node_modules -exec rm -rf {} +
	find . -type d -name dist -exec rm -rf {} +
	find . -type d -name build -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
