import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Teacher from "../components/Teacher";
import { db } from "../firebase-config";
import {
	OrderMethodType,
	QueriesProps,
	TeacherType,
	UserProps,
} from "../Types";
import Authentication from "./Authentication";

const banners = require("./../settings.json").banner_image;
const getRandom = (arr: string[]) => {
	const random = Math.floor(Math.random() * arr.length);
	return arr[random];
};
const banner = {
	landscape: getRandom(banners.landscape),
	portrait: getRandom(banners.portrait),
};

type Props = {
	teachersLength: number;
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	loading: boolean;
	teachers: { data: TeacherType; doc_id: string }[];
	setError: React.Dispatch<React.SetStateAction<string>>;
	setQueries: React.Dispatch<React.SetStateAction<QueriesProps>>;
	setOrderMethod: React.Dispatch<React.SetStateAction<OrderMethodType>>;
	currentUser: UserProps;
refreshCurrentUser: () => void;
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
	currentUser,
refreshCurrentUser
}: Props) {
	const [isSignOpen, setIsSignOpen] = useState(false);
	const [step, setStep] = useState("");

	useLayoutEffect(() => {
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

	useEffect(() => {
		document.body.style.overflow = isSignOpen ? "hidden" : "auto";
	}, [isSignOpen]);

	return (
		<>
			<picture style={{ display: "block", width: "100%" }}>
				<source
					media="(orientation: landscape)"
					srcSet={banner.landscape}
					style={{ display: "block", width: "100%" }}
				/>
				<source
					media="(orientation: portrait)"
					srcSet={banner.portrait}
					style={{ display: "block", width: "100%" }}
				/>
				<img
					src={banner.landscape}
					alt="Banner"
					style={{ display: "block", width: "100%" }}
				/>
			</picture>

			<Header
				teachersLength={teachersLength}
				editMode="NO"
				currentUser={currentUser}
				setIsSignOpen={setIsSignOpen}
			/>

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
							setIsSignOpen={setIsSignOpen}
							setStep={setStep}
						/>
					))}
			</div>

			<Footer
				teachersLength={teachersLength}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>

			{isSignOpen && (
				<Authentication
					setIsSignOpen={setIsSignOpen}
					step={step}
					setStep={setStep}
refreshCurrentUser={refreshCurrentUser}
				/>
			)}
		</>
	);
}

export default Home;
