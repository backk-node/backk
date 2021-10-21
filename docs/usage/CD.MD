## Continuous Deployment

- [Continuous Deployment to Staging Environment](#cdstaging)
- [Continuous Deployment to Production Environment](#cdproduction)

### <a name="cdstaging"></a> Continuous Deployment to Staging Environment
Continuous deployment to staging environment(s) should happen at regular intervals, for example
once a week. During the one-week period, software system is first tested with functional E2E tests (same tests
as are run periodically in CI environment) and then non-functional testing is performed using preferable automated
test.

Following aspects of software system is tested as part of the non-functional testing period:
- Endurance/soak/reliability testing
- Recovery testing (by introducing artificial faults, chaos engineering)
- Load, scalability and performance testing
- Stress testing
- Security testing
  - Penetration testing (Nessus/Nmap)
  - Web application security testing (Burp Suite)

You should create a staging CD pipeline which is trigger at regular interval, e.g. once a week
every monday at 00:00. Staging CD pipeline should check out the CI environment GitOps repo and 
update chart versions from CI environment GitOps repo to staging environment GitOps repo.
Then CD pipeline should start automated functional and non-functional tests in staging environment.

### <a name="cdproduction"></a> Continuous Deployment to Production Environment
You should have a manually or automatically triggerable production CD pipeline which should be 
triggered only after successful functional and non-functional verification in staging environment.
Production CD pipeline should check out the staging environment GitOps repo and update chart versions
from staging environment GitOps repo to production environment GitOps repo.


