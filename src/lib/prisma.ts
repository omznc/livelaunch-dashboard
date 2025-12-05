import "server-only";

import { PrismaClient } from "@generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import env from "../env";

const connectionUrl = new URL(env.DATABASE_URL);

const prismaClientSingleton = () => {
	const adapter = new PrismaMariaDb({
		host: connectionUrl.hostname,
		port: Number.parseInt(connectionUrl.port ?? "3306", 10),
		user: connectionUrl.username,
		password: connectionUrl.password,
		database: connectionUrl.pathname.slice(1),
	});
	return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

/*global globalThis*/
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
