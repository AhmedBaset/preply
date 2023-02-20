import { doc, QueryOrderByConstraint, setDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import useLocalStorage from "../hooks/useLocalStorage";
import settings from "../settings.json";
import { QueriesProps, TeacherType } from "../Types";

type FiltersProps = {
	// set the key to be the key of the dropdowns in settings.json and the value to be the value of the dropdowns in settings.json
	[key in keyof typeof settings.dropdowns]: string[];
};

// TODO: Get Dropdowns
export const controllers: [keyof FiltersProps, string[]][] = Object.entries(
	settings.dropdowns
).map(([key, value]) => {
	const options = Object.entries(value).map(([number, option]) => {
		return option;
	});
	return [key as keyof FiltersProps, options];
});

const SELLECTED_ALL = controllers.reduce((acc, [key, value]) => {
	acc[key as keyof FiltersProps] = value;
	return acc;
}, {} as FiltersProps);

const UNSELLECTED_ALL = controllers.reduce((acc, [key]) => {
	acc[key as keyof FiltersProps] = [];
	return acc;
}, {} as FiltersProps);

const FIRST_SETTINGS =
	JSON.parse(window.localStorage.getItem("filtersSelected")!) || SELLECTED_ALL;

type Props = {
	setQueries: React.Dispatch<React.SetStateAction<QueriesProps>>;
	setQueriesCode: React.Dispatch<React.SetStateAction<string>>;
	setOrderMethod: React.Dispatch<React.SetStateAction<string>>;
	orderMethod: string;
};

async function updateDeployedSettings(settings: any) {
	const docRef = doc(db, "settings", "deployedSettings");

	await setDoc(docRef, settings);
}

function Filters({
	setQueries,
	setQueriesCode,
	orderMethod,
	setOrderMethod,
}: Props) {
	// TODO: Get Filters from LocalStorage
	const [filtersSelected, setFiltersSelected] = useLocalStorage<FiltersProps>(
		"filtersSelected",
		SELLECTED_ALL
	);
	const [order, setOrderBy] = useState<QueryOrderByConstraint | null>(null);

	useEffect(() => {
		// Object.entries(filtersSelected).map(([field, value]) => {
		// 	if (value.length > 0) {
		// 		const val: (string | null)[] = [];
		// 		value.forEach((item) => {
		// 			item === "None"
		// 				? val.push("None", "", null)
		// 				: val.push(item);
		// 		});

		// 		setQueries((prev) => [
		// 			...prev,
		// 			where(field as keyof TeacherType, "in", val),
		// 		]);
		// 	}
		// });

		setQueries(() => {
			return Object.entries(filtersSelected)
				.map(([field, value]) => {
					if (value.length > 0) {
					}
					return {
						field: field as keyof TeacherType,
						value,
					};
				})
				.filter(({ value }) => value.length > 0);
		});
		// setQueriesCode(() => {
		// 	return Object.entries(filtersSelected)
		// 		.map(([key, value]) => {
		// 			return `where("${key}", "in", [${value
		// 				.map((item) => `"${item}"`)
		// 				.join(", ")}])`;
		// 		})
		// 		.join(", ");
		// });
	}, [JSON.stringify(filtersSelected)]);

	return (
		<div className="filters">
			<div className="flex flex-between flex-wrap p-15 pb-0 gap">
				<div className="flex gap">
					<button
						className="btn btn-secondary"
						onClick={() => setFiltersSelected(SELLECTED_ALL)}
					>
						Sellect all
					</button>
					<button
						className="btn btn-secondary"
						onClick={() => setFiltersSelected(UNSELLECTED_ALL)}
					>
						Unsellect all
					</button>
					<button
						className="btn btn-secondary"
						onClick={() => setFiltersSelected(FIRST_SETTINGS)}
					>
						Clear all
					</button>
				</div>
				<div className="flex flex-end gap">
					<select
						className="btn btn-secondary"
						defaultValue="None"
						onChange={(event) => {
							if (event.target.value !== "None") {
								setOrderMethod(event.target.value);
							}
						}}
					>
						<option value="None" disabled>
							Order by
						</option>
						<option value="tutor_id">Random</option>
						<option value="tutor_name">Alphabetical</option>
						<option value="update_time">Update time</option>
						<option value="create_time">Creation time</option>
					</select>
					<button
						className="btn btn-primary"
						onClick={() => {
							updateDeployedSettings({
								...filtersSelected,
								orderMethod,
							});
						}}
					>
						Deploy Settings
					</button>
				</div>
			</div>

			<div className="flex flex-wrap p-15 gap-1">
				{/* Set the type to key and value */}
				{controllers.map(([key, value]) => (
					<div className="filter" key={key}>
						<h3>
							{key[0].toUpperCase()}
							{key.slice(1).toLowerCase()}
						</h3>

						{value.map((option) => (
							<div key={option} className="option flex flex-between gap">
								<span className="text-gray">{option}</span>
								<input
									type="checkbox"
									checked={filtersSelected[key].includes(option)}
									onChange={(event) => {
										setFiltersSelected((prev) => {
											const newValue = prev;
											if (event.target.checked) {
												newValue[key] = [...newValue[key], option];
											} else {
												newValue[key] = newValue[key].filter(
													(item) => item !== option
												);
											}
											return { ...newValue };
										});
									}}
								/>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export default Filters;
