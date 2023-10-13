import { DefaultUser } from 'next-auth';
import { Account, User as PrismaUser } from '@prisma/client';

interface IUser extends DefaultUser, PrismaUser {}

declare module 'next-auth' {
	interface User extends IUser {}

	interface Session {
		user: User | null | undefined;
		account: Account | null | undefined;
	}

	interface Profile {
		email_verified?: boolean;
		email?: string;
	}
}
