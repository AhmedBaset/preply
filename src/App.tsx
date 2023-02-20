import React, { useEffect, useLayoutEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
	collection,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { db, COLLECTION_NAME } from "./firebase-config";
import { QueriesProps, TeacherType } from "./Types";

const Home = React.lazy(() => import("./pages/Home"));
const EditMode = React.lazy(() => import("./pages/EditMode"));

function App() {
	const [teachersLength, setTeachersLength] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [dataFromFirestore, setDataFromFirestore] = useState<
		{ data: TeacherType; doc_id: string }[]
	>([]);
	const [filteredData, setFilteredData] = useState<
		{ data: TeacherType; doc_id: string }[]
	>([]);
	// const [numberOfDataFromFirestore, setNumberOfDataFromFirestore] =
	useState(100);
	const [teachers, setTeachers] = useState<
		{ data: TeacherType; doc_id: string }[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [queries, setQueries] = useState<QueriesProps>([]);
	const [queriesCode, setQueriesCode] = useState("");
	const [orderMethod, setOrderMethod] = useState("tutor_id");


	const queriesAsString = JSON.stringify(queries);
	const dataFromFirestoreAsString = JSON.stringify(
		dataFromFirestore.map((doc) => doc.data.tutor_id)
	);

	// TODO: Get data from firestore
	useLayoutEffect(() => {
		(async () => {
			const q = query(collection(db, COLLECTION_NAME));

			//* If you want to limit the number of data from firestore. But In this case you can't knew the number of documents in the collection and the number of pages.
			// const q = query(
			//   collection(db, COLLECTION_NAME),
			//   limit(numberOfDataFromFirestore)
			// );

			try {
				const snapshot = await getDocs(q);

				const docs: { data: TeacherType; doc_id: string }[] = [];
				snapshot.docs.forEach((doc) => {
					docs.push({ data: doc.data() as TeacherType, doc_id: doc.id });
				});

				setDataFromFirestore(docs);
				setLoading(false);
			} catch (error: any) {
				setError(error.message);
				setLoading(false);
			}
		})();

		// }, [numberOfDataFromFirestore]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queriesAsString]);

	// TODO: Filter data
	useEffect(() => {
		const data: { data: TeacherType; doc_id: string }[] = [];
		dataFromFirestore.forEach((doc) => {
			let isMatch = false;
			let matched = 0;

			queries.forEach((query) => {
				query.value.forEach((value) => {
					if (value === "None") {
						if (
							doc.data[query.field] === value ||
							doc.data[query.field] === "" ||
							doc.data[query.field] === undefined ||
							doc.data[query.field] === null
						)
							matched++;
					} else {
						if (doc.data[query.field] === value) matched++;
					}
				});
			});
			if (matched === queries.length) data.push(doc);
		});

		setFilteredData(sortArray(data, orderMethod));
	}, [queriesAsString, dataFromFirestoreAsString, orderMethod]);

	// TODO: Set teachers based on current page
	useEffect(() => {
		setTeachers(
			filteredData.slice((currentPage - 1) * 10, currentPage * 10)
		);
		setTeachersLength(filteredData.length);
		window.scrollTo({ top: 0, behavior: "smooth" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, JSON.stringify(filteredData)]);

	// TODO: Check Internet connection
	useEffect(() => {
		const checkOnline = () => {
			if (!navigator.onLine) setError("OFFLINE, Your device is offline.");
			else setError("");
		};

		["online", "offline", "load"].forEach((event) => {
			window.addEventListener(event, checkOnline);
		});
	}, []);

	return (
		<div className="App">
			{error && (
				<div
					style={{
						color: "#f00",
						backgroundColor: "#f003",
						padding: 16,
						margin: 16,
						borderRadius: 10,
					}}
				>
					<b>Error: </b>
					{error}
				</div>
			)}

			<Routes>
				<Route
					path="/"
					element={
						<Home
							teachersLength={teachersLength}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							teachers={teachers}
							setError={setError}
							loading={loading}
							error={error}
						/>
					}
				/>
				<Route
					path="/edit-mode"
					element={
						<EditMode
							teachersLength={teachersLength}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							teachers={teachers}
							setError={setError}
							loading={loading}
							setQueries={setQueries}
							queriesCode={queriesCode}
							setQueriesCode={setQueriesCode}
							orderMethod={orderMethod}
							setOrderMethod={setOrderMethod}
							dataFromFireStore={dataFromFirestore}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default App;

function sortArray(array: any[], orderMethod: string) {
	const sortedArray = [...array].sort((a, b) => {
		const firstField =
			orderMethod === "tutor_id"
				? parseInt(a.data[orderMethod])
				: orderMethod === "updata_time"
				? new Date(a.data.update_time.seconds * 1000)
				: orderMethod === "create_time"
				? new Date(a.data.create_time.seconds * 1000)
				: a.data[orderMethod];
		const secondField =
			orderMethod === "tutor_id"
				? parseInt(b.data[orderMethod])
				: orderMethod === "updata_time"
				? new Date(b.data.update_time.seconds * 1000)
				: orderMethod === "create_time"
				? new Date(b.data.create_time.seconds * 1000)
				: b.data[orderMethod];

		if (firstField > secondField) return 1;
		if (firstField < secondField) return -1;
		return 0;
	});

	console.log(sortedArray.map((doc) => doc.data[orderMethod]));
	return sortedArray;
}
