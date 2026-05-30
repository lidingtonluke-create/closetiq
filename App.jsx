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
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(selected);
  }

  function analyzeClothing() {
    if (!image) return alert("Upload a clothing picture first.");

    setForm({
      name: file?.name?.split(".")[0] || "Clothing Item",
      category: "Shirt",
      color: "Black",
      style: "Casual",
      occasion: "Everyday",
      tags: "closet, casual",
    });
  }

  function removeBackground() {
    alert("Background removal is turned off for now so the app does not break.");
  }

  function addItem() {
    if (!image || !form.name.trim()) {
      return alert("Add a picture and item name first.");
    }

    const existingItem = items.find((item) => item.id === editingId);

    const savedItem = {
      id: editingId || crypto.randomUUID(),
      image,
      ...form,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      wornCount: existingItem?.wornCount || 0,
      dateAdded: existingItem?.dateAdded || new Date().toISOString(),
    };

    if (editingId) {
      setItems(items.map((item) => (item.id === editingId ? savedItem : item)));
      setOutfit(outfit.map((item) => (item.id === editingId ? savedItem : item)));
    } else {
      setItems([savedItem, ...items]);
    }

    setEditingId(null);
    setFile(null);
    setImage("");
    setForm(blankForm);
  }

  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id));
    setOutfit(outfit.filter((item) => item.id !== id));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setImage(item.image);
    setFile(null);

    setForm({
      name: item.name || "",
      category: item.category || "Shirt",
      color: item.color || "",
      style: item.style || "",
      occasion: item.occasion || "",
      tags: item.tags?.join(", ") || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setFile(null);
    setImage("");
    setForm(blankForm);
  }

  function markWorn(id) {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, wornCount: (item.wornCount || 0) + 1 }
          : item
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
        <h2>{editingId ? "Edit Clothing" : "Add Clothing"}</h2>

        <input type="file" accept="image/*" onChange={handleFile} />

        {image && <img className="preview" src={image} alt="preview" />}

        <div className="button-row">
          <button onClick={analyzeClothing}>AI Analyze</button>
          <button onClick={removeBackground}>Remove Background</button>
        </div>

        <input name="name" placeholder="Item name" value={form.name} onChange={handleChange} />

        <select name="category" value={form.category} onChange={handleChange}>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <input name="color" placeholder="Color" value={form.color} onChange={handleChange} />
        <input name="style" placeholder="Style, like casual or streetwear" value={form.style} onChange={handleChange} />
        <input name="occasion" placeholder="Occasion, like school, gym, going out" value={form.occasion} onChange={handleChange} />
        <input name="tags" placeholder="Tags, separated by commas" value={form.tags} onChange={handleChange} />

        <button className="main-btn" onClick={addItem}>
          {editingId ? "Save Changes" : "Add to Closet"}
        </button>

        {editingId && (
          <button className="cancel" onClick={cancelEdit}>
            Cancel Edit
          </button>
        )}
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
            {outfit.map((item) => (
              <ClothingCard key={item.id} item={item} onWear={() => markWorn(item.id)} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="closet-top">
          <h2>Your Closet</h2>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {filteredItems.length === 0 ? (
          <p className="empty">No clothes added yet.</p>
        ) : (
          <div className="grid">
            {filteredItems.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onEdit={() => startEdit(item)}
                onDelete={() => deleteItem(item.id)}
                onWear={() => markWorn(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClothingCard({ item, onEdit, onDelete, onWear }) {
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
          {item.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className="card-actions">
        {onWear && <button onClick={onWear}>Worn</button>}
        {onEdit && <button className="edit" onClick={onEdit}>Edit</button>}
        {onDelete && <button className="delete" onClick={onDelete}>Delete</button>}
      </div>
    </div>
  );
}

export default App;