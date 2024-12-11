const { Client } = require("pg");

const waitForDatabase = async () => {
  const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  let retries = 5;
  while (retries) {
    try {
      await client.connect();
      console.log("Database is ready!");
      await client.end();
      break;
    } catch (err) {
      console.log("Database not ready, retrying...");
      retries -= 1;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  if (!retries) {
    console.log("Could not connect to the database.");
    process.exit(1);
  }
};

waitForDatabase();