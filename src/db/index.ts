import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Pass the connection string directly to drizzle() — the neon-http adapter
// manages the @neondatabase/serverless client internally, which is required
// for compatibility with @neondatabase/serverless v1.x (breaking API change).
export const db = drizzle(process.env.DATABASE_URL!, { schema });
