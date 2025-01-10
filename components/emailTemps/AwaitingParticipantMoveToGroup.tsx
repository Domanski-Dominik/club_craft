import * as React from "react";

interface MoveToGroupEmailTemplateProps {
	firstName: string;
	lastName: string;
	clubName: string;
	groupName: string;
	terms: string[];
	acceptLink: string;
	rejectLink: string;
	childFirstName: string;
	childLastName: string;
}

export const MoveToGroupEmailTemplate: React.FC<
	Readonly<MoveToGroupEmailTemplateProps>
> = ({
	firstName,
	lastName,
	clubName,
	groupName,
	terms,
	acceptLink,
	rejectLink,
	childFirstName,
	childLastName,
}) => (
	<div
		style={{ fontFamily: "Arial, sans-serif", color: "#333", padding: "20px" }}>
		<h1 style={{ color: "#4CAF50", fontSize: "24px", marginBottom: "10px" }}>
			Dzień dobry, {firstName}!
		</h1>
		<p style={{ fontSize: "16px", marginBottom: "15px" }}>
			{childFirstName} {childLastName} został/a przeniesiony/a do nowej grupy w{" "}
			<strong>{clubName}</strong>.
		</p>
		<p style={{ fontSize: "16px", marginBottom: "15px" }}>
			<strong>Nazwa grupy:</strong> {groupName}
		</p>
		<p style={{ fontSize: "16px", marginBottom: "15px" }}>
			<strong>Terminy zajęć:</strong>
		</p>
		<ul style={{ fontSize: "16px", marginBottom: "15px", paddingLeft: "20px" }}>
			{terms.map((term, index) => (
				<li key={index}>{term}</li>
			))}
		</ul>
		<p style={{ fontSize: "16px", marginBottom: "15px" }}>
			Możesz zaakceptować lub odrzucić przeniesienie klikając w odpowiedni link
			poniżej:
		</p>
		<div style={{ marginBottom: "15px" }}>
			<a
				href={acceptLink}
				style={{
					padding: "10px 15px",
					backgroundColor: "#4CAF50",
					color: "#fff",
					textDecoration: "none",
					marginRight: "10px",
					borderRadius: "5px",
				}}>
				Akceptuj
			</a>
			<a
				href={rejectLink}
				style={{
					padding: "10px 15px",
					backgroundColor: "#F44336",
					color: "#fff",
					textDecoration: "none",
					borderRadius: "5px",
				}}>
				Odrzuć
			</a>
		</div>
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
