import "server-only";

import { auth } from "@lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

// One session lookup for each request. The result never outlives the request.
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
