import React, { useEffect, useState } from "react";

type Props = {
	teachersLength: number;
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>
};

function Footer({ teachersLength, currentPage, setCurrentPage }: Props) {
	const [pagesCount, setPagesCount] = useState(0);

	useEffect(() => {
		setPagesCount(Math.ceil(teachersLength / 10));
	}, [teachersLength]);

   const previousListItems = [];
   const nextListItems = [];

   if (currentPage > 1) {
      for (let i = currentPage - 1; i > currentPage - 3; i--) {
         if (i > 0) {
            previousListItems.unshift(
               <li key={`previous-${i}`}><Button text={i.toString()} onClick={()=> setCurrentPage(i)} /></li>
            )
         }
      }
      if (currentPage - 2 > 1) {
         previousListItems.unshift(
				<li key={`previous-more`}>
					<Button
						text="..."
						onClick={() => setCurrentPage(currentPage - 3)}
					/>
				</li>
			);
      }
   }
   if (currentPage < pagesCount) {
      for (let i = currentPage + 1; i < currentPage + 3; i++) {
         if (i <= pagesCount) {
            nextListItems.push(
               <li key={`next-${i}`}><Button text={i.toString()} onClick={() => setCurrentPage(i)} /></li>
            )
         }
      }
      if (currentPage + 3 < pagesCount) {
         nextListItems.push(
            <li key={`next-more`}><Button text='...' onClick={() => setCurrentPage(currentPage + 3)} /></li>
         )
      }
   }

	return (
		<footer>
         <ul>
            {currentPage > 1 && (
               <li key={`previous-btn`}><Button text='<' onClick={()=> setCurrentPage(val => val - 1)} /></li>
            )}

            {previousListItems.map(Link => Link)}

            <li key={`current`}><Button text={currentPage.toString()} onClick={() => setCurrentPage(currentPage)} isActive={true} /></li>

            {nextListItems.map(Link => Link)}

            {(pagesCount > 1 && currentPage <= pagesCount - 3) && (
                  <li key={`last-page`}><Button text={pagesCount.toString()} onClick={() => setCurrentPage(pagesCount)} /></li>
            )}

            {currentPage < pagesCount && (
               <li key={`next-page`}><Button text='>' onClick={()=> setCurrentPage(val => val + 1)} /></li>
            )}
         </ul>
		</footer>
	);
}

function Button({ text, onClick, isActive }: { text: string, onClick: () => void, isActive?: boolean }) {
   return (
      <button className={`footer-button ${isActive && "active"}`} onClick={(onClick)}>
         {text}
      </button>
   )
}

export default Footer;
