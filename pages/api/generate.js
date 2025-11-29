export default function handler(req, res) {
  const mock = {
    rationale: "Mock: Scandinavian neutrals for EU market.",
    palette: ["#F7F5F2", "#D9D6D1", "#9AA6A3", "#C4A69F"],
    products: [
      "Linen napkin - oatmeal stripe",
      "Herringbone placemat - natural",
      "Sage runner - micro-check",
      "Set of 3 kitchen towels - thin stripes"
    ]
  };
  res.status(200).json(mock);
}