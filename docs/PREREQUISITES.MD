## Prerequisites

1. [Node.js](https://nodejs.org/en/download/) >= 12.19
2. If your microservice uses a database, you need to install a local instance of the database or have a remote instance available, for example a cloud database.
   You can also run a database in a container. For running a container in Mac or Windows, you need to install [Docker Desktop](https://www.docker.com/products/docker-desktop). You can use the same database installation for developing multiple Backk microservices. Backk will create a separate database/schema for each microservice. For local database installations:
    - [Download and install PostgreSQL](https://www.postgresql.org/download/) or [run PostgreSQL in a container](https://hub.docker.com/_/postgres)
    - [Download and install MySQL](https://www.mysql.com/downloads/) or [run MySQL in a container](https://hub.docker.com/_/mysql)
    - [Download and install MariaDB](https://mariadb.org/download/) or [run MariaDB in a container](https://hub.docker.com/_/mariadb)
    - [Download and install MongoDB](https://www.mongodb.com/try/download/community) or [run MongoDB in a container](https://hub.docker.com/_/mongo)
    - [Download and install Vitess](https://vitess.io/docs/get-started/local/) or [run Vitess in a container](https://vitess.io/docs/get-started/local-docker)
    - [Download and install CockroachDB](https://www.cockroachlabs.com/docs/stable/install-cockroachdb.html) or [run CockroachDB in a container](https://hub.docker.com/r/cockroachdb/cockroach)
    - [Download and install YugabyteDB](https://download.yugabyte.com/) or [run YugabyteDB in a container](https://hub.docker.com/r/yugabytedb/yugabyte)
3. If your microservice uses Kafka, you need to install a local instance of Kafka or have a remote instance available, for example in cloud. You can use the same Kafka installation for developing multiple microservices. By default, each microservice will only consume messages from a topic named after the microservice. For local Kafka installation:
    - [Download and install Kafka](https://kafka.apache.org/downloads) or [run Kafka in a container](https://hub.docker.com/r/wurstmeister/kafka)
4. If your microservice uses Redis (as message queue and/or response cache), you need to install a local instance of Redis or have a remote instance available, for example in cloud. You can use the same Redis installation for developing multiple microservices. By default, each microservice will only consume messages from a Redis list named after the microservice. For local Redis installation:
    - [Download and install Redis](https://redis.io/download) or [run Redis in a container](https://hub.docker.com/_/redis)
