import { CosmosClient, Container } from "@azure/cosmos";
import https from "https";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DATABASE ?? "tjhub";
const containerId = process.env.COSMOS_CONTAINER ?? "todos";

// CosmosDB emulator uses a self-signed certificate — disable TLS verification for localhost
const isEmulator = !!endpoint && (endpoint.includes("localhost") || endpoint.includes("127.0.0.1"));
const agent = isEmulator ? new https.Agent({ rejectUnauthorized: false }) : undefined;

let client: CosmosClient | null = null;

function getClient(): CosmosClient {
  if (!client) {
    client = new CosmosClient({ endpoint, key, agent });
  }
  return client;
}

export async function getContainer(): Promise<Container> {
  const c = getClient();
  const { database } = await c.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ["/id"] },
  });
  return container;
}
