import "server-only";

import { PrismaClient } from "@generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import env from "../env";

const connectionUrl = new URL(env.DATABASE_URL);

const prismaClientSingleton = () => {
	const adapter = new PrismaMariaDb({
		host: connectionUrl.hostname,
		// A URL without a port gives "", so ?? would not reach the default.
		port: Number.parseInt(connectionUrl.port || "3306", 10),
		user: connectionUrl.username,
		password: connectionUrl.password,
		database: connectionUrl.pathname.slice(1),
		// Same as the driver defaults, set here so the limits are visible.
		connectionLimit: 10,
		acquireTimeout: 10_000,
	});
	return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

/*global globalThis*/
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined;
};

// Keep the client on globalThis in production too: separate bundles must share one pool.
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
globalForPrisma.prisma = prisma;
