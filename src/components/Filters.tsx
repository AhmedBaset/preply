import React, { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import settings from "../settings.json";

type FiltersProps = {
	// set the key to be the key of the dropdowns in settings.json and the value to be the value of the dropdowns in settings.json
	[key in keyof typeof settings.dropdowns]: string[];
};

// TODO: Get Dropdowns
const controllers: [keyof FiltersProps, string[]][] = Object.entries(
	settings.dropdowns
).map(([key, value]) => {
	const options = Object.entries(value).map(([number, option]) => {
		return option;
	});
	return [key as keyof FiltersProps, options];
});

function Filters() {
	// TODO: Get Filters from LocalStorage
	const [filtersSelected, setFiltersSelected] = useLocalStorage<FiltersProps>(
		"filtersSelected",
		// convert controllers to the same type as FiltersProps
		controllers.reduce((acc, [key, value]) => {
			acc[key as keyof FiltersProps] = value;
			return acc;
		}, {} as FiltersProps)
	);

	return (
		<div className="filters">
			<div className="flex flex-between flex-wrap p-15 pb-0 gap">
				<div className="flex gap">
					<button className="btn btn-secondary">Sellected</button>
					<button className="btn btn-secondary">Unsellected</button>
					<button className="btn btn-secondary">Clear All</button>
				</div>
				<div className="flex flex-end gap">
					<button className="btn btn-secondary">Deploy Settings</button>
					<select className="btn btn-secondary" defaultValue="None">
						<option value="None">Order by</option>
					</select>
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
									defaultChecked={filtersSelected[key].includes(option)}
									onChange={(event) => {
										setFiltersSelected((prev) => {
											const newValue = prev;
											if (event.target.checked) {
												newValue[key] = [...newValue[key], option]
											} else {
												newValue[key] = newValue[key].filter(
													(item) => item !== option
												);
											}
											console.log("newValue ", newValue)
											return newValue;
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
