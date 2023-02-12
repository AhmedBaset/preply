import React from "react";
import { createPortal } from "react-dom";
import { TeacherType } from "../Types";

function ModalComponent({
	name,
	inputType,
	teacher,
	setModal,
	setTeacher,
}: {
	name: string;
	inputType: string;
	teacher: TeacherType;
	setModal: React.Dispatch<
		React.SetStateAction<null | {
			key: string;
			type: string;
		}>
	>;
	setTeacher: React.Dispatch<React.SetStateAction<TeacherType>>;
}) {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setModal(null);
	};
	const [description, setDescription] = React.useState(teacher.description);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let v = {};
		if (inputType === "number") {
			v = {
				[name as keyof typeof teacher]: parseInt(e.currentTarget.value),
			};
		} else if (inputType === "checkbox") {
			v = {
				[name as keyof typeof teacher]: e.currentTarget.checked,
			};
		} else {
			v = {
				[name as keyof typeof teacher]: e.currentTarget.value,
			};
		}

		setTeacher((teacher) => ({
			...teacher,
			...v,
		}));
	};

	React.useEffect(() => {
		setTeacher((teacher) => ({
			...teacher,
			description: description,
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [description]);

	return createPortal(
		<div className="modal-overlay">
			<form onSubmit={handleSubmit} className="modal">
				<div className="modal-header">{name}</div>
				<div className="modal-body">
					{inputType !== "textarea" ? (
						<input
							type={inputType === "checkbox" ? "checkbox" : "text"}
							autoFocus={true}
							defaultValue={
								(teacher[name as keyof typeof teacher] as
									| string
									| number) || ""
							}
							defaultChecked={
								inputType === "checkbox" &&
								(teacher[name as keyof typeof teacher] as boolean)
							}
							onChange={handleInputChange}
							placeholder={name}
						/>
					) : (
						<textarea
							autoFocus={true}
							value={description}
							style={{ height: 300 }}
							onChange={(e) => {
								setDescription(e.target.value);
							}}
							placeholder={name}
						></textarea>
					)}
				</div>
				<div className="modal-footer">
					<button type="submit" className="btn btn-primary">
						Ok
					</button>
				</div>
			</form>
		</div>,
		document.getElementById("modal")!
	);
}

export default ModalComponent;
