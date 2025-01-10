"use server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";
import { Session } from "next-auth";

export const getHomeInfo = async (session: Session | null) => {
	if (session) {
		try {
			if (session.user.role === "owner") {
				const loc = await prisma.locations.count({
					where: { club: session.user.club },
				});
				const groups = await prisma.group.count({
					where: { club: session.user.club },
				});
				const participants = await prisma.participant.count({
					where: { club: session.user.club },
				});
				const coaches = await prisma.user.count({
					where: { club: session.user.club, role: "coach" },
				});
				return { loc, groups, participants, coaches, role: session.user.role };
			}
			if (session.user.role === "coach") {
				const info = await prisma.groupcoach.findMany({
					where: { userId: session.user.id },
					include: {
						group: {
							include: {
								locationschedule: {
									include: { locations: true },
								},
								participantgroup: {
									include: { participant: true },
								},
							},
						},
					},
				});
				const uniqueLocations = new Map<number, any>(); // Mapa, gdzie klucz to id lokalizacji
				const uniqueGroups = new Map<number, any>(); // Mapa, gdzie klucz to id grupy
				const uniqueParticipants = new Map<number, any>(); // Mapa, gdzie klucz to id uczestnika

				info.forEach((item) => {
					const { group } = item;
					if (group) {
						// Dodaj lokalizację do mapy unikalnych lokalizacji
						const locationId = group.locationschedule?.[0]?.locations?.id;
						if (locationId && !uniqueLocations.has(locationId)) {
							uniqueLocations.set(
								locationId,
								group.locationschedule?.[0]?.locations
							);
						}

						// Dodaj grupę do mapy unikalnych grup
						const groupId = group.id;
						if (groupId && !uniqueGroups.has(groupId)) {
							uniqueGroups.set(groupId, group);
						}

						// Dodaj uczestników do mapy unikalnych uczestników
						const participants = group.participantgroup?.map(
							(participantGroup) => participantGroup.participant
						);
						if (participants) {
							participants.forEach((participant) => {
								const participantId = participant.id;
								if (participantId && !uniqueParticipants.has(participantId)) {
									uniqueParticipants.set(participantId, participant);
								}
							});
						}
					}
				});
				return {
					loc: uniqueLocations.size,
					groups: uniqueGroups.size,
					participants: uniqueParticipants.size,
					coaches: 0,
					role: session.user.role,
				};
			}
		} catch (error) {
			return { error: "Coś poszło nie tak" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getCalendarGroups = async (session: Session | null) => {
	if (session) {
		try {
			if (session.user.role === "owner") {
				const groups = await prisma.group.findMany({
					where: { club: session.user.club },
					include: {
						locationschedule: { include: { locations: true } },
						terms: { include: { location: true } },
						breaks: true,
						participantgroup: { include: { participant: true } },
						coaches: { include: { user: true } },
					},
				});
				if (!groups) return { error: "Nie udało się pobrać danych" };

				const formatedgroups = groups.map((g) => {
					const participants = g.participantgroup.map((p) => p.participant);
					const coachesformat = g.coaches.map((c) => c.user);
					return {
						...g,
						participantgroup: participants,
						coaches: coachesformat,
					};
				});
				return formatedgroups;
			}
			if (session.user.role === "coach") {
				const access = await prisma.groupcoach.findMany({
					where: { userId: session.user.id },
					include: {
						group: {
							include: {
								locationschedule: {
									include: { locations: true },
								},
								terms: { include: { location: true } },
								breaks: true,
							},
						},
					},
				});
				// Wyodrębnienie grup z dostępów trenera
				const groups = access.map((item) => item.group);

				if (!groups || groups.length === 0) {
					return { error: "Nie udało się pobrać danych" };
				}

				// Formatowanie grup
				const formatedgroups = groups.map((g) => {
					const locs = g.locationschedule.map((schedule) => ({
						id: schedule.locations.id,
						name: schedule.locations.name,
					}));
					return {
						...g,
						locationschedule: locs,
					};
				});

				return formatedgroups;
			}
		} catch (error) {
			console.error("Błąd podczas pobierania danych:", error);
			return { error: "Nie znaleziono danych" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getLocs = async (session: Session | null) => {
	if (session) {
		if (session.user.role === "owner") {
			try {
				const Loc = await prisma.locations.findMany({
					where: { club: session.user.club },
				});
				if (!Loc)
					return {
						error:
							"Nie udało się pobrać lokalizacji, sprawdź połączenie z internetem",
					};
				return Loc;
			} catch (error) {
				console.error("Błąd podczas pobierania lokalizacji:", error);
				return { error: "Nie znaleziono lokalizacji" };
			}
		}
		if (session.user.role === "coach") {
			try {
				const access = await prisma.groupcoach.findMany({
					where: { userId: session.user.id },
					include: {
						group: {
							include: { locationschedule: { include: { locations: true } } },
						},
					},
				});
				if (!access)
					return {
						error:
							"Nie udało się pobrać lokalizacji, sprawdź połączenie z internetem",
					};
				if (access.length === 0) {
					return { error: "Nie zostały ci przypisane jeszcze żadne grupy" };
				}
				const uniqueLocationIds = new Set<number>();
				const uniqueLocations: any[] = [];

				access.forEach((item) => {
					const { group } = item;
					if (group && group.locationschedule) {
						group.locationschedule.forEach((schedule) => {
							const { locations } = schedule;
							if (locations) {
								// Sprawdź, czy locations to pojedynczy obiekt
								if (Array.isArray(locations)) {
									locations.forEach((location) => {
										const { id } = location;
										if (typeof id === "number") {
											uniqueLocationIds.add(id);
										}
									});
								} else {
									const { id } = locations;
									if (typeof id === "number") {
										uniqueLocationIds.add(id);
									}
								}
							}
						});
					}
				});

				// Pobierz pełne dane lokalizacji na podstawie unikalnych identyfikatorów
				uniqueLocationIds.forEach((id) => {
					const locationDetails = access
						.map((item) => item.group?.locationschedule)
						.flat()
						.map((schedule) => schedule?.locations)
						.flat()
						.find((location) => location?.id === id);

					if (locationDetails) {
						uniqueLocations.push(locationDetails);
					}
				});

				return uniqueLocations;
			} catch (error) {
				console.error("Błąd podczas pobierania danych:", error);
				return { error: "Nie udało się pobrać danych" };
			}
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getLocsWithGroups = async (session: Session | null) => {
	if (session) {
		try {
			const locs = await prisma.locations.findMany({
				where: { club: session.user.club },
				include: {
					terms: {
						include: {
							group: {
								include: {
									terms: {
										include: {
											location: {
												select: { name: true },
											},
										},
									},
									breaks: true,
								},
							},
						},
					},
				},
			});
			if (!locs) return { error: "Nie znaleziono  lokalizacji" };

			const formattedLoc = locs.map((loc) => {
				const termsGroups = loc.terms.map((term) => term.group);
				const uniqueGroups = Array.from(
					new Map(termsGroups.map((group) => [group.id, group])).values()
				);
				return {
					...loc,
					groups: uniqueGroups,
				};
			});
			return formattedLoc;
		} catch (error) {
			console.error("Błąd podczas pobierania lokalizacji i grup:", error);
			return { error: "Nie znaleziono żadnych lokalizacji" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getClubInfo = async (session: Session | null) => {
	if (session) {
		try {
			const clubInfo = await prisma.club.findUnique({
				where: {
					name: session.user.club,
				},
				include: {
					clubconnect: {
						include: {
							user: true,
						},
					},
				},
			});
			if (!clubInfo)
				return { error: "Nie udało się pobrać informacji o klubie" };

			const formattedclubInfo = {
				...clubInfo,
				clubconnect: clubInfo.clubconnect.map((c) => c.user),
			};
			return formattedclubInfo;
		} catch (error) {
			console.error("Błąd podczas pobierania informacji o klubie:", error);
			return { error: "Błąd podczas pobierania informacji o klubie" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getCoaches = async (session: Session | null) => {
	if (session) {
		try {
			const coaches = await prisma.user.findMany({
				where: { club: session.user.club },
				include: {
					coachedGroups: {
						include: {
							group: {
								include: {
									locationschedule: {
										include: { locations: { select: { name: true } } },
									},
									terms: { include: { location: { select: { name: true } } } },
									breaks: true,
								},
							},
						},
					},
				},
			});
			if (!coaches) return { error: "Nie znaleziono trenerów" };

			const formatedCoaches = coaches.map((coach) => {
				const groups = coach.coachedGroups.map((gr) => {
					return {
						...gr.group,
					};
				});
				return {
					...coach,
					coachedGroups: groups,
				};
			});
			return formatedCoaches;
		} catch (error) {
			console.error("Błąd podczas pobierania danych o trenerach:", error);
			return { error: "Nie znaleziono danych o trenerach" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getCoachGroups = async (
	session: Session | null,
	coachId: string
) => {
	if (session) {
		if (coachId) {
			try {
				const groupIds = await prisma.groupcoach.findMany({
					where: { userId: coachId },
				});
				const formattedGroupIds = groupIds.map((gr) => gr.groupId);
				return formattedGroupIds;
			} catch (error) {
				console.error("Błąd podczas pobierania danych:", error);
				return { error: "Nie znaleziono danych" };
			}
		} else {
			return { error: "Brak id prowadzącego" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getAllParticipants = async (
	session: Session | null,
	coachId: string
) => {
	if (session) {
		try {
			if (session.user.role === "owner") {
				const allParticipants = await prisma.participant.findMany({
					where: {
						club: session.user.club,
					},
					include: {
						attendance: true,
						participantgroup: {
							include: {
								group: {
									include: {
										locationschedule: {
											include: {
												locations: {
													select: { name: true },
												},
											},
										},
										terms: {
											include: { location: { select: { name: true } } },
										},
										breaks: true,
									},
								},
							},
						},
						payments: {
							include: {
								payment: true,
							},
						},
					},
				});
				if (!allParticipants) return { error: "allParticipants nie istnieje" };

				const participants = allParticipants.map((object) => {
					const paymentsArray = object.payments.map((paymentParticipant) => ({
						id: paymentParticipant.payment.id,
						amount: paymentParticipant.payment.amount,
						description: paymentParticipant.payment.description,
						paymentDate: paymentParticipant.payment.paymentDate,
						paymentMethod: paymentParticipant.payment.paymentMethod,
						month: paymentParticipant.payment.month,
					}));
					const groups = object.participantgroup.map((gr) => {
						return {
							...gr.group,
						};
					});
					return {
						...object,
						payments: paymentsArray,
						participantgroup: groups,
					};
				});

				return participants;
			}
			if (session.user.role === "coach") {
				const accessedParticipants = await prisma.groupcoach.findMany({
					where: { userId: coachId },
					include: {
						group: {
							include: {
								participantgroup: {
									include: {
										participant: {
											include: {
												attendance: true,
												payments: {
													include: {
														payment: true,
													},
												},
												participantgroup: {
													include: {
														group: {
															include: {
																locationschedule: {
																	include: {
																		locations: {
																			select: { name: true },
																		},
																	},
																},
																terms: {
																	include: {
																		location: { select: { name: true } },
																	},
																},
																breaks: true,
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				});
				const uniqueParticipants = new Map<number, any>();

				accessedParticipants.forEach((item) => {
					const { group } = item;
					if (group) {
						const participants = group.participantgroup.map(
							(participantgroup) => participantgroup.participant
						);
						if (participants) {
							participants.forEach((participant) => {
								const participantId = participant.id;
								if (participantId && !uniqueParticipants.has(participantId)) {
									uniqueParticipants.set(participantId, participant);
								}
							});
						}
					}
				});
				const sortedParticipants = Array.from(uniqueParticipants.values());
				const participants = sortedParticipants.map((object) => {
					const paymentsArray = object.payments.map(
						(paymentParticipant: any) => ({
							id: paymentParticipant.payment.id,
							amount: paymentParticipant.payment.amount,
							description: paymentParticipant.payment.description,
							paymentDate: paymentParticipant.payment.paymentDate,
							paymentMethod: paymentParticipant.payment.paymentMethod,
							month: paymentParticipant.payment.month,
						})
					);
					const groups = object.participantgroup.map((gr: any) => {
						return {
							...gr.group,
						};
					});
					return {
						...object,
						payments: paymentsArray,
						participantgroup: groups,
					};
				});

				return participants;
			}
		} catch (error) {
			console.error("Błąd podczas pobierania danych:", error);
			return { error: "Błąd podczas pobierania uczestników" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getGroupById = async (id: number, session: Session | null) => {
	if (session) {
		try {
			const findGroup = await prisma.group.findUnique({
				where: {
					id: id,
				},
				include: {
					locationschedule: {
						include: {
							locations: true,
						},
					},
					terms: true,
					breaks: true,
					coaches: true,
				},
			});

			if (!findGroup) {
				return { error: "Nie znaleziono grupy o podanym ID" };
			}
			const group = {
				id: findGroup.id,
				name: findGroup.name,
				locationName: findGroup.locationschedule.map((l) => l.locations.name),
				locationId: findGroup.locationschedule.map((l) => l.locationId),
				club: findGroup.club,
				prtCount: findGroup.participantCount,
				signInfo: findGroup.signInfo,
				firstLesson: findGroup.firstLesson,
				lastLesson: findGroup.lastLesson,
				breaks: findGroup.breaks,
				terms: findGroup.terms,
				price: findGroup.price,
				payOption: findGroup.payOption,
				clientsPay: findGroup.clientsPay,
				xClasses: findGroup.xClass,
				type: findGroup.type,
				color: findGroup.color,
				coachId:
					findGroup.coaches.length > 0 ? findGroup.coaches[0].userId : "",
			};
			//console.log(group);
			return group;
		} catch (error) {
			console.error("Błąd podczas pobierania grupy:", error);
			return { error: "Błąd przy pobieraniu danych o grupie" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getSignInGroups = async (clubName: string) => {
	try {
		const groups = await prisma.group.findMany({
			where: { club: clubName, signin: true },
			include: {
				locationschedule: { include: { locations: true } },
				terms: { include: { location: true } },
				breaks: true,
				participantgroup: { include: { participant: true } },
				coaches: { include: { user: true } },
			},
		});
		if (!groups) return { error: "Nie udało się pobrać danych" };

		const formatedgroups = groups.map((g) => {
			const participants = g.participantgroup.map((p) => p.participant);
			const coachesformat = g.coaches.map((c) => c.user);
			return {
				...g,
				participantgroup: participants,
				coaches: coachesformat,
			};
		});
		return formatedgroups;
	} catch (error) {
		console.error("Błąd podczas pobierania danych:", error);
		return { error: "Nie znaleziono danych" };
	}
};
export const getLocsForSignIn = async (clubName: string) => {
	try {
		const Loc = await prisma.locations.findMany({
			where: { club: clubName },
		});
		if (!Loc)
			return {
				error:
					"Nie udało się pobrać lokalizacji, sprawdź połączenie z internetem",
			};
		return Loc;
	} catch (error) {
		console.error("Błąd podczas pobierania lokalizacji:", error);
		return { error: "Nie znaleziono lokalizacji" };
	}
};
export const getAllParticipantsWorkout = async (session: Session | null) => {
	if (session) {
		try {
			const allParticipants = await prisma.participant.findMany({
				where: {
					club: session.user.club,
				},
				include: {
					attendance: true,
					participantgroup: {
						include: {
							group: {
								include: {
									locationschedule: {
										include: {
											locations: {
												select: { name: true },
											},
										},
									},
									terms: {
										include: { location: { select: { name: true } } },
									},
									breaks: true,
								},
							},
						},
					},
					payments: {
						include: {
							payment: true,
						},
					},
				},
			});
			if (!allParticipants) return { error: "Nie znaleziono uczestników" };

			const participants = allParticipants.map((object) => {
				const paymentsArray = object.payments.map((paymentParticipant) => ({
					id: paymentParticipant.payment.id,
					amount: paymentParticipant.payment.amount,
					description: paymentParticipant.payment.description,
					paymentDate: paymentParticipant.payment.paymentDate,
					paymentMethod: paymentParticipant.payment.paymentMethod,
					month: paymentParticipant.payment.month,
				}));
				const groups = object.participantgroup.map((gr) => {
					return {
						...gr.group,
					};
				});
				return {
					...object,
					payments: paymentsArray,
					participantgroup: groups,
				};
			});

			return participants;
		} catch (error) {
			console.error("Błąd podczas pobierania danych:", error);
			return { error: "Błąd podczas pobierania uczestników" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};
export const getClubInfoSignin = async (club: string) => {
	try {
		const clubInfo = await prisma.club.findUnique({
			where: {
				name: club,
			},
		});
		if (!clubInfo) return { error: "Nie udało się pobrać informacji o klubie" };
		return clubInfo;
	} catch (error) {
		console.error("Błąd podczas pobierania informacji o klubie:", error);
		return { error: "Błąd podczas pobierania informacji o klubie" };
	}
};
export const getAwaitingParticipants = async (session: Session | null) => {
	if (session) {
		try {
			if (session.user.role === "owner") {
				const awaitingPrt = await prisma.awaitingparticipant.findMany({
					where: {
						club: session.user.club,
					},
				});
				if (!awaitingPrt)
					return { error: "Błąd przy wyszukiwaniu oczekujących uczestników" };

				return awaitingPrt;
			} else {
				return { error: "Brak uprawnień do tej strony" };
			}
		} catch (error) {
			console.error("Błąd podczas pobierania danych:", error);
			return { error: "Błąd podczas pobierania uczestników" };
		}
	} else {
		return { error: "Musisz być zalogowany" };
	}
};

export const getRejectedSignInGroups = async (id: number) => {
	try {
		const prt = await prisma.awaitingparticipant.findUnique({
			where: { id: id },
		});
		if (!prt) return { error: "Nie znaleziono oczekującego uczestnika" };

		const groups = await prisma.group.findMany({
			where: { club: prt.club, signin: true },
			include: {
				locationschedule: { include: { locations: true } },
				terms: { include: { location: true } },
				breaks: true,
				participantgroup: { include: { participant: true } },
				coaches: { include: { user: true } },
			},
		});
		if (!groups) return { error: "Nie udało się pobrać danych" };

		const formatedgroups = groups.map((g) => {
			const participants = g.participantgroup.map((p) => p.participant);
			const coachesformat = g.coaches.map((c) => c.user);
			return {
				...g,
				participantgroup: participants,
				coaches: coachesformat,
			};
		});
		return formatedgroups;
	} catch (error) {
		console.error("Błąd podczas pobierania danych:", error);
		return { error: "Nie znaleziono danych" };
	}
};
export const getAwaitinParticipantById = async (id: number) => {
	try {
		const participant = await prisma.awaitingparticipant.findUnique({
			where: {
				id: id,
			},
		});
		if (!participant)
			return { error: "Nie udało się znaleźć oczekującego uczestnika" };
		return participant;
	} catch (error) {
		console.error("Błąd podczas pobierania informacji o klubie:", error);
		return { error: "Błąd podczas pobierania informacji o klubie" };
	}
};
