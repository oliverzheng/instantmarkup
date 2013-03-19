export interface Layer {
	id: string;
	name: string;
	bbox: {
		x?: number;
		y?: number;
		w: number;
		h: number;
	};
	text?: {
		value: string;
	};
	children?: Layer[];
}
