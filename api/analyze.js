export default function handler(req, res) {
  res.status(200).json({
    name: "Black Hoodie",
    category: "Hoodie",
    color: "Black",
    style: "Streetwear",
    occasion: "Casual",
    tags: ["hoodie", "casual", "streetwear"],
  });
}
