import Register from "@/context/Register";

interface Props {
	params: Promise<{
		club: string;
	}>;
}

const page = async ({ params }: Props) => {
	return <Register club={(await params).club} />;
};

export default page;
