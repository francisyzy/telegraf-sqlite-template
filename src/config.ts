import * as dotenv from "dotenv";

dotenv.config();

const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  API_TOKEN: process.env.API_TOKEN,
  LOG_GROUPID: process.env.LOG_GROUPID,
  URL: process.env.URL,
};

export default config;
