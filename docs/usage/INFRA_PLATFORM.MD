## Infrastructure and Platform

- [Kubernetes Cloud Infrastructure Deployment](#iac)
- [Platform Services](#platformservices)
    - [Ingress Controller and API Gateway (Emissary)](#ingressapigateway)
    - [Service Mesh (Linkerd or Istio)](#servicemesh)
    - [Identity and Access Management and Single Sign On (Keycloak)](#iamsso)
    - [Monitoring and Alerting (Prometheus + Grafana)](#monitoringandalerting)
    - [Tracing (Jaeger)](#tracing)
    - [Logging (EFK stack: Elasticsearch + Fluentd + Kibana)](#logging)
    - [GitOps (Flux)](#gitops)
    - [Message Queue (Kafka or/and Redis)](#messagequeue)
- [Platform Deployment to Kubernetes Cluster](#platformdeployment)

### <a name="iac"></a> Kubernetes Cloud Infrastructure Deployment
The cloud infrastructure needed for Kubernetes cluster should be deployed using Infrastructure as Code (IaC)
principle. The best way is to use a declarative way of defining the needed infrastructure.
It is recommended to use a comprehensive IaC tool like [Terraform](https://www.terraform.io/)

Terraform provide tutorials and ready-made code for deploying Kubernetes cluster to Cloud:
- [Provision an EKS Cluster (AWS)](https://learn.hashicorp.com/tutorials/terraform/eks?in=terraform/kubernetes)
- [Provision an AKS Cluster (Azure)](https://learn.hashicorp.com/tutorials/terraform/aks?in=terraform/kubernetes)
- [Provision a GKE Cluster (Google Cloud)](https://learn.hashicorp.com/tutorials/terraform/gke?in=terraform/kubernetes)
- [Deploy Federated Multi-Cloud Kubernetes Clusters](https://learn.hashicorp.com/tutorials/terraform/multicloud-kubernetes?in=terraform/kubernetes)

### <a name="platformservices"></a> Platform Services
After deploying Kubernetes cluster in the cloud, you need to build and deploy a platform for your
Software systems and applications. The platform will consist of several SW components that are shared
between multiple applications and software systems. Platform services will consist of services like Centralized
logging, monitoring and Identity and Access Management and Single Sign On.

#### <a name="ingressapigateway"></a> Ingress Controller and API Gateway (Emissary)
Kubernetes cluster needs to have an Ingress resource defined to control incoming traffic from external sources.
In order for the Ingress resource to work, an Ingress Controller must be installed to run on edge nodes. [Emissary-Ingress](https://github.com/emissary-ingress/emissary)
is recommended to act as Kubernetes Ingress Controller. Emissary Ingress is a [CNCF Incubating project](https://landscape.cncf.io/)

In addition to Ingress, an API Gateway is needed to redirect traffic from Kubernetes cluster edge nodes to actual
microservices. [Emissary-Ingress](https://github.com/emissary-ingress/emissary)
is recommended to act as an API Gateway. In addition to routing, Emissary API Gateway performs other tasks like TLS termination, rate limiting,
access logging, advanced load balancing, Automatic retries, circuit breakers, canary releases,
HTTP header manipulation and response Gzip compression.

#### <a name="servicemesh"></a> Service Mesh (Linkerd or Istio)
Service mesh is needed for following functionalities:
- Automatic mTLS between Kubernetes Pods to secure inside cluster traffic
- Retries and timeouts for inter-Pod traffic
- Authorization policy to restrict inter-Pod communication
- Stability and reliability testing with artificial fault injection (chaos engineering)

[Linkerd](https://linkerd.io/) is recommended as Service mesh. Linkerd is fast and lightweight,
and it is [CNCF graduated project](https://landscape.cncf.io/).

Another recommended service mesh is [Istio](https://istio.io/latest/). 
Istio is currently a bit more feature rich, but also more complex to configure and operate.

#### <a name="iamsso"></a> Identity and Access Management and Single Sign On (Keycloak)
Your microservices need authentication and authorization management solution
with support of SSO, OAuth 2.0, OpenID Connect, LDAP and Active Directory integration.

[Keycloak](https://www.keycloak.org/) is recommended solution for IAM and SSO.

#### <a name="monitoringandalerting"></a> Monitoring and Alerting (Prometheus + Grafana)
For centralized metrics collection, alerting and monitoring, you need [Prometheus](https://prometheus.io/)
and [Grafana](https://grafana.com/). Prometheus is a [CNCF graduated project](https://landscape.cncf.io/).

#### <a name="tracing"></a> Tracing (Jaeger)
For distributed tracing, you need [Jaeger](https://www.jaegertracing.io/).
Jaeger is a [CNCF graduated project](https://landscape.cncf.io/).

#### <a name="logging"></a> Logging (EFK stack: Elasticsearch + Fluentd + Kibana)
For centralized logging needs, Platform needs a log collector, log store and log viewer.
For log collection, [Fluentd](https://www.fluentd.org/) is needed. Fluentd is [CNCF graduated project](https://landscape.cncf.io/).
For log storage and viewing, [Elasticsearch and Kibana](https://www.elastic.co/) are needed.

#### <a name="gitops"></a> GitOps (Flux)
For application deployments, a GitOps solution is needed. [Flux](https://fluxcd.io/) is recommended. It
is also a [CNCF Incubating project](https://landscape.cncf.io/).

#### <a name="messagequeue"></a> Message Queue (Kafka and/or Redis)
