## Kubernetes Deployment
The deployment of a Backk microservice to a Kubernetes cluster is done with Helm and Helm Charts, which
are defined in the `helm` directory.

### Helm Charts
The Kubernetes deployment of the Backk microservice contains following definitions:
- Deployment
- Service
- Service Account
- Horizontal Pod Autoscaler
- ConfigMap
- Secret
- Emissary Ingress Mapping and RateLimit (Coming in the future)
- Keycloak IAM KeycloakClient (Coming in the future)

### Deployment to a Local Kubernetes Environment

#### Prepare Local Kubernetes Environment
For using Minikube, you need to have Docker for Mac/Windows installed.

1. Install [minikube](https://minikube.sigs.k8s.io/docs/)
2. Install [helm](https://helm.sh/docs/intro/install/)
3. Start minikube 
   ```bash
   npm run minikube:start
   ```
4. Install NGINX Ingress Controller
   ```bash
   minikube addons enable ingress
   ```

#### Deploy to a Local Kubernetes Environment
1. Install to Minikube with Helm
   ```bash
   npm run helm:install
   ```

If you need to configure the values for the Helm installation, you can edit `helm/values/values-minikube.yaml` file

The above script `npm run helm:install` will perform the following before Helm installation if needed:
 - Builds Docker image with tag <git-user-name>-<git-branch> (`npm run docker:build`)
 - Pushes Docker image to Docker registry (`npm run docker:push`)
 - Starts Minikube (`npm run minikube:start`)
 - Lints the Helm chart (`npm run helm:lint`)
 - Packages the Helm chart (`npm run helm:package`)
 - Removes existing Helm installation (`npm run helm:uninstall`)

### Deployment to a Shared Kubernetes Development Environment
You want to have one or more shared Kubernetes dev environments where all teams and team members can 
test their Backk microservices.

Implement [Flux GitOps](https://fluxcd.io/) in the shared development environments(s). 

You should build your Backk microservice with CI pipeline which creates and publishes a packaged Helm Chart
with specific version.

After you have built your Backk microservice, modify the Backk microservice version in the Git repository for the wanted shared development lab.
Wait for a while and new version of your Backk microservice will be deployed automatically via GitOps to the development lab.

### Deployment to Kubernetes CI Environment
Implement [Flux GitOps](https://fluxcd.io/) in CI environments, so that new version of Backk microservices
are automatically updated to CI environment after successful build in main branch.

### Deployment to Kubernetes Staging Environment
Implement [Flux GitOps](https://fluxcd.io/) in staging environments, so that newest versions of Backk microservices
are automatically updated at specified intervals (e.g. once in a week) to staging environment
for longer period functional and especially non-functional verification.

### Deployment to Kubernetes Production Environment 
Implement [Flux GitOps](https://fluxcd.io/) in production environments, so that newer versions of Backk microservices
are either automatically or manually updated at specified intervals (e.g. once in a week) to production environment only after successful longer period (e.g. 1 week) functional and non-functional
verification in the staging environment.
