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
};
