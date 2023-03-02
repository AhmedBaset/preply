import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Authentication.module.scss";
import { ReactComponent as GoogleIcon } from "./../assets/google.svg";
import { ReactComponent as AppleIcon } from "./../assets/apple.svg";
import { ReactComponent as FacebookIcon } from "./../assets/facebook-f.svg";
import { ReactComponent as MailIcon } from "./../assets/envelope-regular.svg";
import { ReactComponent as PhoneIcon } from "./../assets/phone-solid.svg";
import {
	AuthProvider,
	ConfirmationResult,
	createUserWithEmailAndPassword,
	FacebookAuthProvider,
	GoogleAuthProvider,
	OAuthProvider,
	RecaptchaVerifier,
	signInWithPhoneNumber,
	signInWithPopup,
} from "firebase/auth";
import {
	getDownloadURL,
	ref,
	uploadBytesResumable,
	UploadTaskSnapshot,
} from "firebase/storage";
import { auth, db, storage } from "../firebase-config";
import codes from "./../phone-codes.json";
import countriesObj from "./../countries";
import languagesObj from "./../languages.json";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import ImageCropper, { cropImage } from "../components/ImageCropper";
import { Area } from "react-easy-crop";
import getCroppedImg from "../utilities/cropImage";
import { dataURLtoFile } from "../utilities/dataUrlToFile";
const registeration = require("./../settings.json").registeration;

const countries = Object.entries(countriesObj).map(([name]) => name);
const languages = Object.entries(languagesObj).map(([code, name]) => name);

const steps = {
	choose_provider: "CHOOSE_PROVIDER",
	email_and_password: "EMAIL_AND_PASSWORD",
	phone_number: "PHONE_NUMBER",
	otp: "OTP",
	profile_info: "PROFILE_INFO",
	upload_image: "UPLOAD_IMAGE",
	crop_image: "CROP_IMAGE",
	finish: "FINISH",
	close: "CLOSE",
};

type Props = {
	setIsSignOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function Authentication({ setIsSignOpen }: Props) {
	const [currentStep, setCurrentStep] = useState(
		// steps.choose_provider
		steps.upload_image
	);
	const [error, setError] = useState("");
	const [code, setCode] = useState(codes[0].dial_code);
	const [image, setImage] = useState<File>();
	const [croppedAreaPixels, setCroppedAreaPixels] = useState({} as Area);
	const [isImageUploading, setIsImageUploading] = useState(false);

	useEffect(() => {
		if (currentStep === steps.close) {
			setIsSignOpen(false);
		}
	}, [currentStep, steps.close]);

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (error) {
			interval = setTimeout(() => {
				setError("");
			}, 5000);
		}
		return () => clearTimeout(interval);
	}, [error]);

	const signInUsingProvider = async (provider: AuthProvider) => {
		try {
			await signInWithPopup(auth, provider);
		} catch (err: any) {
			setError(err.message);
			return;
		}
		setCurrentStep(steps.profile_info);
	};

	const signInUsingEmailAndPassword = async (
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		const email = e.currentTarget.email.value;
		const password = e.currentTarget.password.value;

		try {
			await createUserWithEmailAndPassword(auth, email, password);
		} catch (err: any) {
			setError(err.message);
			return;
		}
		setCurrentStep(steps.profile_info);
	};

	let phoneCredential: ConfirmationResult;
	const signInUsingPhoneNumber = async (
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		const phoneNumber = `${code}${e.currentTarget.phoneNumber.value}`;
		const recapcha = new RecaptchaVerifier(
			"sign-in-button",
			{ size: "invisible" },
			auth
		);

		try {
			phoneCredential = await signInWithPhoneNumber(
				auth,
				phoneNumber,
				recapcha
			);
		} catch (err: any) {
			setError(err.message);
			return;
		}
		setCurrentStep(steps.otp);
	};

	const verifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const otp = e.currentTarget.otp.value;

		try {
			await phoneCredential.confirm(otp);
		} catch (err: any) {
			setError(err.message);
			return;
		}
		setCurrentStep(steps.profile_info);
	};

	const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const name = e.currentTarget.userName.value;
		const email = e.currentTarget.email.value;
		const country = e.currentTarget.country.value;
		const language = e.currentTarget.language.value;
		const birthday = e.currentTarget.birthday.valueAsDate;
		const gender = e.currentTarget.gender.value;

		if (!auth.currentUser) return;
		const docRef = doc(db, "users", auth.currentUser.uid);

		try {
			await setDoc(docRef, {
				name,
				email,
				country,
				language,
				birthday: Timestamp.fromDate(birthday),
				gender,
				photo_url: "",
			});
		} catch (err: any) {
			setError(err.message);
			return;
		}
		setCurrentStep(steps.upload_image);
	};

	const uploadImage = async () => {
		if (!image || !auth.currentUser) return;
		setIsImageUploading(true);

		const base64Image = await getCroppedImg(
			URL.createObjectURL(image),
			croppedAreaPixels
		);
		const imageFile = dataURLtoFile(
			base64Image,
			auth.currentUser?.uid || "image"
		);

		const imageRef = ref(
			storage,
			`profile_photos/${auth.currentUser?.uid}.jpeg`
		);

		let uploadState: UploadTaskSnapshot;
		try {
			uploadState = await uploadBytesResumable(imageRef, imageFile);

			const docRef = doc(db, "users", auth.currentUser.uid);
			const imageUrl = await getDownloadURL(imageRef);
			setDoc(docRef, { photo_url: imageUrl });
		} catch (err: any) {
			setError(err.message);
			return;
		} finally {
			setIsImageUploading(false);
		}

		if (uploadState.state === "success") {
			setCurrentStep(steps.finish);
		}
	};

	return createPortal(
		<div className={styles.container}>
			<div className={styles.wrapper}>
				{error && <div className={styles.error}>{error}</div>}
				{currentStep === steps.choose_provider ? (
					<div className={styles.list}>
						<h2 className="text-center">Sign up</h2>

						<button
							onClick={() =>
								signInUsingProvider(new GoogleAuthProvider())
							}
							className={`${styles.button} ${styles.button_grid} ${styles.Google}`}
						>
							<GoogleIcon />
							<span>Sign in with Google</span>
						</button>

						{/* <button
							onClick={() =>
								signInUsingProvider(new FacebookAuthProvider())
							}
							className={`${styles.button} ${styles.button_grid} ${styles.Facebook}`}
						>
							<FacebookIcon />
							<span>Sign in with Facebook</span>
						</button>

						<button
							onClick={() =>
								signInUsingProvider(new OAuthProvider("apple.com"))
							}
							className={`${styles.button} ${styles.button_grid} ${styles.Apple}`}
						>
							<AppleIcon />
							<span>Sign in with Apple</span>
						</button> */}

						<button
							onClick={() => setCurrentStep(steps.email_and_password)}
							className={`${styles.button} ${styles.button_grid} ${styles.Email}`}
						>
							<MailIcon />
							<span>Sign in with Email</span>
						</button>

						<button
							onClick={() => setCurrentStep(steps.phone_number)}
							className={`${styles.button} ${styles.button_grid} ${styles.Phone}`}
						>
							<PhoneIcon />
							<span>Sign in with Phone number</span>
						</button>
					</div>
				) : currentStep === steps.email_and_password ? (
					<form
						className={styles.list}
						onSubmit={signInUsingEmailAndPassword}
					>
						<h2 className="text-center">Sign up with Email</h2>

						<div>
							<label htmlFor="email">Email</label>
							<input
								name="email"
								id="email"
								placeholder="someone@example.com"
								required
								pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z0-0]{2,8}"
								type="text"
								className={styles.input}
							/>
						</div>

						<div>
							<label htmlFor="password">Password</label>
							<input
								name="password"
								id="password"
								placeholder="********"
								required
								type="text"
								className={styles.input}
							/>
						</div>

						<button type="submit" className={styles.button}>
							Sign up
						</button>
					</form>
				) : currentStep === steps.phone_number ? (
					<form className={styles.list} onSubmit={signInUsingPhoneNumber}>
						<h2 className="text-center">Sign up with Phone Number</h2>

						<div className="flex-center gap">
							<select
								name="code"
								className={styles.input}
								style={{ width: "70px", paddingInline: ".1rem" }}
								defaultValue={codes[0].dial_code}
								onChange={(e) => {
									setCode(e.target.value);
								}}
							>
								{codes.map(({ name, dial_code }) => (
									<option key={name} value={dial_code}>
										{name}
									</option>
								))}
							</select>
							<div className="flex-auto flex-center gap">
								<span>{code}</span>
								<input
									name="phoneNumber"
									placeholder="Enter the phone number"
									required
									pattern="^[0-9-+\s]+$"
									type="text"
									className={`${styles.input} flex-auto`}
								/>
							</div>
						</div>

						<button
							type="submit"
							className={styles.button}
							id="sign-in-button"
						>
							Send OTP
						</button>
					</form>
				) : currentStep === steps.otp ? (
					<form className={styles.list} onSubmit={verifyOtp}>
						<h2 className="text-center">Verify your phone number</h2>
						<p className="text-gray">
							We have sent a verification code for your phone number.
						</p>

						<div>
							<input
								name="otp"
								placeholder="OTP"
								required
								type="text"
								className={styles.input}
							/>
						</div>

						<button type="submit" className={styles.button}>
							Verify
						</button>
					</form>
				) : currentStep === steps.profile_info ? (
					<form className={styles.list} onSubmit={updateProfile}>
						<h2 className="text-center">Profile Info</h2>

						<div>
							<label htmlFor="name">Name</label>
							<input
								name="userName"
								id="name"
								placeholder="John Doe"
								defaultValue={auth.currentUser?.displayName || ""}
								required
								type="text"
								className={styles.input}
							/>
						</div>

						<div>
							<label htmlFor="email">Email</label>
							<input
								name="email"
								id="email"
								placeholder="John Doe"
								defaultValue={auth.currentUser?.email || ""}
								required
								type="text"
								className={styles.input}
							/>
						</div>

						<div>
							<label htmlFor="country">Country</label>
							<select
								name="country"
								id="country"
								required
								className={styles.input}
							>
								{countries.map((country) => (
									<option key={country} value={country}>
										{country}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="language">Native language</label>
							<select
								name="language"
								id="language"
								required
								className={styles.input}
							>
								{languages.map((language) => (
									<option key={language} value={language}>
										{language}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="gender">Gender</label>
							<select
								name="gender"
								id="gender"
								required
								className={styles.input}
							>
								{["None", "Male", "Female"].map((gender) => (
									<option key={gender} value={gender}>
										{gender}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="birthday">Birthday</label>
							<input
								name="birthday"
								id="birthday"
								required
								placeholder="Birthday"
								type="date"
								className={styles.input}
							/>
						</div>

						<button type="submit" className={styles.button}>
							Update Profile Information
						</button>
					</form>
				) : currentStep === steps.upload_image ? (
					<div className={styles.list}>
						<h2 className="text-center">Profile photo</h2>
						<div
							className="flex-center"
							style={{ marginBottom: "100px" }}
						>
							<div className={styles.upload_image}>
								<span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 512 512"
									>
										<path d="M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
									</svg>
								</span>
							</div>
						</div>
						<label htmlFor="upload_image">
							<span className={styles.button}>Upload photo</span>
							<input
								type="file"
								accept="image/*"
								id="upload_image"
								style={{ display: "none" }}
								onChange={(e) => {
									if (e.target.files?.[0]) {
										setImage(e.target.files[0]);
										setCurrentStep(steps.crop_image);
									}
								}}
							/>
						</label>
						<button
							onClick={() => setCurrentStep(steps.finish)}
							className={styles.button_skip}
						>
							Skip
						</button>
					</div>
				) : currentStep === steps.crop_image && image ? (
					<div className={styles.list}>
						<h2 className="text-center">Crop your photo</h2>
						<div style={{ position: "relative", height: "250px" }}>
							<ImageCropper
								imageUrl={URL.createObjectURL(image)}
								setCroppedAreaPixels={setCroppedAreaPixels}
							/>
						</div>
						<button className={styles.button} onClick={uploadImage}>
							{isImageUploading ? "Uploading" : "Done"}
						</button>
					</div>
				) : currentStep === steps.finish ? (
					<div className="flex-center flex-col" style={{ gap: "1rem" }}>
						<h2>Registeration Completed</h2>
						<p style={{ color: "#333" }}>{registeration.text}</p>
						<button
							onClick={() => {
								setCurrentStep(steps.close);
								window.open(registeration.button_url);
							}}
							className={`${styles.button}`}
							style={{ width: "auto" }}
						>
							{registeration.button_text}
						</button>
					</div>
				) : (
					<></>
				)}
			</div>
		</div>,
		document.getElementById("portal")!
	);
}

export default Authentication;
