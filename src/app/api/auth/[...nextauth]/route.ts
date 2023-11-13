import NextAuth from 'next-auth';
import { AxiomRequest, withAxiom } from 'next-axiom';
import authOptions from '@app/api/auth/[...nextauth]/authOptions';

const handler = NextAuth(authOptions);

export const GET = withAxiom(
	async (req: AxiomRequest, res) => await handler(req, res)
);

export const POST = withAxiom(
	async (req: AxiomRequest, res) => await handler(req, res)
);
