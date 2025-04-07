# Cryptocurrency Trading System

A Node.js TypeScript application that handles cryptocurrency trading orders with MySQL database and Confluent Kafka integration.

## Features

- Place buy/sell orders for cryptocurrencies
- Process orders via Kafka to update user balances
- RESTful API for order creation
- MySQL database for data persistence

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Confluent Kafka or Kafka (with zookeeper)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/crypto-trading-system.git
cd crypto-trading-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL database

Run the SQL script in `database/schema.sql` to create the required tables:

```bash
mysql -u your_username -p < database/schema.sql
```

Or run the SQL commands manually in your MySQL client:

```sql
CREATE DATABASE crypto_trading;
USE crypto_trading;

CREATE TABLE Balances (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    currency_symbol VARCHAR(10) NOT NULL,
    balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
    UNIQUE KEY unique_user_currency (user_id, currency_symbol)
);

CREATE TABLE Orders (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_type ENUM('buy', 'sell') NOT NULL,
    currency_symbol VARCHAR(10) NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    status ENUM('open', 'closed', 'cancelled') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=crypto_trading
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=orders
PORT=3000
```

### 5. Set up Confluent Kafka Cloud

Create a cluster and topic in [Confluent Cloud](https://confluent.cloud/). Update the `KAFKA_BROKERS` and `KAFKA_TOPIC` variables in the `.env` file accordingly.

### 6. Build and run the application

Build the TypeScript code:

```bash
npm run build
```

Start the API server:

```bash
npm start
```

In a separate terminal, start the Kafka consumer:

```bash
npm run consumer
```

## API Endpoints

### Place an Order

```
POST /api/orders
```

Request body:

```json
{
  "user_id": 1,
  "order_type": "buy",
  "currency_symbol": "BTC",
  "price": 5.123456,
  "quantity": 2.5
}
```

Response:

```json
{
  "Id": 1,
  "user_id": 1,
  "order_type": "buy",
  "currency_symbol": "BTC",
  "price": 5.123456,
  "quantity": 2.5,
  "status": "open"
}
```

## Testing the Application

1. Start the API server and Kafka consumer
2. Use tools like Postman or curl to send requests to the API
3. Check the MySQL database to verify that orders are being created and balances are being updated

Example curl command:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "order_type": "buy", "currency_symbol": "BTC", "price": 5.123456, "quantity": 2.5}'
```

## Demo Video

[Link to your demo video showing the system in action]

## Project Structure

```
crypto-trading/
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── kafka.ts
│   ├── models/
│   │   ├── balance.ts
│   │   └── order.ts
│   ├── services/
│   │   ├── orderService.ts
│   │   └── balanceService.ts
│   ├── controllers/
│   │   └── orderController.ts
│   ├── kafka/
│   │   ├── producer.ts
│   │   └── consumer.ts
│   ├── routes/
│   │   └── orderRoutes.ts
│   └── app.ts
├── package.json
├── tsconfig.json
├── .env
└── README.md
```
