## <a name="get-started"></a> Get Started

### <a name="development-environment"></a> Development Environment

Follow the below steps: (In the future, there will be [backk-cli](https://github.com/backk-node/backk-cli) available, which can be used to generate a Backk project based on a set of questions)

1. Clone [Backk starter](https://github.com/backk-node/backk-starter) project to a directory named after your microservice and cd into that directory.

   ```bash
   # Using SSH
   git clone git@github.com:backk-node/backk-starter.git <your-microservice-name>
   
   # Or using HTTPS
   git clone https://github.com/backk-node/backk-starter.git <your-microservice-name>

   cd <your-microservice-name>
   ```

2. Complete all the 3 TODOs in `src/main.ts` and `src/microservice.ts` files
3. Check that the environment variable values in the `.env.dev` file are correct for your development environment
    - If you are using MongoDB, check
        - `MONGODB_HOST`
        - `MONGODB_PORT`
        - `MONGODB_USER`
        - `MONGODB_PASSWORD`
    - If you are using MySQL/MariaDB or MySQL compatible database, check
        - `MYSQL_HOST`
        - `MYSQL_PORT`
        - `MYSQL_USER`
        - `MYSQL_PASSWORD`
    - If you are using PostgreSQL or PostgreSQL compatible database, check
        - `POSTGRESQL_HOST`
        - `POSTGRESQL_PORT`
        - `POSTGRESQL_USER`
        - `POSTGRESQL_PASSWORD`
    - If you are using Kafka, check
        - `KAFKA_HOST`
        - `KAFKA_PORT`
    - if you are using Redis as a message queue, check
        - `REDIS_HOST`
        - `REDIS_PORT`
    - if you are using Redis as a response cache, check
        - `REDIS_CACHE_HOST`
        - `REDIS_CACHE_PORT`
4. OPTIONAL STEP: Remove unnecessary dependencies from `package.json` file
    - If you are using MongoDB, remove following lines:
      ```
      "@opentelemetry/plugin-mysql": "0.11.0",
      "@opentelemetry/plugin-pg": "0.11.0",
      "mysql2": "2.2.5",
      "pg": "^8.0.2",
      ```
    - If you are using MySQL/MariaDB or MySQL compatible database, remove following lines:
      ```
      "@opentelemetry/plugin-mongodb": "0.11.0",
      "@opentelemetry/plugin-pg": "0.11.0",
      "mongodb": "^3.6.6",
      "pg": "^8.0.2",
      ```
    - If you are using PostgreSQL or PostgreSQL compatible database, remove following lines:
      ```
      "@opentelemetry/plugin-mongodb": "0.11.0",
      "@opentelemetry/plugin-mysql": "0.11.0",
      "mongodb": "^3.6.6",
      "mysql2": "2.2.5",
      ```
    - If you are **NOT** using any database, remove following lines:
      ```
      "@opentelemetry/plugin-mongodb": "0.11.0",
      "@opentelemetry/plugin-mysql": "0.11.0",
      "@opentelemetry/plugin-pg": "0.11.0",
      "mongodb": "^3.6.6",
      "mysql2": "2.2.5",
      "pg": "^8.0.2",
      ```
    - If you are **NOT** using Kafka, remove following line:
      ```
      "kafkajs": "^1.15.0",
      ```
    - If you are **NOT** using Redis, remove following lines:
      ```
      "@opentelemetry/plugin-ioredis": "0.11.0",
      "ioredis": "^4.19.2",
      ```
5. Run `npm install`
6. Run `npm run build`
7. Generate the [OpenAPI 3](https://swagger.io/specification/) API specs for your API implementation with following command:
   ```bash
   npm run generateApiSpecs
   ```
8. Run `npm run start:dev`<br/><br/>
   There is one example service in `src/services/example` directory that you can use as a basis for your own service(s).
   If/When you don't need that example service anymore, just delete the `src/services/example` directory and remove the example service instantiation also from the `MicroserviceImpl` class in `src/microservice.ts` file.
9. You can use your microservice API using [Postman](https://www.postman.com/downloads/) or [SwaggerHub](https://app.swaggerhub.com/home)  
   For Postman:
    1. Launch Postman
    2. Choose `Import` and then choose file `generated/openapi/openApiPublicSpec.yaml`

   For SwaggerHub:
    1. Navigate to [SwaggerHub](https://app.swaggerhub.com/home)
    2. Choose `Create New` and then `Import and Document API` and then choose file `generated/openapi/openApiPublicSpec.yaml`
10. Backk automatically generates some integration tests, and they can be run with following command:
    ```bash
    # NOTE! You need to have the microservice running before executing the integration tests,
    # so ensure you have run npm run start:dev before running the below command
   
    npm run integrationtest:dev
    ```
    You can also import the integration tests to Postman from file `generated/integrationtests/integrationTestsPostmanCollection.json`
11. Remove the `.git` directory (e.g. `rm -rf .git`)
12. Create a git repo (e.g. in Github)
13. Initialize and push to new repo:
    ```bash
    git init
    git add .
    git commit -m "First commit"
    git branch -M main
    git remote add origin git@github.com:<organization>/<your-microservice-name>.git
    git push -u origin main
    ```
