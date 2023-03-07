export default function downscale(base64string: string, onSucced: (base64string: string) => void) {
	const img = new Image();
	img.src = base64string;

	img.onload = () => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		const MAX_WIDTH = 500
		let { width, height } = img;

      if (width <= 500) return onSucced(base64string);

      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height)

      return onSucced(canvas.toDataURL("image/jpeg"))
   };
}
