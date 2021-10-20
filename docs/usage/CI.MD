## Continuous Integration

1. Setup a Kubernetes cluster or namespace to be used as CI environment
2. Install [Flux](https://fluxcd.io/) GitOps solution to the CI environment.
3. Create a Git repository for End-To-End tests and implement the tests. E2E test should be implemented as Kubernetes CronJob and deployable by a Helm chart.
4. Create a Git repository for CI environment where you create HelmRelease for each of your Backk platform, Backk microservices and E2E tests. 
5. In HelmReleases, set the Helm chart version to `>=1.0.0'. In this way, CI environment is automatically updated when new Helm chart version is available. 
6. Take into use the GitHub CI workflow in `.github/workflows/ci.yaml` or implement your own CI pipeline.

### Implement your own CI pipeline

You should have following steps in you CI pipeline:
- Checkout code from source control
- Execute in Node container:
  - Install dependencies with command `npm install`
  - Run unit tests with command `npm run test:coverage`
- Perform static code analysis with SonarQube or SonarCloud or another similar tool
- Implement legal and compliance check with Fossa scan and test or another similar tool
- Execute in container containing Docker:
  - Setup integration testing environment by running command `docker-compose --env-file env.ci up`
  - Run integration tests with command `./runIntegrationTestsInCi.sh`
  - Perform OWASP ZAP API scan against file `generated/openapi/openApiPublicSpec.yaml`
  - Tear down integration testing environment with command `docker-compose down`
  - Log in to your Docker registry
  - Build docker image
  - Tag docker image with 
    - In main branch: microservice version and `latest`
    - In feature branch: <Build number>-<Git commit hash>
  - Push docker image to Docker registry
  - Docker image vulnerability scan with Anchore or another similar tool
  - Install helm
  - Update app and chart version in Helm Chart.yaml file:
    - `sed -i "/version: .*/version: ${{ microserviceVersion }}/g helm/backk-example-microservice/Chart.yaml"`
    - `sed -i "/appVersion: .*/appVersion: "${{ microserviceVersion }}"/g helm/backk-example-microservice/Chart.yaml"`
  - Update docker image tag in Helm values.yaml file.
    - For security reasons, dockerImageTag should contain both version and digest, for example 1.0.0@sha256:3235326357dfb65f1781dbc4df3b834546d8bf914e82cce58e6e6b
    - `sed -i "/tag: .*/tag: ${{ dockerImageTag }}/g helm/backk-example-microservice/values.yaml"`
  - Lint Helm chart with command `helm lint helm/<backk-microservice-name>`
  - Package helm chart with command `helm package helm/<backk-microservice-name>`
  - Push Helm chart package to Helm chart repository
