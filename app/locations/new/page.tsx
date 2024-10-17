import LocForm from "@/components/forms/LocForm";
import { Location } from "@/types/type";
import { auth } from "@/auth";
import Loading from "@/context/Loading";

const CreateLoc = async () => {
	const session = await auth();
	const CreateLoc: Location = {
		id: 0,
		name: "",
		street: "",
		city: "",
		postalCode: "",
		streetNr: "",
		club: "",
	};
	if (session) {
		return (
			<LocForm
				locInfo={CreateLoc}
				type={"create"}
			/>
		);
	} else {
		return <Loading />;
	}
};

export default CreateLoc;
