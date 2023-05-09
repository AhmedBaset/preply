import React, { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
} from "firebase/firestore";
import { db, COLLECTION_NAME, auth } from "./firebase-config";
import { OrderMethodType, QueriesProps, TeacherType, UserProps } from "./Types";
import { onAuthStateChanged } from "firebase/auth";

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
	const [orderMethod, setOrderMethod] = useState<OrderMethodType>("tutor_id");
	const [currentUser, setCurrentUser] = useState<UserProps>(null);

	const queriesAsString = JSON.stringify(queries);
	const dataFromFirestoreAsString = JSON.stringify(dataFromFirestore);

	// TODO: Get data from firestore

	const getData = async () => {
		const q = query(
			collection(db, COLLECTION_NAME),
			orderBy(
				orderMethod,
				orderMethod === "update_time" || orderMethod === "create_time"
					? "desc"
					: "asc"
			)
		);

		setLoading(true);

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
	};
	useLayoutEffect(() => {
		getData();

		// }, [numberOfDataFromFirestore]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queriesAsString, orderMethod]);

	// TODO: Filter data
	useEffect(() => {
		if (queries.length === 0) {
			setFilteredData([]);
			return;
		}

		const data: { data: TeacherType; doc_id: string }[] = [];
		dataFromFirestore.forEach((doc) => {
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

		if (orderMethod === "tutor_id") {
			const sortedData = data.sort(() => {
				const random = Math.random();
				if (random > 0.5) return 1;
				if (random < 0.5) return -1;
				return 0;
			});
			setFilteredData(sortedData);
		} else {
			setFilteredData(data);
		}

		// setFilteredData(sortArray(data, orderMethod));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queriesAsString, dataFromFirestoreAsString]);

	useEffect(() => {
		setQueriesCode(
			`orderBy("${orderMethod}", "${
				orderMethod === "update_time" ? "desc" : "asc"
			}")`
		);
	}, [orderMethod]);

async function refreshCurrentUser() {
	if (!auth.currentUser) return
const docRef = doc(db, "users", auth.currentUser.uid);

			const snapshot = await getDoc(docRef);
			if (!snapshot.exists()) return;

			setCurrentUser(snapshot.data() as UserProps);
}

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (!user) return setCurrentUser(null)

			refreshCurrentUser()
		});
	}, []);

	// TODO: Set teachers based on current page
	useEffect(() => {
		setTeachers(filteredData.slice((currentPage - 1) * 10, currentPage * 10));
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
			<Suspense>
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
								setQueries={setQueries}
								setOrderMethod={setOrderMethod}
								currentUser={currentUser}
refreshCurrentUser={refreshCurrentUser}
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
								queries={queries}
								setQueriesCode={setQueriesCode}
								orderMethod={orderMethod}
								setOrderMethod={setOrderMethod}
								dataFromFireStore={dataFromFirestore}
								getData={getData}
							/>
						}
					/>
				</Routes>
			</Suspense>
		</div>
	);
}

export default App;

// function sortArray(
// 	array: { data: TeacherType; doc_id: string }[],
// 	orderMethod: OrderMethodType
// ) {
// 	const sortedArray: { data: TeacherType; doc_id: string }[] = [...array].sort(
// 		(a, b) => {
// 			if (orderMethod === ("updata_time" as OrderMethodType)) {
// 				if (a.data.update_time?.toJSON() > b.data.update_time?.toJSON())
// 					return 1;
// 				if (a.data.update_time?.toJSON() < b.data.update_time?.toJSON())
// 					return -1;
// 				return 0;
// 			} else if (orderMethod === "create_time") {
// 				if (a.data.create_time?.toJSON() > b.data.create_time?.toJSON())
// 					return 1;
// 				if (a.data.create_time?.toJSON() < b.data.create_time?.toJSON())
// 					return -1;
// 				return 0;
// 			} else if (orderMethod === "tutor_id") {
// 				if (a.doc_id > b.doc_id) return 1;
// 				if (a.doc_id < b.doc_id) return -1;
// 				return 0;
// 			} else {
// 				if (a.data[orderMethod] > b.data[orderMethod]) return 1;
// 				if (a.data[orderMethod] < b.data[orderMethod]) return -1;
// 				return 0;
// 			}
// 		}
// 	);
// 	console.log(sortedArray.map((doc) => doc.data[orderMethod]));
// 	return sortedArray;
// }
