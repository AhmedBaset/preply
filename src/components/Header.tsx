import React from 'react'

type Props = {
   teachersLength: number;
   editMode: boolean | "NO";
	setEditMode?: (editMode: boolean) => void;
	queryText?: string
}

function Header({teachersLength, editMode, setEditMode, queryText}: Props) {
   return (
		<header className="header">
			<p>{teachersLength} English teachers available</p>

			{queryText && <code className='flex-auto'>{queryText}</code>}

			{editMode !== "NO" && <label className="text-flex text-gray">
				<span>Edit Mode: </span>
				<input
					type="checkbox"
					checked={editMode}
					onChange={(e) => setEditMode && setEditMode(e.currentTarget.checked)}
				/>
			</label>}
		</header>
	);
}

export default Header