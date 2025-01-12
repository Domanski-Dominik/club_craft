import * as React from "react";

interface ResetPasswordEmailTemplateProps {
	email: string;
	resetPasswordToken: string;
}

export const ResetPasswordEmailTemplate: React.FC<
	Readonly<ResetPasswordEmailTemplateProps>
> = ({ email, resetPasswordToken }) => (
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
			Zresetuj hasło dla <b>{email}</b>!
		</h1>
		<p style={{ fontSize: "16px", marginBottom: "15px" }}>
			Aby zresetować hasło, kliknij w poniższy link i podążaj za instrukcją:
		</p>
		<a
			href={`https://www.clubcrafts.pl/reset/${resetPasswordToken}`}
			style={{
				display: "inline-block",
				padding: "10px 15px",
				backgroundColor: "#4CAF50",
				color: "#fff",
				textDecoration: "none",
				borderRadius: "5px",
			}}>
			Kliknij tutaj, aby zresetować hasło
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
