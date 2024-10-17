export const handleResult = (
	result: PromiseSettledResult<any>,
	name: string
) => {
	if (
		result.status === "fulfilled" &&
		result.value !== undefined &&
		!result.value.error
	) {
		// Obsługa zakończonej sukcesem obietnicy
		return result.value;
	} else if (result.status === "rejected") {
		// Obsługa odrzuconej obietnicy
		console.error(`${name} failed with error: `, result.reason);
	} else {
		// Obsługa przypadku, gdy value jest undefined lub zawiera error
		console.error(
			`${name} returned invalid data or error: `,
			result.value?.error || "undefined"
		);
	}
	return null; // Zwraca null w przypadku błędu
};
