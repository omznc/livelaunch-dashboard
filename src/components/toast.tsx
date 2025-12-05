"use client";

import dynamic from "next/dynamic";

const Toast = dynamic(() => import("react-hot-toast").then((c) => c.Toaster), {
	ssr: false,
});

export default Toast;
