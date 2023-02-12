import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Teacher from "./components/Teacher";
import { db } from "./firebase-config";
import { TeacherType } from "./Types";
import {COLLECTION_NAME} from "./firebase-config";



function App() {
	const [teachersLength, setTeachersLength] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [dataFromFirestore, setDataFromFirestore] = useState<{data: TeacherType, doc_id: string}[]>(
		[]
	);
	// const [numberOfDataFromFirestore, setNumberOfDataFromFirestore] =
	useState(100);
	const [teachers, setTeachers] = useState<{data: TeacherType, doc_id: string}[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editMode, setEditMode] = useState(false);


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

				const docs: {data: TeacherType, doc_id: string}[] = [];
				snapshot.docs.forEach((doc) => {
					docs.push({data: doc.data() as TeacherType, doc_id: doc.id});
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
		window.scrollTo({ top: 0, behavior: "smooth" })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, dataFromFirestore.length]);

	return (
		<div className="App">
			<Header teachersLength={teachersLength} editMode={editMode} setEditMode={setEditMode} />

			<div className="teachers-list">
				{loading && <h1>Loading...</h1>}
				{error && (
					<p style={{ color: "red", backgroundColor: "#f003", padding: 16, marginBlock: 16, borderRadius: 10 }}>
						<b>Error: </b>
						{error}
					</p>
				)}

				{teachers &&
					teachers.map((teacher) => (
						<Teacher teacherData={teacher.data} key={teacher.data.tutor_id} editMode={editMode} setError={setError} doc_id={teacher.doc_id} />
					))}
			</div>

			<Footer
				teachersLength={teachersLength}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</div>
	);
}

export default App;
