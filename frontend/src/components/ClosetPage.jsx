import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Upload, Link as LinkIcon, X } from "lucide-react";
import { api, shrinkImage } from "../api";
import { FIT_OPTIONS } from "../outfit";
import { categories, Field, Select, Modal } from "./UI";

export default function ClosetPage({ setToast }) {
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);

  const load = () => {
    api
      .closet()
      .then((d) => {
        if (!Array.isArray(d)) {
          setItems([]);
        } else {
          setItems(d);
        }
      })
      .catch((e) => setToast(e.message || "ไม่สามารถโหลดข้อมูลตู้เสื้อผ้าได้", "error"));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("คุณต้องการลบเสื้อผ้าชิ้นนี้ออกจากตู้หรือไม่?")) return;
    try {
      await api.deleteCloset(id);
      setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setToast("ลบเสื้อผ้าออกจากตู้เรียบร้อยแล้ว ✨", "success");
    } catch (e) {
      setToast(e.message || "เกิดข้อผิดพลาดในการลบเสื้อผ้า", "error");
    }
  };

  const handleSavePiece = async (formData) => {
    try {
      const created = await api.createCloset(formData);
      setShow(false);
      setToast("เพิ่มเสื้อผ้าเข้าตู้แล้ว ✨", "success");
      setItems((prev) => [created, ...prev.filter((x) => String(x.id) !== String(created.id))]);
    } catch (e) {
      setToast(e.message || "เกิดข้อผิดพลาดในการบันทึก", "error");
    }
  };

  return (
    <section className="page animate-fade-in">
      <div className="page-hero">
        <div>
          <span className="eyebrow">BUILD YOUR WORLD</span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">My Closet</h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-1">{items.length} pieces in your digital wardrobe.</p>
        </div>
        <button
          type="button"
          className="btn btn-dark text-sm px-5 py-2.5 rounded-full"
          onClick={() => setShow(true)}
        >
          <Plus size={18} /> Add piece
        </button>
      </div>

      <div className="category-row">
        {categories.map((c) => (
          <div className="category-pill" key={c.key}>
            <span>{c.icon}</span>
            {c.label}
            <b>{items.filter((x) => x.category === c.key).length}</b>
          </div>
        ))}
      </div>

      {items.length ? (
        <div className="closet-grid">
          {items.map((item) => (
            <ClosetCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="large-empty">
          <div>👚</div>
          <h3>Your closet is waiting.</h3>
          <p>เพิ่มเสื้อผ้าชิ้นแรกของคุณ แล้วเริ่มสร้างลุคกันเลย</p>
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => setShow(true)}
          >
            <Plus size={17} /> Add first piece
          </button>
        </div>
      )}

      {show && (
        <ClosetModal
          close={() => setShow(false)}
          save={handleSavePiece}
        />
      )}
    </section>
  );
}

function ClosetModal({ close, save }) {
  const [form, setForm] = useState({
    name: "",
    category: "top",
    color: "black",
    size: "M",
    style: "casual",
    condition: "good",
    fit: "regular",
    image_url: "",
  });
  const [imageType, setImageType] = useState("url"); // 'url' or 'upload'
  const [uploadBusy, setUploadBusy] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    shrinkImage(file, 800, 0.82)
      .then((url) => {
        setForm((prev) => ({ ...prev, image_url: url }));
      })
      .catch((err) => {
        console.error("Image processing error:", err);
      })
      .finally(() => {
        setUploadBusy(false);
      });
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    save({
      ...form,
      name: form.name.trim(),
      image_url: form.image_url.trim(),
    });
  };

  return (
    <Modal title="Add to your closet" close={close}>
      <form className="form" onSubmit={handleSubmit}>
        <Field
          label="Item name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="e.g. Baby tee"
          required
        />

        <div className="two-col">
          <Select
            label="Category"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            options={categories.map((x) => [x.key, x.label])}
          />
          <Select
            label="Color"
            value={form.color}
            onChange={(v) => setForm({ ...form, color: v })}
            options={[
              "black",
              "white",
              "cream",
              "pink",
              "blue",
              "brown",
              "grey",
              "green",
              "red",
            ].map((x) => [x, x])}
          />
        </div>

        <div className="two-col">
          <Select
            label="Style"
            value={form.style}
            onChange={(v) => setForm({ ...form, style: v })}
            options={[
              "casual",
              "korean",
              "y2k",
              "minimal",
              "street",
              "preppy",
            ].map((x) => [x, x])}
          />
          <Select
            label="Size"
            value={form.size}
            onChange={(v) => setForm({ ...form, size: v })}
            options={[
              "XS",
              "S",
              "M",
              "L",
              "XL",
              "35",
              "36",
              "37",
              "38",
              "39",
              "40",
              "41",
              "42",
              "43",
              "44",
            ].map((x) => [x, x])}
          />
        </div>

        <Select
          label="Fit (ทรง)"
          value={form.fit}
          onChange={(v) => setForm({ ...form, fit: v })}
          options={FIT_OPTIONS}
        />

        {/* Custom Image Section (URL or File Upload) */}
        <div className="field">
          <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 600 }}>
            Piece Image (รูปภาพเสื้อผ้า)
          </label>

          {/* Toggle between Image URL and Local File Upload */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              background: "#f0eee9",
              padding: "4px",
              borderRadius: "12px",
              marginBottom: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => setImageType("url")}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "8px",
                background: imageType === "url" ? "#fff" : "transparent",
                color: imageType === "url" ? "#151515" : "#777",
                boxShadow: imageType === "url" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              <LinkIcon size={14} /> Image URL
            </button>
            <button
              type="button"
              onClick={() => setImageType("upload")}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "8px",
                background: imageType === "upload" ? "#fff" : "transparent",
                color: imageType === "upload" ? "#151515" : "#777",
                boxShadow: imageType === "upload" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              <Upload size={14} /> Upload File
            </button>
          </div>

          {imageType === "url" ? (
            <Field
              label="Direct Image URL"
              value={form.image_url.startsWith("data:") ? "" : form.image_url}
              onChange={(v) => setForm({ ...form, image_url: v })}
              placeholder="https://images.unsplash.com/photo-..."
            />
          ) : (
            <div>
              <input
                type="file"
                id="closet-file-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <label
                htmlFor="closet-file-upload"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "20px",
                  border: "2px dashed #d9d5ce",
                  borderRadius: "16px",
                  background: "#faf9f6",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              >
                <Upload size={22} className="text-[#888]" />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#444" }}>
                  {uploadBusy ? "กำลังประมวลผลรูปภาพ..." : "คลิกเพื่อเลือกไฟล์รูปภาพจากอุปกรณ์"}
                </span>
                <span style={{ fontSize: "11px", color: "#999" }}>
                  รองรับ JPG, PNG, WEBP (ย่อขนาดอัตโนมัติ)
                </span>
              </label>
            </div>
          )}

          {/* Image Preview Box with Remove Button */}
          {form.image_url && (
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 12px",
                background: "#f7f6f2",
                border: "1px solid #e5e0d8",
                borderRadius: "14px",
              }}
            >
              <img
                src={form.image_url}
                alt="Piece preview"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  flexShrink: 0,
                  border: "1px solid #ddd",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: "12px", display: "block" }}>
                  {form.image_url.startsWith("data:") ? "ไฟล์รูปภาพพร้อมใช้งาน" : "ลิงก์รูปภาพเว็บ"}
                </b>
                <small
                  style={{
                    fontSize: "10px",
                    color: "#888",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {form.image_url.startsWith("data:") ? "Image loaded & optimized" : form.image_url}
                </small>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  padding: "6px",
                  borderRadius: "50%",
                  color: "#a33b3b",
                  background: "#fce8e6",
                  display: "grid",
                  placeItems: "center",
                }}
                title="ลบรูปภาพ"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-dark full"
          style={{ marginTop: "10px" }}
          disabled={uploadBusy}
        >
          Save piece <Check size={17} />
        </button>
      </form>
    </Modal>
  );
}

function ClosetCard({ item, onDelete }) {
  const [imgError, setImgError] = useState(false);
  const cat = categories.find((c) => c.key === item.category);

  return (
    <article className="closet-card">
      <div className="clothing-art">
        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="clothing-fallback-icon">
            {cat?.icon || "◒"}
          </span>
        )}
        <button
          type="button"
          className="round-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          title="ลบเสื้อผ้าชิ้นนี้"
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="card-info">
        <div>
          <b>{item.name}</b>
          <small>
            {cat?.label} · {item.style}
          </small>
        </div>
        <span className="dot-tag">{item.color}</span>
      </div>
    </article>
  );
}

export { ClosetPage as MyCloset };