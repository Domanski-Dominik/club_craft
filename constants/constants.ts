export const constants = {
	paymentLinks: {
		subscription100:
			process.env.NODE_ENV === "development"
				? "https://buy.stripe.com/test_14k01S0ssgfKdUc28a"
				: "",
	},
	customerBillingManage:
		process.env.NODE_ENV === "development"
			? "https://billing.stripe.com/p/login/test_8wM15abDZ6tmcAobII"
			: "",
	success_url:
		process.env.NODE_ENV === "development"
			? "http://localhost:3000/settings/success?session_id={CHECKOUT_SESSION_ID}"
			: "https://clubcraft.pl/settings",
	cancel_url:
		process.env.NODE_ENV === "development"
			? "http://localhost:3000/settings"
			: "https://clubcraft.pl/settings",
};
