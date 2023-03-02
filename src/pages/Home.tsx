import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Teacher from "../components/Teacher";
import { db } from "../firebase-config";
import { OrderMethodType, QueriesProps, TeacherType } from "../Types";
import Authentication from "./Authentication";

const banner = require("./../settings.json").banner_image;

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

const test = [
	{
		data: {
			description:
				"Friendly, TEFL Certified/ Native English Speaker with over 8 years of experience - CONVERSATIONAL ENGLISH Hello my potential students! My name is Lauren or Ren, however you prefer. :)\nI am a native English speaker from New York City and a newly certified English Tutor with a specialization in Online Tutoring from a top, internationally recognized TEFL program.",
			ethnicity: "white",
			gender: "Female",
			is_newly_joined: true,
			languages: "Speaks:\nEnglishNative",
			lesson_duration: "50-min lesson",
			lessons: 1,
			n_of_reviews: 0,
			price: "15",
			rating: "3",
			students: 13,
			thumbnail_img_local_path: "thumbnail_imgs/lauren_t.jpg",
			thumbnail_img_url: "",
			tutor_country: "United States of America",
			tutor_id: "2607674",
			tutor_name: "Lauren T.",
			tutor_teaches: "English",
		},
		doc_id: "22",
	},
];

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
	const [isSignOpen, setIsSignOpen] = useState(false);

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
			<img
				src={banner}
				alt="Banner"
				style={{ display: "block", width: "100%" }}
			/>

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

				{test &&
					test.map((teacher) => (
						<Teacher
							teacherData={teacher.data}
							key={teacher.data.tutor_id}
							editMode={false}
							setError={setError}
							doc_id={teacher.doc_id}
							setIsSignOpen={setIsSignOpen}
						/>
					))}
				{teachers &&
					teachers.map((teacher) => (
						<Teacher
							teacherData={teacher.data}
							key={teacher.data.tutor_id}
							editMode={false}
							setError={setError}
							doc_id={teacher.doc_id}
							setIsSignOpen={setIsSignOpen}
						/>
					))}
			</div>

			<Footer
				teachersLength={teachersLength}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>

			{isSignOpen && <Authentication />}
		</>
	);
}

export default Home;
