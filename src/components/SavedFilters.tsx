import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import React, { FormEvent, useEffect, useState } from "react";
import { db } from "../firebase-config";
import { OrderMethodType, QueriesProps } from "../Types";

type Option = {
	queries: QueriesProps;
	orderMethod: OrderMethodType;
	id: string;
	name: string;
};
type Options = Option[];
type Props = {
	queries: QueriesProps;
	setQueries: React.Dispatch<React.SetStateAction<QueriesProps>>;
	orderMethod: OrderMethodType;
	setOrderMethod: React.Dispatch<React.SetStateAction<OrderMethodType>>;
};

function SavedFilters({
	queries,
	setQueries,
	orderMethod,
	setOrderMethod,
}: Props) {
	const [options, setOptions] = useState<Options>([]);

	async function getData() {
		const colRef = collection(db, "settings/savedFilters");

		try {
			const snapshot = await getDocs(colRef);

			const docs = snapshot.docs.map((doc) => {
				const { queries, orderMethod } = doc.data();

				return { queries, orderMethod, id: doc.id };
			});

			setOptions(docs as Options);
		} catch (error) {
			console.log(error);
		}
	}

	async function createOption(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const name = e.currentTarget.optionName.value;
		const id = name.split(" ").join("-").toLowerCase();
		const data = {
			queries,
			orderMethod,
			name,
			create_time: serverTimestamp(),
		};

		const docRef = doc(db, "settings/savedFilters", id);

		await setDoc(docRef, data);
	}

	function updateQueries(option: Option) {
		setQueries(option.queries);
		setOrderMethod(option.orderMethod);
	}

	async function deleteOption(id: string) {
		const docRef = doc(db, "settings/savedFilters", id);

		await deleteDoc(docRef);
	}

	useEffect(() => {
		getData();
	}, []);

	return (
		<div className="saved-filters flex flex-col gap">
			<form className="flex" onSubmit={createOption}>
				<input
					type="text"
					name="optionName"
					placeholder="Name e.g. males only"
					className="flex-auto btn"
					required
				/>
				<button type="submit" className="btn btn-primary">
					Save filters
				</button>
			</form>

			<div className="flex flex-col gap">
				{options.map((option) => (
					<div
						key={option.id}
						onClick={() => updateQueries(option)}
						className="flex-center justify-between item"
					>
						<span>{option.name}</span>
						<button
							onClick={() => deleteOption(option.id)}
							className="btn btn-secondary"
						>
							Delete
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

export default SavedFilters;
