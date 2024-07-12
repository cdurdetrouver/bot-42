COMPOSE_FILE=docker-compose.yaml

all:build up

# Build the Docker images
build:
	docker-compose -f $(COMPOSE_FILE) build

# Start the services
up:
	docker-compose -f $(COMPOSE_FILE) up -d

# Stop the services
down:
	docker-compose -f $(COMPOSE_FILE) down

# View logs for the services
logs:
	docker-compose -f $(COMPOSE_FILE) logs

# Rebuild and restart the services
rebuild:
	docker-compose -f $(COMPOSE_FILE) down

	docker-compose -f $(COMPOSE_FILE) build

	docker-compose -f $(COMPOSE_FILE) up -d

# Help command to display available commands
help:
	@echo "Available commands:"
	@echo "  build    - Build the Docker images"
	@echo "  up       - Start the services"
	@echo "  down     - Stop the services"
	@echo "  logs     - View logs for the services"
	@echo "  rebuild  - Rebuild and restart the services"