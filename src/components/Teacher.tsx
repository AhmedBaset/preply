import React from "react";
import { TeacherType } from "./../Types";
import country from "./../countries";
import { ReactComponent as GraduationSvg } from "./../assets/graduation.svg";
import { ReactComponent as UserSvg } from "./../assets/user.svg";
import { ReactComponent as MessageSvg } from "./../assets/message.svg";
import { ReactComponent as StarSvg } from "./../assets/star.svg";
import dropdowns from "./../dropdowns.json";
import { COLLECTION_NAME } from "./../firebase-config";
import { db } from "../firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import ModalComponent from "./Modal";

type Props = {
	teacherData: TeacherType;
	editMode: boolean;
	setError?: React.Dispatch<React.SetStateAction<string>>;
	doc_id: string;
};

function Teacher({ teacherData, editMode, setError, doc_id }: Props) {
	const [isShowAllDescription, setIsShowAllDescription] =
		React.useState(false);
	const [teacher, setTeacher] = React.useState(teacherData);
	const [modal, setModal] = React.useState<null | {
		key: string;
		type: string;
	}>(null);
	const [isEdited, setIsEdited] = React.useState(false);

	// TODO: Convert languages from string to array
	const languagesArray = teacher.languages
		.replace("Speaks:", "")
		.replace(
			/(Native|Pre-Intermidiate|Intermediate|Upper-Intermdiate|Advanced|Fluent|Beginner|Proficient) /g,
			"$1|"
		)
		.split("|")
		.map((lang) => {
			const key = lang.replace(
				/Native|Pre-Intermidiate|Intermediate|Upper-Intermdiate|Advanced|Fluent|Beginner|Proficient/g,
				""
			);
			const value = lang.replace(
				/.+(Native|Pre-Intermidiate|Intermediate|Upper-Intermdiate|Advanced|Fluent|Beginner|Proficient)/g,
				"$1"
			);
			return [key, value];
		});

	// TODO: Devide description into two parts
	const separate = teacher.description.indexOf("*-*");
	let description;

	if (separate !== -1) {
		description = {
			short: teacher.description.slice(0, separate),
			long: isShowAllDescription
				? teacher.description.slice(separate + 3)
				: teacher.description.slice(separate + 3, separate + 200),
		};
	} else {
		description = {
			short: teacher.description.split(" ").slice(0, 7).join(" "),
			long: isShowAllDescription
				? teacher.description.split(" ").slice(7).join(" ")
				: teacher.description.split(" ").slice(7, 30).join(" "),
		};
	}

	// TODO: Dropdowns
	const controllers: [string, string[]][] = Object.entries(dropdowns).map(
		([key, value]) => {
			const options = Object.entries(value).map(([number, option]) => {
				return option;
			});
			return [key, options];
		}
	);

	// TODO: Open Modal to edit teacher data
	const openModal = (key: string, type: string = "text") => {
		setModal({ key, type });
	};

	// TODO: Handle save button
	const teacherStringfied = JSON.stringify(teacher);
	React.useEffect(() => {
		setIsEdited(JSON.stringify(teacher) !== JSON.stringify(teacherData));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [teacherStringfied]);

	// TODO: Prevent from closing the page without saving
	// Uncomment this code to prevent from closing the page without saving
	React.useEffect(() => {
		window.addEventListener("beforeunload", (e) => {
			e = e || window.event;
			if (isEdited) {
				if (e) {
					e.preventDefault();
					e.returnValue =
						"There are some unsaved changes. Please save them.";
				}
				e.preventDefault();
				e.returnValue = "There are some unsaved changes. Please save them.";
				return "There are some unsaved changes. Please save them.";
			}
		});
	}, [isEdited]);

	async function updateData() {
		const docRef = doc(db, COLLECTION_NAME, doc_id);
		try {
			await updateDoc(docRef, teacher);
		} catch (error: any) {
			setError?.(error.message);
		}
		setIsEdited(false);
	}

	return (
		<>
			<section className="card">
				{/* Image */}
				<div className="image">
					<img
						onClick={() => editMode && openModal("thumbnail_img_url")}
						src={teacher.thumbnail_img_url}
						alt={teacher.thumbnail_img_local_path}
					/>
				</div>

				{/* Personal info */}
				<div className="personal-info">
					<div className="first">
						<h2 className="teacher-name text-dark text-flex">
							<span onClick={() => editMode && openModal("tutor_name")}>
								{teacher.tutor_name}
							</span>{" "}
							<span
								onClick={() => editMode && openModal("tutor_country")}
								className="flag"
							>
								{country[teacher.tutor_country]}
							</span>
						</h2>
						<p
							onClick={() => editMode && openModal("tutor_teaches")}
							className="text-gray text-flex"
						>
							<GraduationSvg />
							{teacher.tutor_teaches}
						</p>
					</div>
					<div className="last text-gray">
						{teacher.rating && (
							<div className="flex-center flex-col gap flex-auto">
								<div className="text-flex">
									<StarSvg fill="#fdc425" height={13} width={13} />
									<span className="text-xl">{teacher.rating}</span>
								</div>
								<p className="text-flex" onClick={() => openModal("n_of_reviews", "number")}>
									<span>{teacher.n_of_reviews}</span><span>reviews</span>
								</p>
							</div>
						)}
						{teacher.is_newly_joined && (
							<p
								onClick={() =>
									editMode && openModal("is_newly_joined", "checkbox")
								}
								className="alert-success flex-auto"
							>
								Newly joind
							</p>
						)}
						<div
							className={`flex-center flex-wrap gap flex-auto flex-col`}
						>
							<div className="price">
								<span onClick={() => editMode && openModal("price")}>
									{teacher.price}
								</span>{" "}
								<span>USD</span>
							</div>
							<p>per hour</p>
						</div>
					</div>
				</div>

				{/* More details */}
				<div className="more-details">
					<div className="first">
						<div className="text-flex mb">
							<UserSvg className="text-gray" />
							<p
								onClick={() =>
									editMode && openModal("students", "number")
								}
								className="text-dark"
							>
								{teacher.students} active students
							</p>
						</div>
						<p
							onClick={() => editMode && openModal("languages")}
							className="text-gray mb"
						>
							Speaks:
							{languagesArray.map((lang) => (
								<React.Fragment key={lang[0]}>
									{lang[0]}{" "}
									<span
										className={`level ${
											lang[1].includes("Native")
												? "level-native"
												: ""
										}`}
									>
										{lang[1]}
									</span>{" "}
								</React.Fragment>
							))}
						</p>
						<p
							onClick={() =>
								editMode && openModal("description", "textarea")
							}
							className="text-gray mb"
						>
							<b className="text-dark">{description.short}</b> -{" "}
							<span className="text-gray pre-wrap">
								{description.long}
								{isShowAllDescription ? " " : "... "}
								{isShowAllDescription ? (
									<span
										className="show-more-less"
										onClick={() => setIsShowAllDescription(false)}
									>
										Hide details
									</span>
								) : (
									<span
										className="show-more-less"
										onClick={() => setIsShowAllDescription(true)}
									>
										Read more
									</span>
								)}
							</span>
						</p>
					</div>
					<div className="last buttons">
						<button className="btn btn-primary">Book trail lesson</button>
						<button className="btn btn-secondary flex-center">
							<MessageSvg
								className="icon"
								style={{ width: 20, height: 20, fontSize: 20 }}
							/>
							<span className="text">Message</span>
						</button>
					</div>
				</div>

				{/* Edit Mode */}
				{editMode && (
					<div className="edit-mode">
						<div className="first">
							<div className="dropdowns">
								{controllers.map(([key, value]) => (
									<div className="controller-container" key={key}>
										<label htmlFor={key}>{key}</label>
										<select
											name={key}
											defaultValue={
												teacher[
													key as keyof typeof controllers.keys
												] || value[0]
											}
											onChange={(e) =>
												setTeacher((prev) => ({
													...prev,
													[key]: e.target.value,
												}))
											}
											id={key}
										>
											{value.map((option) => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</select>
									</div>
								))}
							</div>
						</div>
						<div className="last">
							<button
								disabled={!isEdited}
								onClick={() => isEdited && updateData()}
								className="btn btn-primary"
							>
								{isEdited ? "Save Changes" : "Saved"}
							</button>
							{isEdited && (
								<button
									onClick={() => setTeacher(teacherData)}
									className="btn btn-secondary"
								>
									Cancel
								</button>
							)}
						</div>
					</div>
				)}
			</section>
			{modal && (
				<ModalComponent
					name={modal.key}
					inputType={modal.type}
					setModal={setModal}
					teacher={teacher}
					setTeacher={setTeacher}
				/>
			)}
		</>
	);
}

export default Teacher;
