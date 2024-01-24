import * as React from "react";

interface ResetPasswordEmailTemplateProps {
	email: string;
	resetPasswordToken: string;
}

export const ResetPasswordEmailTemplate: React.FC<
	Readonly<ResetPasswordEmailTemplateProps>
> = ({ email, resetPasswordToken }) => (
	<div>
		<h1>
			Zresetuj hasło dla <b>{email}</b>!
		</h1>
		<p>Żeby zresetować hasło, kliknij w link poniżej i podążaj za instrukcją</p>
		<a href={`https://www.clubcraft.pl/reset?token=${resetPasswordToken}`}>
			Kliknij tu by zresetować hasło!
		</a>
	</div>
);
