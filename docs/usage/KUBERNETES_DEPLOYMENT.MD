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
- Emissary Ingress Mapping and RateLimit
- Keycloak IAM KeycloakClient

### Local Development Environment Kubernetes Deployment
Install [minikube](https://minikube.sigs.k8s.io/docs/)
Install [helm](https://helm.sh/docs/intro/install/)

Deploy your Backk Microservice with: 
```bash
helm install
# or
helm upgrade
```

### Kubernetes Development Lab Deployment
Implement [Flux GitOps](https://fluxcd.io/) in Development lab(s). 

You should build your Backk microservice with CI pipeline which creates and publish a packaged Helm Chart
with specific version.

After you have built your Backk microservice, modify the Backk microservice version in the Git repository for the wanted development lab.
Wait for a while and new version of your Backk microservice will be deployed automatically via GitOps to the development lab.
