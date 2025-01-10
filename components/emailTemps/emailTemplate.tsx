import * as React from "react";

interface EmailTemplateProps {
	firstName: string;
	lastName: string;
	clubName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
	firstName,
	lastName,
	clubName,
}) => (
	<div
		style={{ fontFamily: "Arial, sans-serif", color: "#333", padding: "20px" }}>
		<h1 style={{ color: "#4CAF50", fontSize: "24px", marginBottom: "10px" }}>
			Dzień dobry, {firstName}!
		</h1>
		<p style={{ fontSize: "16px", marginBottom: "15px" }}>
			Twój formularz zapisu na zajęcia został pomyślnie przesłany do{" "}
			<strong>{clubName}</strong>.
		</p>
		<p style={{ fontSize: "16px", marginBottom: "15px" }}>
			Otrzymasz informację zwrotną, gdy klub podejmie decyzję dotyczącą zapisu
			do grupy.
		</p>
		<p style={{ fontSize: "16px", marginBottom: "15px", fontWeight: "bold" }}>
			Życzymy Ci miłego dnia!
		</p>
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
