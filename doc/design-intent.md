# Discovering Design Intent #

In order to convert a pixel-based layout to semantic HTML, the intent of the
design must be codified. Semantic HTML is a human understandable tree structure
that corresponds loosely to the visual representation of information. This
implies that visual data is also a tree structure. Thus, discovering the intent
is an exercise in extracting parent/sibling relationships out of the layout.

HTML and CSS are quirky. There are certain design intentions that require
"hacks" in markup to achieve. An intermediate representation of design intent is
used to describe visually what should be layed out, while retaining semantics of
data. This can then be translated to HTML markup. There are several reasons for
this:

- It is a canonical representation of the layout: there should only be one way
  to describe a layout, unlike HTML which can be coded many ways. This makes it
  easy to reason about, e.g. whether or not the design intent is correct.
- In the case that design intent cannot be fully and accurately discovered, the
  user may assist in defining what the intent is. It is easier to manipulate
  visually simple and obvious structures than HTML elements that have many
  positioning rules.
- It is not restricted to the mostly vertically-flowing layouts that HTML/CSS is
  intended for; this layer treats horizontal and vertical objects the same.
- Different browsers may require different HTML/CSS to achieve the same visual
  effect; having a canonical layout allows for different "markup translators".

HTML rendering is suited for stacking and flowing siblings. Stacked siblings
have display: (inline-)block. A stack of siblings have a direction, and the
position of a container along that direction depends on its predecessor's
position. Each container is a rectangle.

Flowing siblings have display: inline. Inline elements are not necessarily
rectangles, as their contents flow in multiple lines. For each inline element,
there is a flowing direction. For each element inside the inline, its position
along the flowing direction depends on that of its predecessor, like block
elements. In addition, its position in the direction perpendicular to the
flowing direction can also be specified. This is primarily used for text, where
the width of a character is determined at runtime.

The abstraction of the visual layout unifies the two. Each node in the tree may
have children. There is a direction in which the children follow each other. In
case of overflow, children may wrap. How children align within a wrapped line is
specified in the parent container.

The approach here is practical. There is a plethora of web designs that
certainly contain design intentions not described here. In order to build the
best intent discovery, the process will need to be iterative and incremental.
Each design intent should thus be as independent of others as possible and have
as few false positives as possible. There shouldn't ever be a case when multiple
intent rules clash and there is undefined behavior.


## Input Requirements ##

To discover intents, the input to the discovery has to be constrained. Photoshop
has layers, each of which has pixels at arbitrary locations. The requirements
are so that we can reason about an abstraction of pixels, and to dictate bitmap
exports of a subset of these efficiently.

### Boxes ###

If the pixels of a layer are mostly part of rectangle, then this layer is
represented as a box with the boundaries of the pixels. If the layer has
separate connected regions of pixels, they are treated as separate layers.

If pixels do not form a rectangle, they are still represented as a box, but are
marked that they are not rectangular.

### Visibility ###

If all pixels of a box are visible (there are no pixels laid on top), then
awesome. If pixels are covered completely by another box, then this box should
be truncated to to fit the visible pixels of the box.

### Opacity ###

If there is a stack of overlapping boxes that have partially transparent pixels
(i.e. together, they form the desired result), each of these boxes points to the
same identifier so that they can be correlated.

### Transparent Edges ###

If a box is a gradient from opaque to transparent, the transparent edge should
be indicated as such, so that intent calculations do not take into account that
edge.

### Text ###

A text box in Photoshop can be a single line of text, or a box of text that may
one or multiple lines of text. In addition to the bounding box, these values
must be exported:

- Value of text
- Whether or not it's a single run, or a boxed area
- If a boxed area, the line breakdown of the text
- Alignment
- Font and text properties

In addition, each character should have a box associated with it. People often
use text as an implicit way to layout structure data, e.g. by putting 5 spaces
between words to indicate a menu.

### Optimizations ###

If a layer has common visual features, they should be indicated to ease final
markup output. Examples include:

- All layer effects: drop shadow, glow, stroke, etc.
- Rounded corners
- Linear/radial gradient fill
- Repeating patterns


## Intents ##

When viewing a visual layout, each piece of the layout is related somehow to the
rest of the layout; the key is to find the hierarchical relationship.

The heuristic described in this document is meant only for web-based design.
Most times, these designs share the following traits:

- Textual and image data are bound to rectangular shapes and alignment.
- The content is meant to deliver a message, and thus is organized for clarity,
  as opposed to artistic renderings.
- There are patterns of design that have become user expectations, such as
  header, site menu, footer, sidebar, etc.

Many characteristics of web design can be summed up with the CRAP design
principles: contrast, repetition, alignment, and proximity. These are the
guiding principles on which heuristics are based.

A tree is defined as a series of nodes where each node has optionally one
parent. An implied property of this is that each node has siblings. The goal is
to find sibling and parent relationships. Here are examples of design elements
and their design intent that heuristics must be able to extract.


### Finding Siblings ###

Given a non-overlapping list of boxes, siblings can be found by finding stacks
of boxes. The algorithm entails two parts:

- Finding a stack: a stack of boxes have their left/right or top/bottom edges in
  increasing positions.
- Finding a divider: a list of boxes that are one stack must have a containment
  relationship, assuming everything is composed of stacks. Thus, we need to find
  the divider that separates the stacks. A divider is whitespace that goes from
  edge to edge. This divider's area should be maximized.

When the input list of boxes is a stack, then we've found the relationship.
Otherwise, find dividers. For the divider(s) with the biggest area, split the
list of boxes at these divisions and make them a stack of list of boxes.


### Parent by Containment ###

    +-----------+
    |     A     |
    | +-------+ |
    | |   B   | |
    | +-------+ |
    +-----------+

A is B's parent.

### Parent Decorations ###

      +-------+
      |   A   |
      +-------+
    +-----------+
    | +-------+ |
    | |   C   | | <--B
    | +-------+ |
    +-----------+
      +-------+
      |   D   |
      +-------+

A, C, and D are siblings. B, even though it contains C, is a contrasting element
that emphasizes C, and should be C's child. B is a decoration element.

Once determined that an element is decoration, it is not taken into account
future intent discovery, unless it's with other decoration elements. There are
two side-effects:

1. The decoration element do not affect other intents.
2. It's taken out of the rendering process, and does not impact visual layout of
   its parent or its parent's children (which are the decoration element's
   siblings, but they do not interact, so they are more like half siblings).

A parent decoration is discovered by identifying a list of siblings (A, D) that
have the same hierarchy, and there is another element (C) visually within this
list that shares the same structure. When this happens, C's parent is pushed
down as C's child to become a decoration.

Same hierarchy is defined as having the same properties and children having the
same hierarchy.

### Sibling Decorations ###

          +---------+
          |    A    |
          +---------+
    +---+ +---------+
    | D | |    B    |
    +---+ +---------+
          +---------+
          |    C    |
          +---------+

(This is used as a tie breaker for sibling detection.)

Here, A, B, and C are siblings. B and D are also siblings, but D is not siblings
with A or C. D is B's decoration; B is not D's decoration because a sibling
decoration should not be bigger than the thing it's decorating.

This is detected when an element wants to be siblings with an element that is
already with other siblings. When this happens, the element in the visually
bigger list gets to stay in that list; the other element becomes a decoration.

### Tables ###

A table is a list of elements of the same structure, but with opposing
directions.


## Algorithm ##

Given a list of boxes, each of which has their size and position, the algorithm
to find the hierarchy is as follows.

- Find all non-overlapping boxes.
- Run stack siblings, edge-contained siblings, and finally parent by
  containment.
- Repeat, but now, a box that contains children is not overlapped by its
  children anymore.


### Evaluating Extracted Intentions ###

There needs to be a measure of whether extracted intentions are good enough.

### Alternative Uses ###

The intentions of a layout can be discovered deterministically. If discovered
intentions are insufficient, either the heuristics need improvement, or the
design simply lacks the principles the heuristics are based on. In other words,
failure to apply these heuristics may indicate a lack of "good design". The same
engine may be used to help designers in both expressing their intent and in
instructing them lack thereof.
