import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const categories = [
  "Shirt",
  "Sweatshirt",
  "Hoodie",
  "Pants",
  "Shorts",
  "Shoes",
  "Activity Clothes",
  "Jacket",
  "Hat",
  "Accessory",
];

const blankForm = {
  name: "",
  category: "Shirt",
  color: "",
  style: "",
  occasion: "",
  tags: "",
};

function App() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [outfit, setOutfit] = useState([]);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    const saved = localStorage.getItem("closetItems");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("closetItems", JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((item) => item.category === filter);
  }, [items, filter]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFile(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    function handleFile(e) {
  const selected = e.target.files[0];
  if (!selected) return;

  setFile(selected);

  const reader = new FileReader();

  reader.onloadend = () => {
    setImage(reader.result);
  };

  reader.readAsDataURL(selected);
}
  }

  async function analyzeClothing() {
    if (!file) return alert("Upload a clothing picture first.");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("image", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: data,
      });

      const ai = await res.json();
      if (!res.ok) throw new Error(ai.error || "AI failed.");

      setForm({
        name: ai.name || "",
        category: categories.includes(ai.category) ? ai.category : "Shirt",
        color: ai.color || "",
        style: ai.style || "",
        occasion: ai.occasion || "",
        tags: Array.isArray(ai.tags) ? ai.tags.join(", ") : "",
      });
    } catch (err) {
      alert(err.message || "AI failed to analyze the clothing.");
    } finally {
      setLoading(false);
    }
  }

  async function removeBackground() {
    if (!file) return alert("Upload a clothing picture first.");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("image", file);

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Background removal failed.");
      setImage(result.image);
    } catch (err) {
      alert(err.message || "Background removal failed.");
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    if (!image || !form.name.trim()) {
      return alert("Add a picture and item name first.");
    }

    const newItem = {
      id: crypto.randomUUID(),
      image,
      ...form,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      wornCount: 0,
      dateAdded: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setFile(null);
    setImage("");
    setForm(blankForm);
  }

  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id));
    setOutfit(outfit.filter((item) => item.id !== id));
  }

  function markWorn(id) {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, wornCount: item.wornCount + 1 } : item
      )
    );
  }

  function getRandom(category) {
    const filtered = items.filter((item) => item.category === category);
    if (!filtered.length) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  function generateOutfit(type) {
    let result = [];

    if (type === "activity") {
      result = [
        getRandom("Activity Clothes"),
        getRandom("Shorts") || getRandom("Pants"),
        getRandom("Shoes"),
      ];
    } else if (type === "cold") {
      result = [
        getRandom("Hoodie") || getRandom("Sweatshirt"),
        getRandom("Pants"),
        getRandom("Shoes"),
        getRandom("Jacket"),
        getRandom("Hat") || getRandom("Accessory"),
      ];
    } else {
      result = [
        getRandom("Shirt") || getRandom("Hoodie") || getRandom("Sweatshirt"),
        getRandom("Pants") || getRandom("Shorts"),
        getRandom("Shoes"),
        getRandom("Jacket"),
        getRandom("Accessory"),
      ];
    }

    setOutfit(result.filter(Boolean));
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">AI wardrobe app</p>
          <h1>ClosetIQ</h1>
          <p>Upload clothes, organize your closet, and build outfits fast.</p>
        </div>
        <div className="stat-box">
          <strong>{items.length}</strong>
          <span>closet items</span>
        </div>
      </header>

      <section className="card">
        <h2>Add Clothing</h2>
        <input type="file" accept="image/*" onChange={handleFile} />

        {image && <img className="preview" src={image} alt="preview" />}

        <div className="button-row">
          <button onClick={analyzeClothing} disabled={loading}>AI Analyze</button>
          <button onClick={removeBackground} disabled={loading}>Remove Background</button>
        </div>

        {loading && <p className="loading">Working...</p>}

        <input name="name" placeholder="Item name" value={form.name} onChange={handleChange} />
        <select name="category" value={form.category} onChange={handleChange}>
          {categories.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
        <input name="color" placeholder="Color" value={form.color} onChange={handleChange} />
        <input name="style" placeholder="Style, like casual or streetwear" value={form.style} onChange={handleChange} />
        <input name="occasion" placeholder="Occasion, like school, gym, going out" value={form.occasion} onChange={handleChange} />
        <input name="tags" placeholder="Tags, separated by commas" value={form.tags} onChange={handleChange} />

        <button className="main-btn" onClick={addItem}>Add to Closet</button>
      </section>

      <section className="actions">
        <button onClick={() => generateOutfit("casual")}>Generate Casual Outfit</button>
        <button onClick={() => generateOutfit("activity")}>Generate Activity Outfit</button>
        <button onClick={() => generateOutfit("cold")}>Generate Cold Weather Outfit</button>
      </section>

      {outfit.length > 0 && (
        <section className="section">
          <h2>Generated Outfit</h2>
          <div className="grid">
            {outfit.map((item) => <ClothingCard key={item.id} item={item} onWear={() => markWorn(item.id)} />)}
          </div>
        </section>
      )}

      <section className="section">
        <div className="closet-top">
          <h2>Your Closet</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {categories.map((cat) => <option key={cat}>{cat}</option>)}
          </select>
        </div>

        {filteredItems.length === 0 ? (
          <p className="empty">No clothes added yet.</p>
        ) : (
          <div className="grid">
            {filteredItems.map((item) => (
              <ClothingCard key={item.id} item={item} onDelete={() => deleteItem(item.id)} onWear={() => markWorn(item.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClothingCard({ item, onDelete, onWear }) {
  return (
    <div className="item-card">
      <img src={item.image} alt={item.name} />
      <h3>{item.name}</h3>
      <p>{item.category}</p>
      <p>{item.color}</p>
      <p>{item.style}</p>
      <p className="worn">Worn {item.wornCount || 0} times</p>
      {item.tags?.length > 0 && (
        <div className="tags">
          {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      )}
      <div className="card-actions">
        {onWear && <button onClick={onWear}>Worn</button>}
        {onDelete && <button className="delete" onClick={onDelete}>Delete</button>}
      </div>
    </div>
  );
}

export default App;
