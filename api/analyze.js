export default function handler(req, res) {
  res.status(200).json({
    name: "Sample Clothing Item",
    category: "Shirt",
    color: "Black",
    style: "Casual",
    occasion: "Everyday",
    tags: ["sample", "closet", "casual"]
  });
}
