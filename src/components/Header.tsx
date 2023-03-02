import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth, COLLECTION_NAME } from "../firebase-config";
import { UserProps } from "../Types";
import { ReactComponent as MenuIcon } from "./../assets/ellipsis-solid.svg";

type Props = {
	teachersLength: number;
	editMode: boolean | "NO";
	setEditMode?: (editMode: boolean) => void;
	queryText?: string;
	isQueryCode?: boolean;
	currentUser?: UserProps;
};

function Header({
	teachersLength,
	editMode,
	setEditMode,
	queryText,
	isQueryCode,
	currentUser,
}: Props) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isMenuOpen) {
			interval = setTimeout(() => {
				setIsMenuOpen(false);
			}, 5000);
		}
		return () => clearTimeout(interval);
	}, [isMenuOpen]);

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

			{editMode === "NO" && currentUser && (
				<div className="header-user">
					<div style={{ color: "#555" }}>
						Hello{" "}
						<span className="text-dark" style={{ fontWeight: "500" }}>
							{currentUser.name.split(" ").slice(0, 1)}
						</span>
					</div>
					<img
						src={currentUser.photo_url}
						alt={currentUser.name}
						className="profile-photo"
					/>
					<div className="menu-container flex-center">
						<MenuIcon
							style={{ fontSize: 32 }}
							onClick={() => setIsMenuOpen(v => !v)}
						/>
						{isMenuOpen && (
							<ul className="menu">
								<li>
									<button onClick={() => signOut(auth)}>
										Sign out
									</button>
								</li>
							</ul>
						)}
					</div>
				</div>
			)}
		</header>
	);
}

export default Header;
