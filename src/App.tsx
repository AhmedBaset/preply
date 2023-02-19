import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { db } from "./firebase-config";
import { TeacherType } from "./Types";
import { COLLECTION_NAME } from "./firebase-config";

const Home = React.lazy(() => import("./pages/Home"));
const EditMode = React.lazy(() => import("./pages/EditMode"));

function App() {
	const [teachersLength, setTeachersLength] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [dataFromFirestore, setDataFromFirestore] = useState<
		{ data: TeacherType; doc_id: string }[]
	>([]);
	// const [numberOfDataFromFirestore, setNumberOfDataFromFirestore] =
	useState(100);
	const [teachers, setTeachers] = useState<
		{ data: TeacherType; doc_id: string }[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// TODO: Get data from firestore
	useLayoutEffect(() => {
		(async () => {
			const q = collection(db, COLLECTION_NAME);

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
				setTeachersLength(docs.length);
				setLoading(false);
			} catch (error: any) {
				setError(error.message);
				setLoading(false);
			}
		})();

		// }, [numberOfDataFromFirestore]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// TODO: Set teachers based on current page
	useEffect(() => {
		setTeachers(
			dataFromFirestore.slice((currentPage - 1) * 10, currentPage * 10)
		);
		window.scrollTo({ top: 0, behavior: "smooth" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, dataFromFirestore.length]);

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
							error={error}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default App;
