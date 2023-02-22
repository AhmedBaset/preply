import { doc, setDoc } from "firebase/firestore";
import React, { useEffect } from "react";
import { db } from "../firebase-config";
import useLocalStorage from "../hooks/useLocalStorage";
import settings from "../settings.json";
import { OrderMethodType, QueriesProps } from "../Types";

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
	setOrderMethod: React.Dispatch<React.SetStateAction<OrderMethodType>>;
	orderMethod: OrderMethodType;
	queries: QueriesProps;
	getData: () => void;
};

function Filters({
	setQueries,
	setQueriesCode,
	orderMethod,
	queries,
	setOrderMethod,
	getData,
}: Props) {
	// TODO: Get Filters from LocalStorage
	const [filtersSelected, setFiltersSelected] = useLocalStorage<FiltersProps>(
		"filtersSelected",
		SELLECTED_ALL
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [orderMethodSelected, setOrderMethodSelected] =
		useLocalStorage<OrderMethodType>("orderMethod", orderMethod);
	const [isLoading, setIsLoading] = React.useState(false);

	useEffect(() => {
		setQueries(() =>
			Object.entries(filtersSelected)
				.map(([key, value]) => ({
					field: key as keyof FiltersProps,
					value,
				}))
				.filter(({ value }) => value.length > 0)
		);

		// setQueriesCode(() => {
		// 	return Object.entries(filtersSelected)
		// 		.map(([key, value]) => {
		// 			return `where("${key}", "in", [${value
		// 				.map((item) => `"${item}"`)
		// 				.join(", ")}])`;
		// 		})
		// 		.join(", ");
		// });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(filtersSelected)]);

	async function updateDeployedSettings(settings: any, orderMethod: string) {
		setIsLoading(true);
		const docRef = doc(db, "settings", "deployed_settings");

		await setDoc(docRef, { queries: settings, orderMethod });
		setIsLoading(false);
	}

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
					<button
						className="btn btn-secondary flex-center"
						onClick={getData}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
							<path d="M447.5 224H456c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L397.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L311 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H447.5z" />
						</svg>
					</button>
					<select
						className="btn btn-secondary"
						defaultValue={orderMethod}
						onChange={(event) => {
							if (event.target.value !== "None") {
								setOrderMethod(event.target.value as OrderMethodType);
								setOrderMethodSelected(
									event.target.value as OrderMethodType
								);
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
							updateDeployedSettings(queries, orderMethod);
						}}
					>
						{isLoading ? "Deploying settings" : "Deploy settings"}
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
