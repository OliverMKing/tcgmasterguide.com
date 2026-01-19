
# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Development Workflow

### Testing Requirements
**CRITICAL:** Always test your changes before considering them complete:

1. **After making changes that affect the application:**
   - Check if the dev server is already running by using `curl http://localhost:3000`
   - If not running, start `make dev` in the background
   - Use `curl http://localhost:3000` or visit the URL to verify the app works correctly
   - Check for compilation errors, runtime errors, and visual issues
   - Leave the dev server running for future tests (do not kill it after verifying) only if it was already running before. If you had to start the dev server, kill it

2. **Before committing code:**
   - Run `make type-check` to ensure TypeScript types are valid
   - Run `make lint` to check for code quality issues
   - Run `make build` to ensure the production build works

3. **Example testing workflow:**
   ```bash
   # Check if dev server is already running
   curl -s http://localhost:3000 > /dev/null && echo "Server running" || echo "Server not running"

   # Only start dev server if not already running
   # make dev  # (run in background)

   # Test the application
   curl http://localhost:3000

   # Leave the server running for future tests only if it was already running
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

### Feature Todo List
The project maintains a feature backlog at:
```
docs/TODO.md
```

When working on new features:
1. Check `docs/TODO.md` for planned features and their priority
2. Mark items as in-progress by changing `[ ]` to `[x]` when starting work
3. Add new feature ideas to the appropriate priority section
4. Remove completed items or move them to a "Completed" section at the bottom
