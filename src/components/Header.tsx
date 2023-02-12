import React from 'react'

type Props = {
   teachersLength: number;
   editMode: boolean;
   setEditMode: (editMode: boolean) => void;
}

function Header({teachersLength, editMode, setEditMode}: Props) {
   return (
		<header className="header">
			<p>{teachersLength} English teachers available</p>
			<label className="text-flex text-gray">
				<span>Edit Mode: </span>
				<input
					type="checkbox"
					checked={editMode}
					onChange={(e) => setEditMode(e.currentTarget.checked)}
				/>
			</label>
		</header>
	);
}

export default Header