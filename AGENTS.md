
# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Development Workflow

### Testing Requirements
**CRITICAL:** Always test your changes before considering them complete:

1. **After making changes that affect the application:**
   - Run `make dev` in the background to start the development server
   - Use `curl http://localhost:3000` or visit the URL to verify the app works correctly
   - Check for compilation errors, runtime errors, and visual issues
   - Kill the background process when done testing

2. **Before committing code:**
   - Run `make type-check` to ensure TypeScript types are valid
   - Run `make lint` to check for code quality issues
   - Run `make build` to ensure the production build works

3. **Example testing workflow:**
   ```bash
   # Start dev server in background
   make dev  # (run in background)

   # Wait a few seconds for server to start
   sleep 3

   # Test the application
   curl http://localhost:3000

   # Kill the background process when done
   ```

**Never assume changes work without testing.** This prevents shipping broken code.

## Project Commands

### Using the Makefile
This project uses a Makefile for common development tasks. Use these commands instead of running npm scripts directly:

**Development:**
- `make install` - Install all dependencies
- `make dev` - Start the Next.js development server (http://localhost:3000)
- `make build` - Build the production bundle
- `make start` - Start the production server

**Code Quality:**
- `make lint` - Run ESLint to check for code issues
- `make type-check` - Run TypeScript type checking without emitting files

**Utilities:**
- `make clean` - Remove all build artifacts and dependencies
- `make clean-deps` - Remove node_modules only
- `make clean-build` - Remove build artifacts (.next, out, dist) only
- `make help` - Display all available commands

**Important:** Always use `make` commands when working with this project to ensure consistency.

## Documentation Structure

### Architecture Design
Store architecture and technical design documents in:
```
docs/architecture/
```

### Business Logic
Store business requirements and feature specifications in:
```
docs/business/
```
