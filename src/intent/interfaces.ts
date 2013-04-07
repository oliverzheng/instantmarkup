/**
 * Units of measurement for boxes and their children.
 */
export enum LengthUnit {
	/**
	 * Absolute # of pixels.
	 *
	 * Setting this never changes the length.
	 */
	PIXELS,

	/**
	 * Percentage of the parent's length.
	 *
	 * This unit depends on the parent's computed length. It does not change the
	 * parent's length (or other children's lengths if they depend on the
	 * parent).
	 */
	PERCENT,

	/**
	 * How many parts out of a parent's free space this takes.
	 *
	 * Besides pixel and percent based children, the free space left over is
	 * divided into parts - as many as the sum of all part based children.
	 *
	 * E.g. A child requesting 2 parts and a child requesting 3 parts from
	 * a parent that contains another child requesting 50% will each get 20% and
	 * 30%.
	 *
	 * This unit depends on the parent's computed length and does not change it.
	 */
	PARTS,

	/**
	 * Be as big as possible.
	 *
	 * If the parent has space left over after pixel, percent, and parts based
	 * children, the remaining space is left to expansive children. Each one has
	 * "1 part" in the remaining space to divvy up.
	 *
	 * This unit depends on the parent's computed length and does not change it.
	 */
	EXPAND,

	/**
	 * Be as small as possible. It must fit all children.
	 *
	 * The length is dependent on children lengths. When it contains lengths
	 * that depend on parent lengths, the parent of this length is used.
	 *
	 * E.g. In the hierarchy:
	 * - 100px
	 *   - shrink
	 *     - 50%
	 *
	 * The 50% is calculated on 100px.
	 */
	SHRINK,
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

export var defaultLength = shrink;

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
	w?: Length;
	h?: Length;

	/**
	 * Absolute position from the parent. These are taken out of the layout
	 * loop.
	 *
	 * Only pixels and percent can be used, since children do not interact with
	 * each other.
	 */
	absolute?: {
		l?: Length;
		r?: Length;
		t?: Length;
		b?: Length;
	};

	xWrap?: Wrap;
	yWrap?: Wrap;

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
