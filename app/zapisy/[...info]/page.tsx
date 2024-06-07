import React from "react";
interface Props {
	params: {
		info: [string, string, string];
	};
}
const page = ({ params }: Props) => {
	const clubName = params.info[0];
	const season1 = params.info[1];
	const season2 = params.info[2];
	return (
		<div>
			{clubName}
			{season1}/{season2}
		</div>
	);
};

export default page;
