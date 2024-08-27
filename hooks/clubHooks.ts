import { useMutation } from "@tanstack/react-query";

const updateClub = async (info: any) => {
  //console.log(info);
  return fetch(`/api/club/${info.userId}/${info.clubId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber: info.phoneNumber,
      optionGroup: info.optionGroup,
      optionSolo: info.optionSolo,
      optionOneTime: info.optionOneTime,
      paymentCyclic: info.paymentCyclic,
      paymentGroup: info.paymentGroup,
      paymentOneTime: info.paymentOneTime,
      paymentSolo: info.paymentSolo,
      replacment: info.replacment,
      switchGroup: info.switchGroup,
      switchOneTime: info.switchOneTime,
      switchSolo: info.switchSolo,
      workOut: info.workOut,
      coachPayments: info.coachPayments,
      coachEditPrt: info.coachEditPrt,
      coachNewPrt: info.coachNewPrt,
    }), // Przekaż zaktualizowane dane uczestnika
  }).then((res) => res.json());
};
export const useUpdateClub = () => {
  return useMutation({ mutationFn: updateClub });
};
