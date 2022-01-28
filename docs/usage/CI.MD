## Continuous Integration

### Set up the CI environment

1. Setup a Kubernetes cluster or namespace to be used as CI environment
2. Install [Flux](https://fluxcd.io/) GitOps solution to the CI environment.
3. Create a Git repository for End-To-End tests and implement the tests. E2E test should be implemented as Kubernetes CronJob and deployable by a Helm chart.
4. Create a Git repository for CI environment where you create HelmRelease for Backk platform, Backk microservices and E2E tests. 
5. In HelmReleases, set the Helm chart version to `>=1.0.0'. In this way, CI environment is automatically updated when new Helm chart version is available. 
6. Take into use the GitHub CI workflow in `.github/workflows/ci.yaml` in your Backk microservice or implement similar CI pipeline with another CI tool (see next section).

### Implement your own CI pipeline
You should have the following steps in your CI pipeline:
- Checkout code from source control
- Execute in Node container:
  - Install dependencies with command `npm ci`
  - Lint your source code with `npm run lint` command
  - Run unit tests with command `npm run test:coverage`
- Perform static code analysis with SonarQube or SonarCloud or similar tool
- Implement legal and compliance check with Fossa scan or similar tool
- Execute in container containing Docker:
  - Setup integration testing environment by running command `docker-compose --env-file env.ci up --build -d`
  - Run integration tests with command `scripts/run-integration-tests-in-ci.sh`
  - Perform OWASP ZAP API scan against file `generated/openapi/openApiPublicSpec.yaml`
  - Tear down integration testing environment with command `docker-compose --env-file env.ci down -v`
  - Lint Dockerfile with Hadolint
  - Log in to your Docker registry
  - Build docker image
  - Tag docker image with 
    - In main branch: microservice version and `latest`
    - In feature branch: <branch-name>-<build-number>-<git-commit-hash>
  - Push docker image to Docker registry
  - Docker image vulnerability scan with Anchore, Snyk, JFrog Xray or another similar tool
  - Install helm
  - Update app and chart version in Helm Chart.yaml file:
    - `sed -i "s/^version:.*/version: ${{ microserviceVersion }}/g" helm/<your-microservice-name>/Chart.yaml`
    - `sed -i "s/^appVersion:.*/appVersion: ${{ microserviceVersion }}/g" helm/<your-microservice-name>/Chart.yaml`
  - Update docker image tag in Helm values.yaml file.
    - For security reasons, dockerImageTag should contain both version and digest, for example 1.0.0@sha256:3235326357dfb65f1781dbc4df3b834546d8bf914e82cce58e6e6b
    - `sed -i "s/^imageTag:.*/imageTag: ${{ dockerImageTag }}/g helm/<your-microservice-name>/values.yaml"`
  - Lint Helm chart with command `helm lint -f helm/values/values-minikube.yaml helm/<your-microservice-name>`
  - Perform static code analysis for Helm chart with Checkov. If you have added other infrastructure code, e.g. Terraform, perform SCA for that also.
  - Package helm chart with command `helm package helm/<your-microservice-name>`
  - Push Helm chart package to Helm chart repository

#### Publishing generated client code as NPM packages
If you have generated client code for your Backk microservice that you want to publish as npm package, you can have additional steps in your CI pipeline to:
- Set the correct version of client in client's `package.json`
- Publish the package to NPM registry with `npm publish`

For more information about Client generation, see [here.](./CLIENT_GENERATION.MD)
