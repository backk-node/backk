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
is recommended to act as Kubernetes Ingress Controller.

In addition to Ingress, an API Gateway is needed to redirect traffic from Kubernetes cluster edge nodes to actual
microservices. In addition to routing, Emissary API Gateway performs other tasks like TLS termination, rate limiting,
access logging, advanced load balancing, Automatic retries, circuit breakers, canary releases,
HTTP header manipulation and response Gzip compression.

#### <a name="servicemesh"></a> Service Mesh (Linkerd or Istio)

#### <a name="iamsso"></a> Identity and Access Management and Single Sign On (Keycloak)

#### <a name="monitoringandalerting"></a> Monitoring and Alerting (Prometheus + Grafana)

#### <a name="tracing"></a> Tracing (Jaeger)

#### <a name="logging"></a> Logging (EFK stack: Elasticsearch + Fluentd + Kibana)

#### <a name="gitops"></a> GitOps (Flux)

#### <a name="messagequeue"></a> Message Queue (Kafka and/or Redis)
