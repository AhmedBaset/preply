import React from "react";
import { COLLECTION_NAME } from "../firebase-config";

type Props = {
	teachersLength: number;
	editMode: boolean | "NO";
	setEditMode?: (editMode: boolean) => void;
	queryText?: string;
	isQueryCode?: boolean;
};

function Header({
	teachersLength,
	editMode,
	setEditMode,
	queryText,
	isQueryCode,
}: Props) {
	return (
		<header className="header">
			<p>{teachersLength} English teachers available</p>

			{isQueryCode && (
				<code className="flex-auto">{`query(collection("${COLLECTION_NAME}")${
					queryText && `, ${queryText}`
				})`}</code>
			)}

			{editMode !== "NO" && (
				<label className="text-flex text-gray">
					<span>Edit Mode: </span>
					<input
						type="checkbox"
						checked={editMode}
						onChange={(e) =>
							setEditMode && setEditMode(e.currentTarget.checked)
						}
					/>
				</label>
			)}
		</header>
	);
}

export default Header;
