import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	Timestamp,
} from "firebase/firestore";
import React, { FormEvent, useEffect, useState } from "react";
import { db } from "../firebase-config";
import { OrderMethodType, QueriesProps } from "../Types";
import { FiltersProps } from "./Filters";

const dropdowns = require("./../settings.json").dropdowns

type Option = {
	queries: QueriesProps;
	orderMethod: OrderMethodType;
	id: string;
	name: string;
	create_time: Timestamp;
};
type Options = Option[];
type Props = {
	queries: QueriesProps;
	setFiltersSelected: React.Dispatch<React.SetStateAction<FiltersProps>>;
	orderMethod: OrderMethodType;
	setOrderMethod: React.Dispatch<React.SetStateAction<OrderMethodType>>;
};

function SavedFilters({
	queries,
	setFiltersSelected,
	orderMethod,
	setOrderMethod,
}: Props) {
	const [options, setOptions] = useState<Options>([]);
	const [name, setName] = useState("");

	async function getData() {
		const colRef = query(
			collection(db, "savedFilters"),
			orderBy("create_time", "desc")
		);

		try {
			const snapshot = await getDocs(colRef);

			if (snapshot.empty) return;
			const docs = snapshot.docs.map((doc) => {
				const { queries, orderMethod, id, name } = doc.data();

				return { queries, orderMethod, id, name };
			});

			setOptions(docs as Options);
		} catch (error) {
			console.log(error);
		}
	}

	async function createOption(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const id = name.split(" ").join("-").toLowerCase();
		const data = {
			queries,
			orderMethod,
			name,
			id,
			create_time: serverTimestamp(),
		};

		const docRef = doc(db, "savedFilters", id);

		await setDoc(docRef, data);

		setName("");
		getData();
	}

	function updateQueries(option: Option) {
		console.log("queries", option.queries);
		const keys = Object.keys(dropdowns)

		setFiltersSelected(() => {
			const f: FiltersProps = {} as FiltersProps;
			keys.forEach((key) => {
				const query = option.queries.find((e) => e.field === key)

				if (!query) f[key as keyof FiltersProps] = []
				else f[key as keyof FiltersProps] = query.value
			});
			console.log("filters", f);
			return f;
		});
		setOrderMethod(option.orderMethod);
	}

	async function deleteOption(id: string) {
		const docRef = doc(db, "savedFilters", id);

		await deleteDoc(docRef);

		getData();
	}

	useEffect(() => {
		getData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="saved-filters flex flex-col gap">
			<h3>Saved filters</h3>

			<form className="flex" onSubmit={createOption}>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Name e.g. Males only"
					className="flex-auto btn"
					required
				/>
				<button
					type="submit"
					className="btn btn-primary"
					style={{ minWidth: "50px" }}
				>
					Save filters
				</button>
			</form>

			<div className="flex flex-col gap">
				{options.map((option) => (
					<div
						key={option.id}
						onClick={() => updateQueries(option)}
						className="flex-center flex-between item"
					>
						<span>{option.name}</span>
						<button
							onClick={(e) => {
								e.stopPropagation();
								deleteOption(option.id);
							}}
							className="btn btn-secondary flex-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 448 512"
							>
								<path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
							</svg>
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

export default SavedFilters;
