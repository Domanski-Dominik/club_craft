import * as React from "react";

interface VerifyEmailTemplateProps {
	email: string;
	verifyEmailToken: string;
}

export const VerifyEmailTemplate: React.FC<
	Readonly<VerifyEmailTemplateProps>
> = ({ email, verifyEmailToken }) => (
	<div>
		<h1>
			ZZweryfikuj <b>{email}</b>!
		</h1>
		<p>
			Żeby zweryfikować email, kliknij w link poniżej i podążaj za instrukcją
		</p>
		<a href={`https://www.clubcraft.pl/register/verify/${verifyEmailToken}`}>
			Kliknij tu by zweryfikować email!
		</a>
	</div>
);
