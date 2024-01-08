import Register from "@/context/Register";

interface Props {
	params: {
		club: string;
	};
}

const page = ({ params }: Props) => {
	return <Register club={params.club} />;
};

export default page;
