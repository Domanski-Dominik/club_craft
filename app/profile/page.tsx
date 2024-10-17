import { auth } from "@/auth";
import { User } from "@/context/User";
const ProfilPage = async () => {
	const session = await auth();
	if (session) return <User id={session?.user.id} />;
};

export default ProfilPage;
