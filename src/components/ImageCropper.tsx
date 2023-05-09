import { useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type Props = {
	imageUrl: string;
	setCroppedAreaPixels: React.Dispatch<React.SetStateAction<Area>>;
};

function ImageCropper({ imageUrl, setCroppedAreaPixels }: Props) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);

	return (
		<>
			<Cropper
				image={imageUrl}
				crop={crop}
				zoom={zoom}
				aspect={1 / 1}
				zoomWithScroll={true}
				cropShape="round"
				onCropChange={(e) => setCrop(e)}
				onZoomChange={(e) => setZoom(e)}
				onCropComplete={(_, pixels) => {
					setCroppedAreaPixels(pixels);
				}}
			/>
		</>
	);
}

export default ImageCropper;

export const cropImage = (imageUrl: string, croppedAreaPixels: Area) => {
	const image = new Image();
	image.src = imageUrl;

	const canvas = document.createElement("canvas");
	canvas.width = croppedAreaPixels.width;
	canvas.height = croppedAreaPixels.height;
	const ctx = canvas.getContext("2d");
	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;

	if (!ctx) return;

	const pixelRatio = window.devicePixelRatio;
	canvas.width = croppedAreaPixels.width * pixelRatio;
	canvas.height = croppedAreaPixels.height * pixelRatio;

	ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	ctx.imageSmoothingQuality = "high";

	ctx.drawImage(
		image,
		croppedAreaPixels.x * scaleX,
		croppedAreaPixels.y * scaleY,
		croppedAreaPixels.width * scaleX,
		croppedAreaPixels.height * scaleY,
		0,
		0,
		croppedAreaPixels.width,
		croppedAreaPixels.height
	);

	// Converting to base64
	const base64Image = canvas.toDataURL("image/jpeg");

	return base64Image;
};
