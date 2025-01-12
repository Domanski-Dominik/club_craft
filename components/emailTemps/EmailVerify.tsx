import * as React from "react";

interface VerifyEmailTemplateProps {
	email: string;
	verifyEmailToken: string;
}

export const VerifyEmailTemplate: React.FC<
	Readonly<VerifyEmailTemplateProps>
> = ({ email, verifyEmailToken }) => (
	<div
		style={{
			fontFamily: "Arial, sans-serif",
			color: "#333",
			padding: "20px",
		}}>
		<h1
			style={{
				color: "#4CAF50",
				fontSize: "24px",
				marginBottom: "10px",
			}}>
			Zweryfikuj <b>{email}</b>!
		</h1>
		<p style={{ fontSize: "16px", marginBottom: "15px" }}>
			Aby zweryfikować swój email, kliknij w poniższy link i podążaj za
			instrukcją:
		</p>
		<a
			href={`https://www.clubcrafts.pl/register/verify/${verifyEmailToken}`}
			style={{
				display: "inline-block",
				padding: "10px 15px",
				backgroundColor: "#4CAF50",
				color: "#fff",
				textDecoration: "none",
				borderRadius: "5px",
			}}>
			Kliknij tutaj, aby zweryfikować email
		</a>
		<footer
			style={{
				fontSize: "14px",
				color: "#777",
				borderTop: "1px solid #ddd",
				marginTop: "20px",
				paddingTop: "10px",
			}}>
			Pozdrawiamy,
			<br />
			Zespół ClubCraft
		</footer>
	</div>
);
