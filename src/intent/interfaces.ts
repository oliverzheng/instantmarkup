export enum LengthUnit {
	/** Be as small as possible. It must fit children. */
	SHRINK,

	/** Be as big as possible. It will take as much free space as it can. */
	EXPAND,

	/** Absolute # of pixels. */
	PIXELS,

	/** Percentage of the parent's length. */
	PERCENT,

	/** How many parts out of total number of parts of parent's length. */
	PARTS,
}


export interface Length {
	unit: LengthUnit;

	/** Value only if unit is one of PIXELS, PERCENT, or PARTS. */
	value?: number;
}

export var shrink: Length = {
	unit: LengthUnit.SHRINK
};

export var expand: Length = {
	unit: LengthUnit.EXPAND
};

export function px(value: number): Length {
	return {
		unit: LengthUnit.PIXELS,
		value: value,
	};
}

export function pct(value: number): Length {
	return {
		unit: LengthUnit.PERCENT,
		value: value,
	};
}

export function prt(value: number): Length {
	return {
		unit: LengthUnit.PARTS,
		value: value,
	};
}


/** Direction of children to stack. */
export enum Direction {
	/** Stack children horizontally. */
	HORIZONTAL,

	/** Stack children vertically. */
	VERTICAL,

	/** Children are positioned relative to parent's top left. */
	NONE,
}


/**
 * How children should be aligned for a given direction.
 *
 * This works by inserting one or more invisible children among the children and
 * setting its length to expand. Lengths of the real children (widths, margins)
 * have priority over these invisible children's; that is, these would only be
 * effective if there is free space left.
 */
export enum Alignment {
	/** Insert an invisible child at the end. */
	NEAR,

	/** Insert one invisible child at the beginning and one at the end. */
	CENTER,

	/** Insert one invisible child at the beginning. */
	FAR,

	/** Insert one invisible child between each child. */
	JUSTIFIED,
}


/** Wrapping of children when they exceed the parent's bounding box. */
export enum Wrap {
	/** Wrap children to the next line. */
	WRAP,

	/** Children extend beyond the parent's bounding box. */
	NOWRAP,
}


export interface Margin {
	l?: Length;
	r?: Length;
	t?: Length;
	b?: Length;
}


/**
 * Rectangle measured in absolute pixels.
 */
export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Box {
	/** Must be unique among its tree. */
	id?: string;

	/** Id of the extracted layer. */
	layerId?: string;

	parent?: Box;

	/** Bounding box of this collateral. */
	sizing?: {
		x?: Length;
		y?: Length;
	};

	/**
	 * Margin overlap; if two children have the same margin, the distance
	 * between them is that margin.
	 */
	margin?: Margin;

	wrap?: {
		x?: Wrap;
		y?: Wrap;
	};

	/**
	 * A string of text to use as child. If used, children must be null.
	 *
	 * Each word is treated like a child collateral.
	 */
	text?: {
		value: string;
	};

	direction?: Direction;

	alignment?: {
		x?: Alignment;
		y?: Alignment;
	};

	children?: Box[];
}
