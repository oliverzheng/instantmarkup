# HTML Conversion #

A design intent must be converted to semantic HTML markup. Semantic in this case
means using the right tags for the right nodes.

There are 3 cases for siblings in a parent:

- Children are vertically aligned
- Children are horizontally aligned
- Children are not aligned

The first two cases can be implemented by stacking HTML containers sequentially.

## Stacks ##

Vertical stack is the default stacking behavior for block elements; horizontal
containers can be implemented with inline-blocks.

Children in the stack may be (mostly) aligned:

- left / top
- center / middle
- right / bottom

Vertical stacks can be aligned with text-align on the parent; horizontal stacks
can be aligned with vertical-align on the children.

For children that do not align, they need margins. The parent uses padding for
the minimum of all edge margins of children, and the children that need margins
beyond that can use margin. This alternates padding and margin down the
hierarchy so that margin collapse does not happen.

The parent is not explicitly sized - it’ll expand to as big as the children need
it to be.

When there is only 1 child, use stacks.

## Non-stacks ##

These must be absolutely positioned within the parent. It’ll use left when it’s
more to the left than right, etc.

## Text ##

Text line-heights must be calculated exactly.

(Until the PSD exporter can read line height information, we’ll need to size the
height of a text box explicitly.)

## Images ##

For any layer that has no text descendents, export the whole image as a bitmap.

If a layer has no text below it (z-order wise) and is at the top, then this is
likely an image, instead of a design element. Use the <img> tag. Otherwise, use
the image as a background.
