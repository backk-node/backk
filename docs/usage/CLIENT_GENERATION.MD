## Client Generation

Backk generates internal and frontend clients automatically when using the default git commit pre-hook
that comes with the `backk-starter` project.

You can also generate clients using the following command:
```bash
npm run generateClients
```

Clients are generated in directory `generated/clients/frontend` and `generated/clients/internal`.

Internal client is meant to be used inside Kubernetes cluster for other microservices to connect to your microservice.
Frontend client is meant to be used in apps running in web browser, and it requires `backk-frontend-utils` to be installed in client project. (See below section)

There are several ways that you can use the clients:
- You manually copy generated client to your client project. This is how it is done in [backk-example-frontend](https://github.com/backk-node/backk-example-frontend)
- You can reference the directory containing the clients directly from other project if you are using a monorepo
- In your client project, you can create a git submodule or subtree that references the generated client code
- In your CI pipeline, you can publish the generated client as NPM libraries, needed package.json file is generated for you automatically. You have to just implement the versioning for the library in your CI pipeline, before publish to NPM registry. The generated code always has package.json version of 1.0.0 

### Backk Frontend Utils
If you want to use generated frontend clients in your frontend project, you need to install [backk-frontend-utils](https://github.com/backk-node/backk-frontend-utils) in
your frontend project:

```bash
npm install --save --save-exact backk-frontend-utils
```

### Example Backk React Frontend
There is an example React frontend available [backk-example-frontend](https://github.com/backk-node/backk-example-frontend)
It is using [backk-example-microservice](https://github.com/backk-node/backk-example-microservice) as backend.
