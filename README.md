# TCG Master Guide

A comprehensive guide for trading card game players, built with Next.js.

## Content Editing

For content writers looking to add or edit deck guides, see the [Content Editing Guide](./docs/content-editing-guide.md).

## Development

### Prerequisites

- Node.js 20.x or later
- npm

### Getting Started

1. Install dependencies:
   ```bash
   make install
   ```

2. Run the development server:
   ```bash
   make dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Commands

See `make help` for all available commands, or check [AGENTS.md](./AGENTS.md) for detailed development workflow.

## Deployment

### Infrastructure Setup

First, deploy the Azure infrastructure using Terraform:

```bash
cd terraform
./deploy.sh prod
```

See [terraform/README.md](./terraform/README.md) for detailed infrastructure setup instructions.

### Deploying the Application

Deployment is automated via GitHub Actions. When you push to the `main` branch, the application automatically deploys to Azure Static Web Apps.

## Architecture

See [docs/architecture/](./docs/architecture/) for architecture documentation.

## License

ISC
