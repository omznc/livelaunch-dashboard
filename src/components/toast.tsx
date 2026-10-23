"use client";

import dynamic from "next/dynamic";

const Toast = dynamic(() => import("./toaster"), {
	ssr: false,
});

export default Toast;
