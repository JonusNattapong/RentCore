.PHONY: help up down restart logs db-shell db-reset dev-up dev-down dev-logs

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all production containers
	docker-compose up -d

down: ## Stop all production containers
	docker-compose down

restart: ## Restart all production containers
	docker-compose restart

logs: ## Show logs from all containers
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-db: ## Show PostgreSQL logs
	docker-compose logs -f postgres

db-shell: ## Connect to PostgreSQL shell
	docker exec -it rentcore-postgres psql -U rentcore -d rentcore

db-reset: ## Reset database (WARNING: deletes all data)
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	docker exec -it rentcore-postgres psql -U rentcore -d rentcore -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	docker exec -it rentcore-postgres psql -U rentcore -d rentcore -f /docker-entrypoint-initdb.d/01-schema.sql
	@echo "Database reset complete."

db-backup: ## Backup database to file
	@docker exec rentcore-postgres pg_dump -U rentcore rentcore > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql"

db-restore: ## Restore database from file (usage: make db-restore FILE=backup.sql)
	docker exec -i rentcore-postgres psql -U rentcore rentcore < $(FILE)

dev-up: ## Start development containers (PostgreSQL + pgAdmin only)
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development containers
	docker-compose -f docker-compose.dev.yml down

dev-restart: ## Restart development containers
	docker-compose -f docker-compose.dev.yml restart

dev-logs: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-db-shell: ## Connect to development PostgreSQL shell
	docker exec -it rentcore-postgres-dev psql -U rentcore_dev -d rentcore_dev

clean: ## Remove all containers and volumes
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	@echo "All containers and volumes removed."

ps: ## Show running containers
	docker ps --filter "name=rentcore"
