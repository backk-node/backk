## Client Generation

Backk generates internal and frontend clients automatically when using th default git commit pre-hook
that comes with the backk-starter project.

You can also generate clients using following command:
```bash
npm run generateClientsOnly
```

Clients are generated in directory `generated/clients/frontend` and `generated/clients/internal`.

Internal client is meant to be used inside Kubernetes cluster for other microservices to connect to your microservice.
Frontend client is meant to be used in apps running in web browser.

There are several ways that you can use the clients:
- You can reference the directory containing the clients directly from other project if you are using a monorepo
- In your client project, you can create a git submodule or subtree that references the generated client code
- In your CI pipeline, you can publish the generated code as NPM libraries, needed package.json file is generated for you. You have to just implement the versioning for the library in your CI pipeline, before publish to NPM registry. The generated code always has package.json version of 1.0.0 
