
# SomaTekAI Backend

SomaTekAI Backend is a Spring Boot application designed to provide robust services with MariaDB and MongoDB as the databases. This project is containerized using Docker for simplified deployment and scalability.

---

## Prerequisites

Before running the project, ensure you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository_url>
```

### 2. Build the Spring Boot Application
Ensure you have [Maven](https://maven.apache.org/) installed to build the project:
```bash
mvn clean install
```

The generated JAR file will be located in the `target` directory.

---

## Running the Application

### 1. Using Docker Compose
Docker Compose is configured to spin up the following services:
- **MariaDB**: A relational database for storing structured data.
- **MongoDB**: A NoSQL database for handling unstructured data.
- **Spring Boot App**: The backend application.

Run the following command to start all services:
```bash
docker-compose up --build
```

### 2. Verifying the Setup

#### MariaDB
- **Port**: `3306`
- **Default Database**: `somatek`
- **Username**: `root`
- **Password**: `root`
- Verify using:
  ```bash
  docker exec -it mariadb mysql -uroot -proot
  SHOW DATABASES;
  ```

#### MongoDB
- **Port**: `27018`
- Verify using:
  ```bash
  docker exec -it mongo mongo
  show dbs;
  ```

#### Spring Boot App
- **Port**: `8080`
- Verify using:
  ```bash
  curl http://localhost:8080/actuator/health
  ```

---

## Application Configuration

Update the database connection properties if necessary in the `application.properties` file:

```bash
spring.datasource.url=jdbc:mariadb://localhost:3306/somatekai-backend
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=update
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.open-in-view=false
```

For MongoDB, ensure your application uses the correct connection URI:
```bash
#Mongo
spring.data.mongodb.database=Somatek
spring.data.mongodb.uri=mongodb://localhost:27017/
```


