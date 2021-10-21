## Continuous Deployment

- [Continuous Deployment to Staging Environment](#cdstaging)
- [Continuous Deployment to Production Environment](#cdproduction)

### <a name="cdstaging"></a> Continuous Deployment to Staging Environment
Continuous deployment to staging environment(s) should happen on a regular intervals, for example
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

### <a name="cdproduction"></a> Continuous Deployment to Production Environment
