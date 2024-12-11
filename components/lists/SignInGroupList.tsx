"use client";
import React from "react";
import {
	Box,
	Typography,
	List,
	ListItem,
	ListItemText,
	Divider,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Button,
} from "@mui/material";

interface Props {
	groups: Group[];
	onSelectGroup: (group: Group) => void;
}
const daysOfWeek = [
	"niedziela",
	"poniedziałek",
	"wtorek",
	"środa",
	"czwartek",
	"piątek",
	"sobota",
];
type Term = {
	id: number;
	name: string;
	dayOfWeek: number; // 0 - niedziela, 1 - poniedziałek, itd.
	timeS: string; // "16:00"
	timeE: string; // "17:00"
	location: { name: string };
};
type Group = {
	id: number;
	name: string;
	terms: Term[];
	participantgroup: [];
	signInfo?: string;
	participantCount: number;
};

const SignInGroupList = (props: Props) => {
	// Group terms by day of the week
	const groupedByDay = props.groups.reduce(
		(acc: { [key: number]: Group[] }, group) => {
			if (group.terms && Array.isArray(group.terms)) {
				group.terms.forEach((term) => {
					if (!acc[term.dayOfWeek]) acc[term.dayOfWeek] = [];
					if (!acc[term.dayOfWeek].includes(group))
						acc[term.dayOfWeek].push(group);
				});
			}
			return acc;
		},
		{}
	);

	// Sort days so "Sunday" is at the end
	const sortedDays = Object.keys(groupedByDay)
		.map(Number)
		.sort((a, b) => (a === 0 ? 1 : b === 0 ? -1 : a - b)); // Sunday goes last

	return (
		<Box sx={{ width: "100%", mt: 2 }}>
			{sortedDays.map((day) => {
				const groupsForDay = groupedByDay[day] || []; // Ensure it's an array

				return (
					<Box
						key={day}
						sx={{ mb: 2 }}>
						{/* Header for the day */}
						<Typography
							variant='h6'
							component='div'
							align='center'
							sx={{
								backgroundColor: "lightgray",
								padding: 2,
								borderRadius: 1,
								mb: 2,
							}}>
							{daysOfWeek[day]}
						</Typography>

						{/* List of groups */}
						{groupsForDay.map((group) => (
							<Accordion key={group.id}>
								<AccordionSummary
									//expandIcon={<ExpandMoreIcon />}
									aria-controls={`panel-${group.id}-content`}
									id={`panel-${group.id}-header`}
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										borderBottom: 1,
										borderColor: "divider",
									}}>
									{/* For now, display the first term's data */}
									{group.terms[0] && (
										<>
											{/* Time */}
											<Typography sx={{ flex: 1 }}>
												{group.terms[0].timeS} - {group.terms[0].timeE}
											</Typography>

											{/* Group Name */}
											<Typography
												variant='body1'
												color='primary'
												sx={{ flex: 1, textAlign: "center" }}>
												{group.name}
											</Typography>

											{/* Location */}
											<Typography
												variant='body2'
												color='textSecondary'
												sx={{ flex: 1, textAlign: "right" }}>
												{group.terms[0].location?.name || "Brak lokalizacji"}
											</Typography>
										</>
									)}
								</AccordionSummary>
								<AccordionDetails>
									<Box my={2}>
										<Typography
											variant='body2'
											align='center'
											color='textSecondary'>
											{group.signInfo ? group.signInfo : "-"}
										</Typography>
									</Box>

									<Divider />
									<Box
										my={2}
										display={"flex"}
										justifyContent={"space-between"}>
										<Typography color='textSecondary'>Zapisanych:</Typography>
										<Typography
											color={
												group.participantCount !== 0 &&
												group.participantgroup.length >= group.participantCount
													? "error" // Red color when the condition is met
													: "textPrimary"
											}>
											{group.participantCount !== 0
												? `${
														group.participantgroup.length
															? group.participantgroup.length
															: 0
												  }/${group.participantCount}`
												: `${
														group.participantgroup.length
															? group.participantgroup.length
															: 0
												  }`}
										</Typography>
									</Box>
									<Divider />
									<Box my={2}>
										<Typography color='textSecondary'>Terminy:</Typography>
										<List>
											{group.terms.map((term) => (
												<React.Fragment key={term.id}>
													<ListItem
														sx={{
															display: "flex",
															justifyContent: "space-between",
														}}>
														{/* Time */}
														<ListItemText
															primary={`${term.timeS} - ${term.timeE}`}
															sx={{ flex: 1 }}
														/>

														{/* Location */}
														<Typography
															variant='body2'
															color='textSecondary'
															sx={{ flex: 1, textAlign: "right" }}>
															{term.location?.name || "Brak lokalizacji"}
														</Typography>
													</ListItem>
													<Divider />
												</React.Fragment>
											))}
										</List>
									</Box>

									<Button
										variant='contained'
										color='primary'
										fullWidth
										disabled={
											group.participantCount !== 0 &&
											group.participantgroup.length >= group.participantCount
										}
										onClick={() => props.onSelectGroup(group)}>
										Wybierz
									</Button>
								</AccordionDetails>
							</Accordion>
						))}
					</Box>
				);
			})}
		</Box>
	);
};

export default SignInGroupList;
