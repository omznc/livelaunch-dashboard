"use client";

import { ToastBar, Toaster } from "react-hot-toast";

const box = {
	background: "var(--panel)",
	color: "var(--fg)",
	border: "1px solid var(--line2)",
	borderRadius: 0,
	boxShadow: "none",
	padding: "8px 12px",
	maxWidth: "min(360px, calc(100vw - 32px))",
	fontFamily: "var(--font-mono)",
	fontSize: "12.5px",
	lineHeight: "18px",
} as const;

// The default toast is a white rounded box. This one uses the page tokens and the page motion.
export default function StyledToaster() {
	return (
		<Toaster
			position="bottom-right"
			toastOptions={{
				style: box,
				success: { iconTheme: { primary: "var(--green)", secondary: "var(--bg)" } },
				error: { iconTheme: { primary: "var(--red)", secondary: "var(--bg)" } },
				loading: { iconTheme: { primary: "var(--brand)", secondary: "var(--line2)" } },
			}}
		>
			{(t) => (
				<ToastBar
					toast={t}
					style={{
						animation: `${t.visible ? "ll-toast-in" : "ll-toast-out"} ${t.visible ? "var(--dur-spring) var(--spring)" : "var(--dur-exit) var(--ease-in)"} forwards`,
					}}
				/>
			)}
		</Toaster>
	);
}
