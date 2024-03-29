import { useMutation } from "@tanstack/react-query";

const updateGroup = async (info: any) => {
	//console.log(info);
	return fetch("/api/loc/gr", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(info), // Przekaż zaktualizowane dane groupy
	}).then((res) => res.json());
};
export const useUpdateGroup = () => {
	return useMutation({ mutationFn: updateGroup });
};
const deleteGroup = async (info: any) => {
	//console.log(info);
	return fetch("/api/loc/gr", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(info), // Przekaż dane grupy do usunięcia
	}).then((res) => res.json());
};
export const useDeleteGroup = () => {
	return useMutation({ mutationFn: deleteGroup });
};

const addGroup = async (info: any) => {
	//console.log(info);
	return fetch("/api/loc/gr", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(info), // Przekaż dane grupy do usunięcia
	}).then((res) => res.json());
};
export const useAddGroup = () => {
	return useMutation({ mutationFn: addGroup });
};
