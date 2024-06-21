import { useMutation } from "@tanstack/react-query";

const updateAttendance = async (info: any) => {
	//console.log(info);
	return fetch(
		`/api/participant/presence/${info.groupId}/${info.participantId}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				date: info.date,
				isChecked: info.isChecked,
				dateToRemove: info.dateToRemove,
			}), // Przekaż zaktualizowane dane uczestnika
		}
	).then((res) => res.json());
};
export const useAttendance = () => {
	return useMutation({ mutationFn: updateAttendance });
};
const addPayment = async (info: any) => {
	//console.log(info);
	return fetch(`/api/participant/payment/${info.participantId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			form: info.form,
			action: info.action,
		}),
	}).then((res) => res.json());
};
export const usePayment = () => {
	return useMutation({ mutationFn: addPayment });
};
const updateParticipant = async (info: any) => {
	//console.log(info);
	return fetch(`/api/participant/${info.newRowId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(info.updatedRow), // Przekaż zaktualizowane dane uczestnika
	}).then((res) => res.json());
};
export const useUpdatePrt = () => {
	return useMutation({ mutationFn: updateParticipant });
};
const deleteParticipant = async (info: any) => {
	//console.log(info);
	return fetch(`/api/participant/${info.id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(info.selectedRow),
	}).then((res) => res.json());
};
export const useDeletePrt = () => {
	return useMutation({ mutationFn: deleteParticipant });
};

const updateParticpantGroup = async (info: any) => {
	//console.log(info);
	return fetch("/api/participant/groups", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			participantId: info.participantId,
			groupId: info.groupId,
		}),
	}).then((res) => res.json());
};
export const useUpdatePrtGr = () => {
	return useMutation({ mutationFn: updateParticpantGroup });
};

const deleteParticipantGr = async (info: any) => {
	//console.log(info);
	return fetch("/api/participant/groups", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			participantId: info.participantId,
			groupId: info.groupId,
		}),
	}).then((res) => res.json());
};
export const useDeletePrtGr = () => {
	return useMutation({ mutationFn: deleteParticipantGr });
};

const editParticipantGr = async (info: any) => {
	//console.log(info);
	return fetch("/api/participant/groups", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			participantId: info.participantId,
			groupIdToRemove: info.groupIdToRemove,
			groupIdToAdd: info.groupToAdd,
		}),
	}).then((res) => res.json());
};
export const useEditPrtGr = () => {
	return useMutation({ mutationFn: editParticipantGr });
};
