import { useMutation } from "@tanstack/react-query";

const addGroup = async (info: any) => {
	//console.log(info);
	return fetch(`/api/coaches/${info.club}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			coachId: info.coachId,
			groupId: info.groupId,
		}), // Przekaż zaktualizowane dane uczestnika
	}).then((res) => res.json());
};
export const useAddGroupCoach = () => {
	return useMutation({ mutationFn: addGroup });
};
const deleteGroup = async (info: any) => {
	//console.log(info);
	return fetch(`/api/coaches/${info.club}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			coachId: info.coachId,
			groupId: info.groupId,
		}), // Przekaż zaktualizowane dane uczestnika
	}).then((res) => res.json());
};
export const usedeleteGroupCoach = () => {
	return useMutation({ mutationFn: deleteGroup });
};
const editGroup = async (info: any) => {
	//console.log(info);
	return fetch(`/api/coaches/${info.club}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			coachId: info.coachId,
			groupIdToRemove: info.groupIdToRemove,
			groupIdToAdd: info.groupIdToAdd,
		}), // Przekaż zaktualizowane dane uczestnika
	}).then((res) => res.json());
};
export const useEditGroupCoach = () => {
	return useMutation({ mutationFn: editGroup });
};
const changeRole = async (info: any) => {
	return fetch("/api/user/admin", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			userId: info.userId,
			role: info.role,
		}),
	}).then((res) => res.json());
};
export const useChangeRole = () => {
	return useMutation({ mutationFn: changeRole });
};
