import { EmailTemplate } from "@/components/emailTemps/emailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
	try {
		const { data, error } = await resend.emails.send({
			from: "Club Craft <weryfikacja@clubcraft.pl>",
			to: ["domanbuty@gmail.com"],
			subject: "Hello world",
			react: EmailTemplate({ firstName: "Dominik" }) as React.ReactElement,
		});

		if (error) {
			return Response.json({ error });
		}

		return Response.json({ data });
	} catch (error) {
		return Response.json({ error });
	}
}
