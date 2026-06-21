import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_DB_PRIMARY_KEY!,
});

export const ardalinkDb = client.database("ardalink");
