## CI/CD Setup

This repository uses GitHub Actions for CI/CD.

### Workflow File

The workflow file is located at `.github/workflows/ci-cd.yml`.

### Pipeline Stages

The pipeline consists of the following stages:

1. **Build**: Builds the application using the `build` script.

2. **Test**: Runs the unit tests and integration tests using the `test` script.

3. **Deploy**: Deploys the application to the production environment using the `deploy` script.

### Environment Variables

The following environment variables are used in the pipeline:

* `GITHUB_TOKEN`: The GitHub token used for authentication.

* `CI_CD_ENV`: The environment variable that determines the deployment environment (e.g., production, staging).

### Secrets

The following secrets are used in the pipeline:

* `GITHUB_TOKEN`: The GitHub token used for authentication.

* `CI_CD_ENV`: The environment variable that determines the deployment environment (e.g., production, staging).

### Dependencies

The pipeline uses the following dependencies:

* `github-actions`: The GitHub Actions workflow runner.

* `docker`: The Docker containerization platform.

* `kubectl`: The Kubernetes command-line tool.
