import { doc, getDoc } from "firebase/firestore";
import React, { useEffect } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Teacher from "../components/Teacher";
import { db } from "../firebase-config";
import { OrderMethodType, QueriesProps, TeacherType } from "../Types";

type Props = {
	teachersLength: number;
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	loading: boolean;
	teachers: { data: TeacherType; doc_id: string }[];
	setError: React.Dispatch<React.SetStateAction<string>>;
	setQueries: React.Dispatch<React.SetStateAction<QueriesProps>>;
	setOrderMethod: React.Dispatch<React.SetStateAction<OrderMethodType>>;
};

function Home({
	teachersLength,
	currentPage,
	setCurrentPage,
	loading,
	teachers,
	setError,
	setQueries,
	setOrderMethod,
}: Props) {
	useEffect(() => {
		(async () => {
			const docRef = doc(db, "settings", "deployed_settings");

			try {
				const snapshot = await getDoc(docRef);

				if (snapshot.exists()) {
					setQueries(snapshot.data().queries);
					setOrderMethod(snapshot.data().orderMethod);
				}
			} catch (error: any) {
				setError(error.message);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Header teachersLength={teachersLength} editMode="NO" />

			<div className="teachers-list">
				{loading && (
					<p
						style={{
							color: "#2f2201",
							backgroundColor: "#f9d8862d",
							padding: 16,
							marginBlock: 16,
							borderRadius: 10,
							border: "1px dashed #2f2201",
						}}
					>
						Loading...
					</p>
				)}

				{teachers &&
					teachers.map((teacher) => (
						<Teacher
							teacherData={teacher.data}
							key={teacher.data.tutor_id}
							editMode={false}
							setError={setError}
							doc_id={teacher.doc_id}
						/>
					))}
			</div>

			<Footer
				teachersLength={teachersLength}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</>
	);
}

export default Home;
