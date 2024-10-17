import LocForm from "@/components/forms/LocForm";
import StandardError from "@/components/errors/Standard";
import { getSpecificLoc } from "@/server/loc-action";

interface Props {
	params: {
		id: string;
	};
}

const EditLoc = async ({ params }: Props) => {
	const loc = await getSpecificLoc(parseInt(params.id, 10));
	if (!loc || "error" in loc)
		return (
			<StandardError
				addParticipants={false}
				message={
					loc ? String(loc.error) : "Nie znaleziono lokalizacji o podanym id"
				}
			/>
		);
	return (
		<LocForm
			locInfo={loc}
			type={"edit"}
		/>
	);
};

export default EditLoc;
