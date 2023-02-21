import { useEffect, useState } from "react";

export default function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === "undefined") {
			return initialValue;
		}
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.warn(error);
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(storedValue));
		} catch (error) {
			console.warn(error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(storedValue)]);

	return [storedValue, setStoredValue] as const;
}
