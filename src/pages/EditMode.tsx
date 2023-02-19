import React, { useState } from "react";
import Filters from "../components/Filters";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Teacher from "../components/Teacher";
import { TeacherType } from "../Types";

type Props = {
   teachersLength: number;
   currentPage: number;
   setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
   loading: boolean;
   error: string;
   teachers: { data: TeacherType; doc_id: string }[];
   setError: React.Dispatch<React.SetStateAction<string>>;
};

function EditMode({ teachersLength, currentPage, setCurrentPage, teachers, setError, loading, error }: Props) {
	const [editMode, setEditMode] = useState(false);


	return (
		<>
			<Filters />

			<Header
				teachersLength={teachersLength}
				editMode={editMode}
				setEditMode={setEditMode}
				queryText={`query(collection(COLLECTION_NAME), where("gender", "in", ["None", "Male", "Female"]))`}
			/>

			<div className="teachers-list">
				{loading && (
					<p
						style={{
							color: "#2f2201",
							backgroundColor: "#f5b2092d",
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
							editMode={editMode}
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

export default EditMode;
