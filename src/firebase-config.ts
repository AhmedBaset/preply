import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyB9EB5VHYTI8C66w8_oR_6M9bDUzndvXrg",
   authDomain: "view-preply-1.firebaseapp.com",
   projectId: "view-preply-1",
   storageBucket: "view-preply-1.appspot.com",
   messagingSenderId: "1008696431940",
   appId: "1:1008696431940:web:35cc026b4cd72ef33ef311"
};

//* Create `.env` file. Add keys and valuse in uppercase starts with 'REACT_APP_KEY_IN_UPPERCASE' and uncomment this variabe. remove the previous variable
// const firebaseConfig = {
// 	apiKey: process.env.REACT_APP_API_KEY,
// 	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
// 	projectId: process.env.REACT_APP_PROJECT_ID,
// 	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
// 	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
// 	appId: process.env.REACT_APP_APP_ID,
// 	measurementId: process.env.REACT_APP_MEASUREMENT_ID,
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication 
export const auth = getAuth(app)

// Initialize Firestore
export const db = getFirestore(app);

// Collection name
export const COLLECTION_NAME = "caio_collection_1";