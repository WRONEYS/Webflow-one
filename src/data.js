export const places = [
  {
    name: "Quiet stair",
    image: "/images/stair.jpg",
    alt: "Concrete stair in a dim brutalist interior, used as a preview room",
  },
  {
    name: "Light well",
    image: "/images/atrium.jpg",
    alt: "Black and white view up through a stone and glass atrium",
  },
  {
    name: "North room",
    image: "/images/living.jpg",
    alt: "Pale living room with a timber stair and a long window",
  },
  {
    name: "Brick bay",
    image: "/images/loft.jpg",
    alt: "Loft with brick walls, a dark sofa, and tall windows",
  },
  {
    name: "White court",
    image: "/images/apartment.jpg",
    alt: "White apartment interior with a sofa, table, and kitchen",
  },
  {
    name: "West block",
    image: "/images/house.jpg",
    alt: "Modern white house with dark bands and glass balconies",
  },
  {
    name: "Glass edge",
    image: "/images/balconies.jpg",
    alt: "Close view of stacked glass balconies on a white facade",
  },
];

export const satellites = [
  { src: "/images/living.jpg", alt: "", dx: -1, dy: -0.4, pos: "a" },
  { src: "/images/loft.jpg", alt: "", dx: -1.1, dy: 0.8, pos: "b" },
  { src: "/images/apartment.jpg", alt: "", dx: -0.2, dy: 1, pos: "c" },
  { src: "/images/tower.jpg", alt: "", dx: 0.8, dy: -1, pos: "d" },
  { src: "/images/shells.jpg", alt: "", dx: 1.1, dy: -0.2, pos: "e" },
  { src: "/images/house.jpg", alt: "", dx: 1, dy: 0.9, pos: "f" },
];

export const objects = [
  {
    name: "Folded cloth",
    index: "I",
    image: "/images/marble.jpg",
    alt: "Close view of a marble sculpture, folded drapery and a hand",
    note: "Cut from a single block and left in the room where it was finished.",
  },
  {
    name: "Gathered stones",
    index: "II",
    image: "/images/pebbles.jpg",
    alt: "Close view of smooth river pebbles in grey, blue, and rust",
    note: "Collected on site, then set loose so they can travel without the room.",
  },
  {
    name: "Cool joint",
    index: "III",
    image: "/images/atrium.jpg",
    alt: "Detail of stone panels and a glass roof joint",
    note: "A junction photographed once, then released as its own piece.",
  },
  {
    name: "Stair mass",
    index: "IV",
    image: "/images/stair.jpg",
    alt: "The mass of a concrete stair, photographed as an object",
    note: "The stair stays. This record of its weight does not.",
  },
];

export const updates = [
  {
    kicker: "Room note",
    title: "Quiet stair — described",
    body: "The stair is written into the preview as open. This is a page note, not a live status.",
    image: "/images/stair.jpg",
    alt: "Concrete stair used beside a preview note",
  },
  {
    kicker: "Piece note",
    title: "Folded cloth — described",
    body: "The marble piece is shown as already out in the world. Nothing here was released.",
    image: "/images/marble.jpg",
    alt: "Marble drapery used beside a preview note",
  },
  {
    kicker: "Study note",
    title: "North room — arranging",
    body: "The north room is still only a photograph in this sequence. It is not a workplace.",
    image: "/images/living.jpg",
    alt: "Pale interior used beside a preview note",
  },
];

export const roles = [
  {
    title: "Material",
    body: "Looks at how a surface holds light. A role in the preview, not a person.",
  },
  {
    title: "Sequence",
    body: "Orders the rooms on this page. A role in the preview, not a person.",
  },
  {
    title: "Threshold",
    body: "Reads the admission note. A role in the preview, not a person.",
  },
];
