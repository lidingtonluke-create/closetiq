export default async function handler(req, res) {
  return res.status(200).json({
    name: "Test Clothing Item",
    category: "Hoodie",
    color: "Red/Black",
    style: "Casual",
    occasion: "Everyday",
    tags: ["test", "clothing", "casual"]
  });
}
