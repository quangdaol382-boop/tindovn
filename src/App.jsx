import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { computeFace, compressToJpegBlob, compressToDataUrl } from "./face.js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://kvbtvjzkeukcjgqqdddu.supabase.co",
  "sb_publishable_t9L83Ag6Tbr3PK3_SNEIGw_uiKra69S"
);

// ─── Bảng màu theo loại tin (Tailwind class tĩnh — an toàn với JIT) ───────────
// Xanh dương = đang tìm / thương hiệu · Xanh lá = đã nhặt / tích cực · Cam = khẩn cấp / cảnh báo · Tím = AI
const TONE = {
  lost:  { solid:"bg-brand-600 hover:bg-brand-700", text:"text-brand-700", chipBg:"bg-brand-50", chipText:"text-brand-700", chipBorder:"border-brand-200", ring:"border-brand-500", soft:"bg-brand-50", dot:"bg-brand-600" },
  found: { solid:"bg-ok-500 hover:bg-ok-600",        text:"text-ok-700",    chipBg:"bg-ok-50",    chipText:"text-ok-700",    chipBorder:"border-ok-200",    ring:"border-ok-500",    soft:"bg-ok-50",    dot:"bg-ok-500" },
  missing:      { solid:"bg-warn-600 hover:bg-warn-700", text:"text-warn-700", chipBg:"bg-warn-50", chipText:"text-warn-700", chipBorder:"border-warn-200", ring:"border-warn-500", soft:"bg-warn-50", dot:"bg-warn-600" },
  found_person: { solid:"bg-ok-500 hover:bg-ok-600",     text:"text-ok-700",   chipBg:"bg-ok-50",   chipText:"text-ok-700",   chipBorder:"border-ok-200",   ring:"border-ok-500",   soft:"bg-ok-50",   dot:"bg-ok-500" },
  urgent_high:   { solid:"bg-red-600 hover:bg-red-700",   text:"text-red-700",  chipBg:"bg-red-50",  chipText:"text-red-700",  chipBorder:"border-red-200" },
  urgent_medium: { solid:"bg-warn-600 hover:bg-warn-700", text:"text-warn-700", chipBg:"bg-warn-50", chipText:"text-warn-700", chipBorder:"border-warn-200" },
  ai: { solid:"bg-ai-600 hover:bg-ai-700", text:"text-ai-700", chipBg:"bg-ai-50", chipText:"text-ai-700", chipBorder:"border-ai-200", soft:"bg-ai-50" },
};

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INIT_ITEMS = [
  { id:1,  type:"lost",  category:"CMND/CCCD",   title:"CCCD mang tên Nguyễn Văn An",       hoTen:"Nguyễn Văn An",  soGiayTo:"079201012345",  ngaySinh:"15/03/1985", location:"Quận 1, TP.HCM",      date:"17/05/2026", reward:"500.000đ",   contact:"0901 234 567", img:"🪪", note:"Đánh mất gần khu vực Bến Thành" },
  { id:2,  type:"found", category:"Bằng lái xe",  title:"Bằng lái xe B2 – Trần Thị Mai",     hoTen:"Trần Thị Mai",   soGiayTo:"B2-2204-001234",ngaySinh:"20/07/1990", location:"Hoàn Kiếm, Hà Nội",   date:"18/05/2026", reward:null,         contact:"0912 345 678", img:"🪪", note:"Nhặt được trên vỉa hè đường Đinh Tiên Hoàng" },
  { id:3,  type:"lost",  category:"Ví/Túi xách",  title:"Ví da đen, có thẻ ATM Vietcombank", hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Đống Đa, Hà Nội",     date:"19/05/2026", reward:"200.000đ",   contact:"0933 456 789", img:"👛", note:"Ví màu đen, bên trong có khoảng 500k và 3 thẻ" },
  { id:4,  type:"found", category:"Chìa khóa",    title:"Chùm chìa khóa Honda, móc đỏ",      hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Bình Thạnh, TP.HCM",  date:"19/05/2026", reward:null,         contact:"0944 567 890", img:"🔑", note:"Chùm chìa khóa 3 chiếc, móc khóa hình trái tim đỏ" },
  { id:5,  type:"lost",  category:"CMND/CCCD",   title:"CCCD mang tên Lê Hoàng Nam",         hoTen:"Lê Hoàng Nam",   soGiayTo:"001198045678",  ngaySinh:"02/11/1998", location:"Cầu Giấy, Hà Nội",    date:"16/05/2026", reward:"1.000.000đ", contact:"0955 678 901", img:"🪪", note:"Rất cần gấp để làm thủ tục" },
  { id:6,  type:"found", category:"CMND/CCCD",   title:"CCCD mang tên Trần Thị Hoa",         hoTen:"Trần Thị Hoa",   soGiayTo:"038198123456",  ngaySinh:"08/04/1972", location:"Quận 3, TP.HCM",      date:"15/05/2026", reward:null,         contact:"0966 789 012", img:"🪪", note:"Nhặt được tại siêu thị Coopmart" },
  { id:7,  type:"lost",  category:"Điện thoại",  title:"iPhone 15 Pro xanh titan",            hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Tân Bình, TP.HCM",    date:"18/05/2026", reward:"2.000.000đ", contact:"0977 888 999", img:"📱", note:"Ốp lưng trong suốt, có sticker mèo góc dưới" },
  { id:8,  type:"found", category:"Hộ chiếu",    title:"Hộ chiếu mang tên Pham Van Duc",      hoTen:"Pham Van Duc",   soGiayTo:"B1234567",      ngaySinh:"12/06/1988", location:"Sân bay Nội Bài, HN", date:"19/05/2026", reward:null,         contact:"0988 111 222", img:"📘", note:"Tìm thấy tại khu vực check-in" },
  { id:9,  type:"lost",  category:"Ví/Túi xách", title:"Túi xách da nâu hiệu Coach",          hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Quận 7, TP.HCM",      date:"15/05/2026", reward:"500.000đ",   contact:"0909 222 333", img:"👜", note:"Túi màu nâu, bên trong có ví, chìa khóa và hộp son" },
  { id:10, type:"found", category:"Chìa khóa",   title:"Chìa khóa xe Lead, 2 chiếc",          hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Quận Thanh Xuân, HN", date:"17/05/2026", reward:null,         contact:"0922 444 555", img:"🔑", note:"Nhặt tại bãi giữ xe chung cư" },
];

const INIT_MISSING = [
  { id:101, type:"missing",      hoTen:"Bà Nguyễn Thị Lan",        tuoi:"72 tuổi", gioiTinh:"Nữ",  danhTich:"Người cao tuổi, tóc bạc, chiều cao khoảng 1m55, hay mặc áo bà ba xanh và quần đen", trangPhuc:"Áo bà ba xanh nhạt, quần đen, dép tổ ong", lanCuoiThay:"Chợ Bến Thành, Quận 1, TP.HCM", thoiGian:"14:00 ngày 16/05/2026", date:"16/05/2026", contact:"0977 111 222", reward:"2.000.000đ", tieuChuan:"Có biểu hiện lú lẫn, không nhớ địa chỉ nhà.", avatar:"👵", urgency:"high", img:null },
  { id:102, type:"missing",      hoTen:"Em Phạm Quốc Bảo",         tuoi:"8 tuổi",  gioiTinh:"Nam", danhTich:"Trẻ em, tóc đen ngắn, mặc áo thun đỏ có chữ Doraemon, quần short xanh, dép sandal trắng", trangPhuc:"Áo thun đỏ Doraemon, quần short xanh navy", lanCuoiThay:"Công viên 23/9, Quận 1, TP.HCM", thoiGian:"10:30 ngày 17/05/2026", date:"17/05/2026", contact:"0988 333 444", reward:"5.000.000đ", tieuChuan:"Đi cùng bà nội từ sáng, bị thất lạc khoảng 10:30.", avatar:"👦", urgency:"high", img:null },
  { id:103, type:"missing",      hoTen:"Ông Trần Minh Đức",         tuoi:"68 tuổi", gioiTinh:"Nam", danhTich:"Người cao tuổi, đeo kính cận gọng đen, tóc muối tiêu, mặc áo sơ mi kẻ xanh trắng", trangPhuc:"Áo sơ mi kẻ xanh trắng, quần tây xám", lanCuoiThay:"Bệnh viện Chợ Rẫy, TP.HCM", thoiGian:"08:00 ngày 14/05/2026", date:"14/05/2026", contact:"0909 555 666", reward:"1.000.000đ", tieuChuan:"Rời khỏi bệnh viện một mình. Có tiền sử bệnh tim.", avatar:"👴", urgency:"medium", img:null },
  { id:104, type:"found_person", hoTen:"Người phụ nữ chưa rõ tên", tuoi:"~60 tuổi",gioiTinh:"Nữ",  danhTich:"Không nhớ được tên và địa chỉ nhà, mặc áo bà ba hoa, có vẻ mệt mỏi và lạc đường", trangPhuc:"Áo bà ba hoa, quần lụa xanh", lanCuoiThay:"Trước cổng Chợ Tân Bình, TP.HCM", thoiGian:"09:00 ngày 19/05/2026", date:"19/05/2026", contact:"0911 777 888", reward:null, tieuChuan:"Đang được trông nom tạm.", avatar:"👩", urgency:"medium", img:null },
  { id:105, type:"missing",      hoTen:"Cháu Lê Thị Ngọc Anh",     tuoi:"6 tuổi",  gioiTinh:"Nữ",  danhTich:"Bé gái tóc dài buộc 2 bên, mặc váy hồng có nơ, mang ba lô màu tím hình thỏ", trangPhuc:"Váy hồng có nơ, ba lô tím hình thỏ, giày trắng", lanCuoiThay:"Siêu thị Vincom Mega Mall, TP.Thủ Đức", thoiGian:"15:30 ngày 18/05/2026", date:"18/05/2026", contact:"0933 999 000", reward:"3.000.000đ", tieuChuan:"Bị thất lạc tại tầng 3 khu vực đồ chơi.", avatar:"👧", urgency:"high", img:null },
];

// ─── Helpers (không đổi logic) ─────────────────────────────────────────────────
const fmtDate = () => new Date().toLocaleDateString("vi-VN");
const uid = () => Date.now() + Math.random();
const ITEM_CAT = ["CMND/CCCD","Bằng lái xe","Hộ chiếu","Ví/Túi xách","Chìa khóa","Điện thoại","Khác"];
const catIcon = c => ({ "CMND/CCCD":"🪪","Bằng lái xe":"🪪","Hộ chiếu":"📘","Ví/Túi xách":"👛","Chìa khóa":"🔑","Điện thoại":"📱","Khác":"📦" }[c]||"📦");
const SENSITIVE_CATS = ["CMND/CCCD","Bằng lái xe","Hộ chiếu"];
const normalizeCategory = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return "";
  const l = s.toLowerCase();
  if (/cccd|cmnd|cmt|căn cước|can cuoc|chứng minh|chung minh/.test(l)) return "CMND/CCCD";
  if (/bằng lái|bang lai|gplx|giấy phép lái|giay phep lai/.test(l)) return "Bằng lái xe";
  if (/hộ chiếu|ho chieu|passport/.test(l)) return "Hộ chiếu";
  return s;
};
const docCategory = (raw) => {
  const c = normalizeCategory(raw);
  return ITEM_CAT.includes(c) ? c : "Khác";
};
const isSensitive = item =>
  SENSITIVE_CATS.includes(normalizeCategory(item.category)) ||
  !!(item.soGiayTo && String(item.soGiayTo).trim());
const privateTitle = item => {
  if (!isSensitive(item)) return item.title;
  return `${normalizeCategory(item.category) || "Giấy tờ"} — ${item.type==="found"?"Đã nhặt được":"Đang tìm"}`;
};
const maskID = (id) => {
  if (!id) return "";
  if (id.length <= 3) return id;
  return id.slice(0, 3) + "*".repeat(id.length - 3);
};
const maskDate = (date) => {
  if (!date) return "";
  const parts = date.split("/");
  if (parts.length === 3) return `**/${parts[1]}/${parts[2]}`;
  return "**/**/****";
};
const maskAddress = (addr) => {
  if (!addr) return "";
  const parts = addr.split(",");
  if (parts.length > 1) return `***, ${parts[parts.length-1].trim()}`;
  return addr.slice(0, 3) + "***";
};

// ─── Shared class fragments ────────────────────────────────────────────────────
const inputCls = "w-full box-border px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-[14px] outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition";
const cardCls = "bg-white border border-slate-200 rounded-2xl";
function btnCls(tone="brand", extra="") {
  const tones = {
    brand: "bg-brand-600 hover:bg-brand-700 text-white",
    found: "bg-ok-500 hover:bg-ok-600 text-white",
    warn:  "bg-warn-600 hover:bg-warn-700 text-white",
    ai:    "bg-ai-600 hover:bg-ai-700 text-white",
    ghost: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300",
  };
  return `w-full border-none rounded-xl px-4 py-3 font-extrabold text-[15px] cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed ${tones[tone]||tones.brand} ${extra}`;
}

// ─── Primitive Components ─────────────────────────────────────────────────────
function Overlay({ onClose, children }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      {children}
    </div>
  );
}
function Modal({ onClose, className="", children }) {
  return (
    <Overlay onClose={onClose}>
      <div onClick={e=>e.stopPropagation()} className={`${cardCls} shadow-2xl p-6 sm:p-7 w-full max-w-[520px] relative my-auto ${className}`}>
        <button onClick={onClose} aria-label="Đóng" className="absolute top-3.5 right-3.5 bg-slate-100 hover:bg-slate-200 border-none rounded-lg w-8 h-8 text-slate-500 cursor-pointer text-lg flex items-center justify-center z-10">×</button>
        {children}
      </div>
    </Overlay>
  );
}
function Field({ label, value, onChange, placeholder, type="text", multiline=false, hint, required=false }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] text-slate-500 mb-1.5 font-bold uppercase tracking-wide">
        {label}{required && <span className="text-warn-600 ml-0.5">*</span>}
      </label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} resize-y`}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={inputCls}/>}
      {hint && <div className="text-[11px] text-slate-400 mt-1">💡 {hint}</div>}
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] text-slate-500 mb-1.5 font-bold uppercase tracking-wide">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
        {options.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-400 text-xs shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-right text-slate-800">{value}</span>
    </div>
  );
}
function Chip({ text, className="" }) {
  return <span className={`inline-flex items-center text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full border ${className}`}>{text}</span>;
}
function SectionTitle({ icon, text, className="text-ai-600" }) {
  return <div className={`text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${className}`}><span>{icon}</span>{text}</div>;
}
function Empty({ icon, text }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3 grayscale opacity-60">{icon}</div>
      <div className="text-base font-bold text-slate-400">{text}</div>
    </div>
  );
}

const dbMsg = e => (/[àáảãạăâđêôơưìíòóùúýỳ]/i.test(e?.message || "") ? e.message : "");

// ─── Claude AI qua Vercel Edge Function (tránh CORS) ────────────────────────
const AI_PROXY = "/api/ai";

async function shrinkB64(b64, mime) {
  if (!b64 || b64.length < 900000) return { b64, mime };
  try {
    const src = `data:${mime || "image/jpeg"};base64,${b64}`;
    for (const [side, q] of [[1600, 0.85], [1400, 0.75], [1100, 0.7]]) {
      const out = (await compressToDataUrl(src, side, q)).split(",")[1];
      if (out.length < 2500000 || side === 1100) return { b64: out, mime: "image/jpeg" };
    }
  } catch (e) { console.error("Không thu nhỏ được ảnh:", e); }
  return { b64, mime };
}

async function callGemini(prompt, b64Image = null, mimeType = "image/jpeg") {
  const content = [];
  if (b64Image) {
    ({ b64: b64Image, mime: mimeType } = await shrinkB64(b64Image, mimeType));
    let detectedMime = mimeType;
    if (b64Image.startsWith("/9j/")) detectedMime = "image/jpeg";
    else if (b64Image.startsWith("iVBOR")) detectedMime = "image/png";
    else if (b64Image.startsWith("R0lGO")) detectedMime = "image/gif";
    else if (b64Image.startsWith("UklGR")) detectedMime = "image/webp";
    content.push({ type: "image", source: { type: "base64", media_type: detectedMime, data: b64Image } });
  }
  content.push({ type: "text", text: prompt });

  let res;
  try {
    res = await fetch(AI_PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
  } catch (e) {
    throw new Error("Không kết nối được server AI: " + e.message);
  }

  if (!res.ok) {
    let msg = "";
    try { msg = (await res.json()).error || ""; } catch { /* không phải JSON */ }
    if (res.status === 429) throw new Error(msg || "Bạn dùng AI quá nhiều lần. Vui lòng thử lại sau vài phút.");
    if (res.status === 413) throw new Error("Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn.");
    throw new Error(msg || `Máy chủ AI đang lỗi (${res.status}), vui lòng thử lại.`);
  }

  const data = await res.json();
  if (data.error) throw new Error("AI lỗi: " + data.error);

  let raw = (data.text || "").trim();
  if (!raw) throw new Error("AI không trả về nội dung. Thử ảnh khác hoặc thử lại.");

  raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  try { return JSON.parse(raw); }
  catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); }
      catch {}
    }
    throw new Error("AI không trả về đúng định dạng JSON: " + raw.slice(0, 100));
  }
}

function useImagePicker(onPicked) {
  const ref = useRef();
  const pick = () => ref.current.click();
  const handle = useCallback(file => {
    if (!file?.type.startsWith("image/")) return;
    const mimeType = file.type || "image/jpeg";
    const r = new FileReader();
    r.onload = e => {
      const b64 = e.target.result.split(",")[1];
      onPicked(e.target.result, b64, mimeType);
    };
    r.readAsDataURL(file);
  }, [onPicked]);
  const inputEl = <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e=>handle(e.target.files[0])}/>;
  return { pick, inputEl, handleDrop: useCallback(e=>{e.preventDefault();handle(e.dataTransfer.files[0]);}, [handle]) };
}

// ─── AI Doc Scanner Modal ─────────────────────────────────────────────────────
function DocScanModal({ onClose, onFill }) {
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const b64 = useRef(null);
  const mime = useRef("image/jpeg");
  const { pick, inputEl, handleDrop } = useImagePicker((src, b, mimeType) => { setPreview(src); b64.current=b; mime.current=mimeType||"image/jpeg"; setPhase("idle"); setErr(""); });

  const scan = async () => {
    setPhase("scanning"); setErr("");
    try {
      const r = await callGemini(
        `Bạn là hệ thống OCR nhận diện giấy tờ Việt Nam. Phân tích ảnh và trả về JSON THUẦN (không markdown, không giải thích thêm).
Schema bắt buộc: {"loaiGiayTo":"CMND/CCCD|Bằng lái xe|Hộ chiếu|Thẻ sinh viên|Thẻ BHYT|Khác","hoTen":"","soGiayTo":"","ngaySinh":"","gioiTinh":"","queQuan":"","diaChiThuongTru":"","ngayCap":"","noiCap":"","moTaThem":"","doTinCay":90}
Nếu ảnh không phải giấy tờ: {"loi":"Ảnh không phải giấy tờ hợp lệ"}
Không được bịa thông tin, chỉ điền những gì đọc được rõ ràng.`,
        b64.current,
        mime.current
      );
      if (r.loi) { setErr(r.loi); setPhase("error"); return; }
      setResult(r); setPhase("done");
    } catch(e) { setErr("Không thể phân tích ảnh: " + e.message); setPhase("error"); }
  };

  return (
    <Modal onClose={onClose} className="max-w-[480px]">
      {inputEl}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-ai-600 flex items-center justify-center text-[22px] shrink-0">🤖</div>
        <div><div className="font-extrabold text-lg text-slate-900">AI Đọc Giấy Tờ</div><div className="text-xs text-slate-400">Tải ảnh → AI trích xuất thông tin tự động</div></div>
      </div>
      <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={pick}
        className={`border-2 border-dashed rounded-2xl text-center cursor-pointer mb-3.5 min-h-[120px] flex items-center justify-center ${preview ? "p-2 border-ai-500 bg-ai-50" : "p-8 border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
        {preview ? <img src={preview} alt="" className="max-h-[200px] max-w-full rounded-xl object-contain"/>
          : <div><div className="text-4xl mb-2.5">📷</div><div className="font-bold text-[15px] text-slate-700">Kéo thả hoặc bấm chọn ảnh</div><div className="text-xs text-slate-400 mt-1">CCCD · Bằng lái · Hộ chiếu · Thẻ BHYT…</div></div>}
      </div>
      {preview && phase!=="scanning" && <button onClick={pick} className="bg-transparent border border-slate-300 rounded-lg px-3 py-1.5 text-slate-500 text-xs cursor-pointer mb-3">🔄 Đổi ảnh khác</button>}
      {err && <div className="bg-warn-50 border border-warn-200 rounded-lg px-3.5 py-2.5 mb-3 text-warn-700 text-[13px]">⚠️ {err}</div>}
      {phase==="scanning" && <div className="text-center py-8">
        <div className="text-4xl mb-3 inline-block animate-spin">🔄</div>
        <div className="font-bold text-slate-700">AI đang phân tích giấy tờ…</div>
      </div>}
      {phase==="done" && result && <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✅</span><span className="font-bold text-slate-900">Nhận diện thành công</span>
          <Chip text={`${result.doTinCay||90}% chính xác`} className="bg-ok-50 text-ok-700 border-ok-200"/>
        </div>
        <div className="bg-slate-50 rounded-xl px-3.5 py-3">
          {[["Loại giấy tờ",result.loaiGiayTo],["Họ và tên",result.hoTen],["Số giấy tờ",result.soGiayTo],["Ngày sinh",result.ngaySinh],["Giới tính",result.gioiTinh],["Quê quán",result.queQuan],["Địa chỉ",result.diaChiThuongTru],["Ngày cấp",result.ngayCap],["Nơi cấp",result.noiCap]].map(([k,v])=><InfoRow key={k} label={k} value={v}/>)}
        </div>
      </div>}
      {phase!=="scanning" && (
        phase==="done"
          ? <button onClick={()=>{onFill(result,preview);onClose();}} className={btnCls("found")}>Dùng thông tin này để đăng tin →</button>
          : <button onClick={scan} disabled={!preview} className={btnCls("ai")}>✨ {err?"Thử lại":"Nhận diện ngay"}</button>
      )}
    </Modal>
  );
}

// ─── Nhận diện khuôn mặt: tiện ích dùng chung ────────────────────────────────
const PHOTO_BUCKET = "missing-photos";
const photoUrl = path => path ? supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl : null;
const newUuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16); crypto.getRandomValues(b);
  const h = Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
};
const FACE_LEVELS = {
  rat_giong: { label:"Rất giống khuôn mặt", cls:"text-gold-600" },
  kha_giong: { label:"Khá giống khuôn mặt", cls:"text-ok-600" },
  co_the:    { label:"Có thể giống khuôn mặt", cls:"text-ai-600" },
  trung_ten: { label:"Trùng họ tên", cls:"text-slate-400" },
};

// ─── CAPTCHA (Cloudflare Turnstile) ──────────────────────────────────────────
const TURNSTILE_SITE_KEY = "0x4AAAAAAFPKIkAj5JrUYC3Y";
function useTurnstile() {
  const [token, setToken] = useState("");
  const elRef = useRef(null);
  const widgetId = useRef(null);
  useEffect(() => {
    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !elRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(elRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: t => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) renderWidget();
    else {
      let s = document.getElementById("turnstile-script");
      if (!s) {
        s = document.createElement("script");
        s.id = "turnstile-script";
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        s.async = true; s.defer = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", renderWidget);
      if (window.turnstile) renderWidget();
    }
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) { try { window.turnstile.remove(widgetId.current); } catch {} }
    };
  }, []);
  const reset = () => {
    setToken("");
    if (widgetId.current && window.turnstile) { try { window.turnstile.reset(widgetId.current); } catch {} }
  };
  return { elRef, token, reset };
}
function CaptchaBox({ elRef }) {
  return <div className="turnstile-box my-1 mb-3.5"><div ref={elRef}/></div>;
}

function PrivacyModal({ onClose }) {
  const Sec = ({ title, children }) => (
    <div className="mb-5">
      <div className="font-extrabold text-sm text-warn-600 mb-2">{title}</div>
      <div className="text-[13px] text-slate-600 leading-relaxed">{children}</div>
    </div>
  );
  return (
    <Modal onClose={onClose} className="max-w-[680px] max-h-[88vh] overflow-y-auto">
      <div className="font-black text-xl text-slate-900 mb-1">🔒 Chính sách quyền riêng tư</div>
      <div className="text-xs text-slate-400 mb-5">Cập nhật lần cuối: 28/09/2026 · Áp dụng theo Luật Bảo vệ dữ liệu cá nhân (hiệu lực từ 01/01/2026)</div>

      <Sec title="1. TìmĐồ.vn là gì">
        TìmĐồ.vn là một dự án cộng đồng, hiện do một cá nhân xây dựng và vận hành (chưa phải pháp nhân/doanh nghiệp), giúp kết nối người thất lạc đồ vật / người thân với người có thể đã nhặt được / gặp được. Vì đang trong giai đoạn thử nghiệm, chính sách này có thể được cập nhật khi hệ thống hoàn thiện thêm.
      </Sec>

      <Sec title="2. Thông tin chúng tôi thu thập">
        <strong>Khi đăng tin đồ vật:</strong> tên/mô tả đồ vật, loại đồ vật, địa điểm, số điện thoại liên hệ, tiền thưởng (nếu có), ghi chú. Nếu là giấy tờ tùy thân (CCCD/CMND, bằng lái, hộ chiếu), có thể thêm họ tên, số giấy tờ, ngày sinh, quê quán, địa chỉ thường trú.<br/><br/>
        <strong>Khi đăng tin người mất tích:</strong> họ tên, tuổi, giới tính, đặc điểm nhận dạng, trang phục, địa điểm và thời gian lần cuối thấy, số điện thoại liên hệ, tiền thưởng, mức độ khẩn cấp.<br/><br/>
        <strong>Ảnh và dữ liệu khuôn mặt:</strong> nếu bạn tải ảnh lên để đối chiếu, trình duyệt của bạn tự tính toán một "dãy số đặc trưng khuôn mặt" ngay trên máy bạn (không phải ảnh) để hệ thống so khớp — đây là dữ liệu sinh trắc học. Ảnh gốc chỉ được lưu lại nếu bạn chọn "hiển thị ảnh công khai" khi đăng tin người mất tích.<br/><br/>
        <strong>Khi dùng tính năng "Quét AI" giấy tờ hoặc "Nhờ AI mô tả":</strong> ảnh bạn chụp được gửi tới dịch vụ AI của Anthropic (Claude, đặt tại Hoa Kỳ) để tự động đọc thông tin hoặc mô tả ngoại hình — đây là việc <strong>chuyển dữ liệu ra nước ngoài</strong>. Ảnh chỉ dùng để xử lý ngay lúc đó, hệ thống của chúng tôi không lưu lại ảnh đã gửi cho AI.<br/><br/>
        <strong>Dữ liệu kỹ thuật:</strong> địa chỉ IP tại thời điểm đăng tin/tìm kiếm, dùng để ngăn đăng tin hàng loạt hoặc spam.
      </Sec>

      <Sec title="3. Vì sao chúng tôi thu thập">
        Chỉ để vận hành đúng chức năng của trang: hiển thị tin cho cộng đồng, tự động dò tin có thể trùng khớp, ngăn chặn spam/lạm dụng. Chúng tôi không thu thập dữ liệu cho mục đích quảng cáo và không bán hay trao đổi dữ liệu của bạn cho bên thứ ba vì mục đích thương mại.
      </Sec>

      <Sec title="4. Nơi lưu trữ và bên thứ ba liên quan">
        Dữ liệu được lưu trên hạ tầng của Supabase (cơ sở dữ liệu) và Vercel (máy chủ chạy website) — cả hai đều là dịch vụ hạ tầng đặt ở nước ngoài. Ảnh giấy tờ/mô tả gửi qua tính năng AI được xử lý bởi Anthropic (Hoa Kỳ). Đây là các bên xử lý dữ liệu thay chúng tôi để vận hành dịch vụ, không phải bên nhận dữ liệu vì mục đích riêng của họ.
      </Sec>

      <Sec title="5. Thời gian lưu trữ">
        Tin đồ vật tự động bị xóa sau <strong>30 ngày</strong> kể từ ngày đăng nếu chưa được đánh dấu "đã trả". Tin người mất tích <strong>không tự động xóa</strong> do tính chất nhạy cảm; nếu để quá 60 ngày mà chưa giải quyết, hệ thống chỉ nhắc quản trị viên xem xét chứ không tự xóa. Khi một tin người mất tích được đánh dấu "đã tìm thấy", <strong>ảnh và dữ liệu khuôn mặt bị xóa ngay lập tức</strong>, không thể khôi phục. Bạn có thể yêu cầu xóa tin của mình bất cứ lúc nào — xem mục 7.
      </Sec>

      <Sec title="6. Bảo mật">
        Dữ liệu được truyền qua kết nối mã hóa (HTTPS) và có phân quyền truy cập ở tầng cơ sở dữ liệu. Với tin đồ vật là giấy tờ tùy thân, số giấy tờ/ngày sinh/địa chỉ chỉ hiển thị một phần công khai — người liên hệ phải xác minh qua điện thoại mới biết đầy đủ. Chúng tôi liên tục bổ sung thêm các lớp bảo vệ. Không có hệ thống nào an toàn tuyệt đối, và đây là dự án đang trong giai đoạn thử nghiệm.
      </Sec>

      <Sec title="7. Quyền của bạn">
        Theo Luật Bảo vệ dữ liệu cá nhân, bạn có quyền: được biết dữ liệu của mình được xử lý ra sao; đồng ý hoặc rút lại đồng ý; truy cập, yêu cầu chỉnh sửa thông tin sai; <strong>yêu cầu xóa hoặc hạn chế xử lý dữ liệu của mình</strong>; phản đối việc xử lý; và khiếu nại nếu cho rằng quyền của mình bị vi phạm. Để thực hiện bất kỳ quyền nào ở trên, hãy liên hệ <strong>help@timdovn.vn</strong> — chúng tôi sẽ xử lý trong thời gian sớm nhất.
      </Sec>

      <Sec title="8. Trẻ em và người không tự quyết định được">
        Với tin người mất tích liên quan đến trẻ em, người cao tuổi lẫn, hoặc người không tự đồng ý được, người đăng tin (thường là người thân/người giám hộ) chịu trách nhiệm về việc cung cấp thông tin này là hợp pháp và cần thiết.
      </Sec>

      <Sec title="9. Cookie">
        Trang không dùng cookie theo dõi cho mục đích quảng cáo. Chỉ lưu trạng thái đăng nhập của quản trị viên trên trình duyệt để duy trì phiên làm việc.
      </Sec>

      <Sec title="10. Thay đổi chính sách">
        Chính sách này có thể được cập nhật khi hệ thống thay đổi. Ngày cập nhật gần nhất luôn hiển thị ở đầu trang này.
      </Sec>

      <Sec title="11. Liên hệ">
        📧 help@timdovn.vn · 📞 Hotline: 1800 9999
      </Sec>
    </Modal>
  );
}

function PersonMatchCard({ m }) {
  const lv = FACE_LEVELS[m.level] || FACE_LEVELS.co_the;
  const url = photoUrl(m.photo_path);
  const isFound = m.type === "found_person";
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-2.5">
      <div className="flex justify-between items-center gap-2 mb-2.5 flex-wrap">
        <span className={`font-extrabold text-[13px] ${lv.cls}`}>{lv.label}</span>
        <span className="text-xs text-slate-400">{isFound ? "Có người đã gặp người này" : "Gia đình đang tìm người này"}</span>
      </div>
      <div className="flex gap-3 items-center mb-2.5">
        <div className="w-15 h-15 w-[60px] h-[60px] rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-[28px] shrink-0">
          {url ? <img src={url} alt="" onError={e=>{e.currentTarget.style.display="none";}} className="w-full h-full object-cover"/> : (isFound ? "🟢" : "🟠")}
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-[15px] text-slate-900">{m.ho_ten}</div>
          <div className="text-xs text-slate-400">{[m.tuoi, m.gioi_tinh].filter(Boolean).join(" · ")}</div>
          <div className="text-xs text-slate-400">📍 {m.lan_cuoi_thay}{m.thoi_gian ? ` · ${m.thoi_gian}` : ""}</div>
          <div className="text-[11px] text-slate-400">📅 Đăng ngày {m.date}</div>
        </div>
      </div>
      {m.level === "trung_ten" && <div className="text-[11px] text-slate-400 mb-2">Cùng họ tên nhưng chưa có ảnh để so khuôn mặt — hãy hỏi thêm để xác minh.</div>}
      {m.reward && !isFound && <div className="text-xs text-gold-600 mb-2">🏆 Tiền thưởng: {m.reward}</div>}
      <a href={`tel:${String(m.contact||"").replace(/[^\d+]/g,"")}`} className="block text-center bg-warn-600 hover:bg-warn-700 rounded-lg py-2.5 text-white font-extrabold text-sm no-underline transition">📞 Gọi {m.contact}</a>
    </div>
  );
}

const FACE_DISCLAIMER = "Đây là gợi ý tự động dựa trên khuôn mặt, có thể sai. Hãy gọi điện và hỏi thêm thông tin (nốt ruồi, sẹo, nơi ở…) trước khi kết luận. Nếu người lạc là trẻ em hoặc người già cần giúp đỡ, hãy báo công an/UBND phường gần nhất.";

function PersonMatchResult({ matches, onClose }) {
  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">🔔</div>
        <div className="font-black text-xl text-slate-900 mb-1.5">Tin đã đăng — có {matches.length} tin có thể khớp!</div>
        <div className="text-xs text-slate-400 leading-relaxed">{FACE_DISCLAIMER}</div>
      </div>
      {matches.map(m => <PersonMatchCard key={m.id} m={m}/>)}
      <button onClick={onClose} className={btnCls("ghost", "mt-1.5")}>Đóng</button>
    </div>
  );
}

// ─── Tìm người bằng ảnh khuôn mặt ────────────────────────────────────────────
function FaceMatchModal({ onClose, missing }) {
  const [preview, setPreview] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [face, setFace] = useState(null);
  const [warn, setWarn] = useState("");
  const [err, setErr] = useState("");
  const [scope, setScope] = useState("");
  const [results, setResults] = useState(null);
  const token = useRef(0);
  const { elRef: captchaEl, token: captchaToken, reset: resetCaptcha } = useTurnstile();
  const { pick, inputEl, handleDrop } = useImagePicker(async src => {
    const my = ++token.current;
    setPreview(src); setFace(null); setResults(null); setErr(""); setWarn(""); setPhase("analyzing");
    try {
      const r = await computeFace(src);
      if (my !== token.current) return;
      if (!r.ok) { setPhase("noface"); return; }
      setFace(r.descriptor);
      setWarn([r.faces > 1 ? `Ảnh có ${r.faces} khuôn mặt — hệ thống dùng khuôn mặt lớn nhất.` : "", r.tooSmall ? "Khuôn mặt hơi nhỏ nên kết quả có thể kém chính xác — hãy thử ảnh cận mặt hơn." : ""].filter(Boolean).join(" "));
      setPhase("ready");
    } catch (e) {
      if (my === token.current) { setErr("Không phân tích được ảnh: " + (e.message || e)); setPhase("error"); }
    }
  });
  const search = async () => {
    if (!captchaToken) { setErr("Vui lòng xác nhận CAPTCHA (ô bên dưới) trước khi tìm."); return; }
    setPhase("searching"); setErr("");
    const r = await fetch("/api/search-face", { method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ p_face: face, p_type: scope || null, p_gender: null, captchaToken }) });
    const j = await r.json().catch(()=>({}));
    resetCaptcha();
    if (!r.ok || j.error) { console.error("search_face lỗi:", j.error); setErr(dbMsg({ message:j.error }) || "Không tìm được, vui lòng thử lại sau."); setPhase("ready"); return; }
    setResults(j.data || []); setPhase("done");
  };
  const reset = () => { token.current++; setPhase("idle"); setPreview(null); setFace(null); setResults(null); setErr(""); setWarn(""); };
  const total = (missing || []).length;

  return (
    <Modal onClose={onClose} className="max-w-[500px] max-h-[92vh] overflow-y-auto">
      {inputEl}
      <div className="flex items-center gap-3 mb-4.5 mb-5">
        <div className="w-11 h-11 rounded-xl bg-warn-600 flex items-center justify-center text-[22px] shrink-0">🔎</div>
        <div><div className="font-extrabold text-lg text-slate-900">Tìm người bằng khuôn mặt</div><div className="text-xs text-slate-400">So khuôn mặt — không phụ thuộc quần áo{total ? ` · ${total} hồ sơ đang tìm` : ""}</div></div>
      </div>
      <div className="bg-warn-50 border border-warn-200 rounded-lg px-3.5 py-2.5 mb-3.5 text-xs text-warn-700 leading-relaxed">
        ⚠️ Kết quả chỉ là <strong>gợi ý</strong>, không đảm bảo chính xác. Luôn xác nhận qua điện thoại.<br/>
        🔒 Ảnh được xử lý ngay trên máy bạn, <strong>không tải lên</strong> và không được lưu lại.
      </div>
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-3.5">
        {[["","Tất cả"],["missing","Đang mất tích"],["found_person","Đã gặp người lạc"]].map(([v,l])=>(
          <button key={v} onClick={()=>{ setScope(v); setResults(null); if (phase==="done") setPhase("ready"); }} className={`flex-1 py-2 px-1.5 rounded-lg border-none font-bold text-xs cursor-pointer transition ${scope===v?"bg-warn-600 text-white":"bg-transparent text-slate-500 hover:bg-slate-200"}`}>{l}</button>
        ))}
      </div>
      <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={pick}
        className={`border-2 border-dashed rounded-2xl text-center cursor-pointer mb-3 min-h-[120px] flex items-center justify-center ${preview ? "p-2 border-warn-500 bg-warn-50" : "p-8 border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
        {preview ? <img src={preview} alt="" className="max-h-[200px] max-w-full rounded-xl object-contain"/>
          : <div><div className="text-4xl mb-2.5">👤</div><div className="font-bold text-[15px] text-slate-700">Tải ảnh người cần đối chiếu</div><div className="text-xs text-slate-400 mt-1">Ảnh rõ mặt, nhìn thẳng cho kết quả tốt nhất</div></div>}
      </div>
      {preview && phase!=="analyzing" && phase!=="searching" && <button onClick={pick} className="bg-transparent border border-slate-300 rounded-lg px-3 py-1.5 text-slate-500 text-xs cursor-pointer mb-3">🔄 Đổi ảnh</button>}
      {phase==="analyzing" && <div className="text-center py-3.5 text-slate-600 text-[13px]"><span className="inline-block animate-spin mr-2">🔄</span>Đang phân tích khuôn mặt… (lần đầu có thể mất vài giây)</div>}
      {phase==="noface" && <div className="bg-warn-50 border border-warn-200 rounded-lg px-3.5 py-2.5 mb-3 text-warn-700 text-[13px]">⚠️ Không thấy khuôn mặt rõ trong ảnh. Hãy thử ảnh chụp rõ mặt, đủ sáng, nhìn thẳng.</div>}
      {err && <div className="bg-warn-50 border border-warn-200 rounded-lg px-3.5 py-2.5 mb-3 text-warn-700 text-[13px]">⚠️ {err}</div>}
      {warn && (phase==="ready"||phase==="done") && <div className="text-xs text-gold-600 mb-3">ℹ️ {warn}</div>}
      {phase==="searching" && <div className="text-center py-5"><div className="text-[38px] inline-block animate-spin">🔄</div><div className="font-bold mt-2 text-slate-700">Đang so khớp…</div></div>}
      {phase==="done" && results && (results.length ? <>
        <div className="font-extrabold text-[15px] mb-2.5 text-slate-900">⚡ Tìm thấy {results.length} hồ sơ có khuôn mặt giống</div>
        {results.map(m => <PersonMatchCard key={m.id} m={m}/>)}
        <div className="text-[11px] text-slate-400 leading-relaxed my-1 mb-3">{FACE_DISCLAIMER}</div>
      </> : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4.5 mb-3.5 text-center">
          <div className="text-3xl mb-2">🔍</div>
          <div className="font-bold text-[15px] mb-1 text-slate-900">Chưa có hồ sơ nào có khuôn mặt giống</div>
          <div className="text-[13px] text-slate-500 leading-relaxed">Hãy <strong>đăng tin kèm ảnh</strong> — khi sau này có người đăng tin về đúng người này, hệ thống sẽ hiện ngay số liên hệ của bạn cho họ.</div>
        </div>
      ))}
      {phase==="done" && <button onClick={reset} className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-none rounded-xl w-auto px-4.5 py-2 text-[13px] cursor-pointer font-bold">← Đối chiếu ảnh khác</button>}
      {(phase==="ready"||phase==="error") && face && <CaptchaBox elRef={captchaEl}/>}
      {(phase==="ready"||phase==="error") && face && <button onClick={search} disabled={!captchaToken} className={btnCls("warn")}>🔎 Tìm người giống khuôn mặt này</button>}
      {!preview && <button disabled className={btnCls("ghost")}>🔎 Chọn ảnh trước</button>}
    </Modal>
  );
}

// ─── Kết quả dò tin trùng khớp sau khi đăng ──────────────────────────────────
function MatchResult({ matches, onClose }) {
  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">🔔</div>
        <div className="font-black text-xl text-slate-900 mb-1.5">Tin đã đăng — có {matches.length} tin có thể khớp!</div>
        <div className="text-[13px] text-slate-400 leading-snug">Hãy gọi điện để xác minh. Giấy tờ chỉ nên trao khi đối chiếu đúng thông tin.</div>
      </div>
      {matches.map(m => (
        <div key={m.id} className={`bg-slate-50 border rounded-xl px-3.5 py-3 mb-2.5 ${m.score>=90?"border-gold-400":"border-slate-200"}`}>
          <div className="flex justify-between items-center gap-2 mb-1.5 flex-wrap">
            <span className={`font-extrabold text-[13px] ${m.score>=90?"text-gold-600":"text-ok-600"}`}>{m.reason}</span>
            <span className="text-xs text-slate-400">{m.type==="found" ? "Người khác đã nhặt được" : "Người khác đang tìm"}</span>
          </div>
          <div className="text-sm font-bold mb-1 text-slate-900">{catIcon(m.category)} {m.title || m.category}</div>
          <div className="text-xs text-slate-400 mb-2">📍 {m.location} · 📅 {m.date}</div>
          <a href={`tel:${String(m.contact||"").replace(/[^\d+]/g,"")}`} className="block text-center bg-ok-500 hover:bg-ok-600 rounded-lg py-2.5 text-white font-extrabold text-sm no-underline transition">📞 Gọi {m.contact}</a>
        </div>
      ))}
      <button onClick={onClose} className={btnCls("ghost", "mt-1.5")}>Đóng</button>
    </div>
  );
}

// ─── Post Item Modal ──────────────────────────────────────────────────────────
const emptyItem = { title:"", category:"CMND/CCCD", hoTen:"", soGiayTo:"", ngaySinh:"", gioiTinh:"", queQuan:"", diaChiThuongTru:"", location:"", contact:"", reward:"", note:"" };
function PostItemModal({ onClose, onAdd }) {
  const [ptype, setPtype] = useState("found");
  const [form, setForm] = useState(emptyItem);
  const [done, setDone] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [docPrev, setDocPrev] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [matches, setMatches] = useState(null);
  const { elRef: captchaEl, token: captchaToken, reset: resetCaptcha } = useTurnstile();
  const set = k => v => setForm(f=>({...f,[k]:v}));
  const isDoc = ["CMND/CCCD","Bằng lái xe","Hộ chiếu"].includes(form.category);
  const onFill = (r, prev) => {
    setDocPrev(prev);
    setForm(f=>({ ...f, category:r.loaiGiayTo ? docCategory(r.loaiGiayTo) : f.category, hoTen:r.hoTen||f.hoTen, soGiayTo:r.soGiayTo||f.soGiayTo, ngaySinh:r.ngaySinh||f.ngaySinh, gioiTinh:r.gioiTinh||f.gioiTinh, queQuan:r.queQuan||f.queQuan, diaChiThuongTru:r.diaChiThuongTru||f.diaChiThuongTru, title:r.hoTen?`${r.loaiGiayTo||"Giấy tờ"} mang tên ${r.hoTen}`:f.title, note:r.moTaThem||f.note }));
  };
  const submit = async () => {
    if (busy || !form.title || !form.location || !form.contact) return;
    if (!captchaToken) { setErr("Vui lòng xác nhận CAPTCHA (ô bên dưới) trước khi đăng."); return; }
    setBusy(true); setErr("");
    const res = await onAdd({ id:uid(), type:ptype, ...form, img:catIcon(form.category), date:fmtDate() }, captchaToken);
    resetCaptcha();
    setBusy(false);
    if (!res?.ok) { setErr(res?.error || "Không lưu được tin (kiểm tra số điện thoại hoặc thử lại sau)."); return; }
    setDone(true);
    if (res.matches?.length) setMatches(res.matches);
    else setTimeout(onClose, 1800);
  };
  return (<>
    <Modal onClose={onClose} className="max-h-[92vh] overflow-y-auto">
      {done && matches?.length ? <MatchResult matches={matches} onClose={onClose}/> : done ? <div className="text-center py-[50px]"><div className="text-6xl mb-4">🎉</div><div className="font-black text-2xl text-slate-900">Đăng tin thành công!</div></div> : <>
        <div className="font-black text-xl text-slate-900 mb-5">📝 Đăng tin đồ vật</div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
          {[["found","🟢 Tôi nhặt được"],["lost","🔵 Tôi bị mất"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPtype(v)} className={`flex-1 py-2.5 rounded-lg border-none font-bold text-[13px] cursor-pointer transition ${ptype===v?(v==="found"?"bg-ok-500 text-white":"bg-brand-600 text-white"):"bg-transparent text-slate-500 hover:bg-slate-200"}`}>{l}</button>
          ))}
        </div>
        <div className="bg-ai-50 border border-ai-200 rounded-2xl px-4 py-3.5 mb-4.5 mb-5 flex items-center gap-3">
          <span className="text-[26px]">🤖</span>
          <div className="flex-1"><div className="font-bold text-sm text-slate-900">Tự động điền bằng AI</div><div className="text-xs text-slate-500 mt-0.5">Chụp ảnh giấy tờ → AI đọc & điền form</div></div>
          <button onClick={()=>setShowScan(true)} className="bg-ai-600 hover:bg-ai-700 border-none rounded-lg px-3.5 py-2 text-white font-bold text-xs cursor-pointer whitespace-nowrap transition">Quét ✨</button>
        </div>
        {docPrev && <div className="mb-4 rounded-lg overflow-hidden border border-ai-300 relative">
          <img src={docPrev} alt="" className="w-full max-h-[90px] object-cover object-top"/>
          <div className="absolute top-2 right-2 bg-ai-600/90 rounded-lg px-2.5 py-0.5 text-[11px] font-bold text-white">✅ Đã quét AI</div>
          <button onClick={()=>setShowScan(true)} className="absolute top-2 left-2 bg-black/60 border-none rounded-lg px-2.5 py-0.5 text-[11px] text-slate-200 cursor-pointer">🔄 Quét lại</button>
        </div>}
        <Field label="Tên / Mô tả đồ vật" value={form.title} onChange={set("title")} placeholder="VD: CCCD mang tên Nguyễn Văn A" required/>
        <Select label="Loại đồ vật" value={form.category} onChange={set("category")} options={ITEM_CAT}/>
        {isDoc && <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 mb-3.5">
          <SectionTitle icon="📋" text="Thông tin trên giấy tờ"/>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label="Họ và tên" value={form.hoTen} onChange={set("hoTen")} placeholder="Nguyễn Văn A"/>
            <Field label="Số giấy tờ" value={form.soGiayTo} onChange={set("soGiayTo")} placeholder="079201012345"/>
            <Field label="Ngày sinh" value={form.ngaySinh} onChange={set("ngaySinh")} placeholder="01/01/1990"/>
            <Field label="Giới tính" value={form.gioiTinh} onChange={set("gioiTinh")} placeholder="Nam / Nữ"/>
          </div>
          <Field label="Quê quán" value={form.queQuan} onChange={set("queQuan")} placeholder="Hà Nội"/>
          <Field label="Địa chỉ thường trú" value={form.diaChiThuongTru} onChange={set("diaChiThuongTru")} placeholder="123 Đường ABC, Quận 1"/>
        </div>}
        <Field label="Địa điểm mất / nhặt được" value={form.location} onChange={set("location")} placeholder="VD: Quận 1, TP.HCM" required/>
        <Field label="Số điện thoại liên hệ" value={form.contact} onChange={set("contact")} placeholder="0901 234 567" type="tel" required/>
        {ptype==="lost" && <Field label="Tiền thưởng (nếu có)" value={form.reward} onChange={set("reward")} placeholder="VD: 200.000đ"/>}
        <Field label="Ghi chú thêm" value={form.note} onChange={set("note")} placeholder="Đặc điểm nhận dạng thêm…" multiline/>
        <CaptchaBox elRef={captchaEl}/>
        {err && <div className="bg-warn-50 border border-warn-300 rounded-lg px-3 py-2.5 text-[13px] text-warn-700 mb-3">{err}</div>}
        <button onClick={submit} disabled={busy||!captchaToken} className={btnCls(ptype==="found"?"found":"brand")}>{busy ? "Đang đăng…" : "Đăng tin ngay →"}</button>
      </>}
    </Modal>
    {showScan && <DocScanModal onClose={()=>setShowScan(false)} onFill={onFill}/>}
  </>);
}

// ─── Post Missing Modal ───────────────────────────────────────────────────────
const emptyMissing = { hoTen:"", tuoi:"", gioiTinh:"Nữ", danhTich:"", trangPhuc:"", lanCuoiThay:"", thoiGian:"", contact:"", reward:"", tieuChuan:"", urgency:"high" };
function PostMissingModal({ onClose, onAdd }) {
  const [ptype, setPtype] = useState("missing");
  const [form, setForm] = useState(emptyMissing);
  const [done, setDone] = useState(false);
  const [imgPrev, setImgPrev] = useState(null);
  const [faceState, setFaceState] = useState("idle");
  const [face, setFace] = useState(null);
  const [faceNote, setFaceNote] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [consent, setConsent] = useState(false);
  const [publicPhoto, setPublicPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [matches, setMatches] = useState(null);
  const token = useRef(0);
  const { elRef: captchaEl, token: captchaToken, reset: resetCaptcha } = useTurnstile();
  const set = k => v => setForm(f=>({...f,[k]:v}));
  const showPhoto = publicPhoto ?? (ptype === "missing");

  const { pick, inputEl } = useImagePicker(async src => {
    const my = ++token.current;
    setImgPrev(src); setFace(null); setFaceNote(""); setAiMsg(""); setFaceState("loading");
    try {
      const r = await computeFace(src);
      if (my !== token.current) return;
      if (!r.ok) { setFaceState("none"); return; }
      setFace(r.descriptor);
      setFaceNote([r.faces > 1 ? `Ảnh có ${r.faces} khuôn mặt — dùng khuôn mặt lớn nhất.` : "", r.tooSmall ? "Khuôn mặt hơi nhỏ, độ chính xác có thể giảm — nên dùng ảnh cận mặt." : ""].filter(Boolean).join(" "));
      setFaceState("ok");
    } catch (e) {
      console.error("Nhận diện khuôn mặt lỗi:", e);
      if (my === token.current) setFaceState("error");
    }
  });
  const removePhoto = () => { token.current++; setImgPrev(null); setFace(null); setFaceNote(""); setAiMsg(""); setFaceState("idle"); setConsent(false); };

  const describeWithAI = async () => {
    if (!imgPrev || aiBusy) return;
    setAiBusy(true); setAiMsg("");
    try {
      const small = await compressToDataUrl(imgPrev, 800, 0.8);
      const r = await callGemini(
        `Mô tả ngoại hình người trong ảnh để đăng tin tìm người thân (KHÔNG đoán danh tính). Chỉ trả về JSON duy nhất: {"doTuoi":"khoảng ... tuổi","gioiTinh":"Nam hoặc Nữ hoặc Không rõ","danhTich":"đặc điểm nhận dạng: dáng người, tóc, nốt ruồi, sẹo, kính…"}`,
        small.split(",")[1], "image/jpeg");
      setForm(f => ({ ...f,
        tuoi: f.tuoi || r.doTuoi || "",
        gioiTinh: ["Nam","Nữ"].includes(r.gioiTinh) ? r.gioiTinh : f.gioiTinh,
        danhTich: f.danhTich || r.danhTich || "" }));
      setAiMsg("✅ Đã điền gợi ý vào form — hãy kiểm tra lại cho đúng.");
    } catch (e) { setAiMsg("Không nhờ AI mô tả được: " + (e.message || e)); }
    setAiBusy(false);
  };

  const submit = async () => {
    if (busy) return;
    if (!form.hoTen || !form.lanCuoiThay || !form.contact) { setErr("Vui lòng điền Họ và tên, Địa điểm lần cuối thấy và Số điện thoại."); return; }
    if (faceState === "loading") { setErr("Đang phân tích ảnh, vui lòng chờ vài giây rồi bấm lại."); return; }
    if (imgPrev && !consent) { setErr("Vui lòng tích ô xác nhận về ảnh/khuôn mặt (hoặc bấm “Bỏ ảnh”)."); return; }
    if (!captchaToken) { setErr("Vui lòng xác nhận CAPTCHA (ô bên dưới) trước khi đăng."); return; }
    setBusy(true); setErr("");
    try {
      let photoPath = null;
      if (imgPrev && showPhoto) {
        let blob = await compressToJpegBlob(imgPrev, 800, 0.82);
        if (blob.size > 900 * 1024) blob = await compressToJpegBlob(imgPrev, 600, 0.6);
        photoPath = newUuid() + ".jpg";
        const up = await supabase.storage.from(PHOTO_BUCKET).upload(photoPath, blob, { contentType:"image/jpeg", upsert:false });
        if (up.error) throw new Error("Không tải được ảnh lên: " + up.error.message + ". Bạn có thể bỏ tích “hiển thị ảnh công khai” rồi đăng lại.");
      }
      const avatars = { "Nam":ptype==="missing"?"🧑":"👦", "Nữ":ptype==="missing"?"👩":"👧" };
      const note = form.tieuChuan.trim();
      const res = await onAdd({
        id:uid(), type:ptype, ...form,
        danhTich: (form.danhTich + (note ? `\nLưu ý: ${note}` : "")).trim(),
        avatar:avatars[form.gioiTinh]||"👤", date:fmtDate(),
        face: face || null, photoPath, photoPublic: !!photoPath,
      }, captchaToken);
      resetCaptcha();
      if (!res?.ok) throw new Error(res?.error || "Không lưu được tin, vui lòng thử lại.");
      setDone(true);
      if (res.matches?.length) setMatches(res.matches); else setTimeout(onClose, 1800);
    } catch (e) { setErr(e.message || "Có lỗi xảy ra, vui lòng thử lại."); }
    setBusy(false);
  };
  const toneCls = ptype==="missing" ? "warn" : "found";
  const toneDash = ptype==="missing" ? "border-warn-500" : "border-ok-500";
  const toneBg = ptype==="missing" ? "bg-warn-50/60" : "bg-ok-50/60";
  const chkCls = "flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed cursor-pointer mb-2";
  return (
    <Modal onClose={onClose} className="max-h-[92vh] overflow-y-auto">
      {inputEl}
      {done && matches?.length ? <PersonMatchResult matches={matches} onClose={onClose}/> : done ? <div className="text-center py-[50px]"><div className="text-6xl mb-4">🙏</div><div className="font-black text-2xl text-slate-900 mb-2">Tin đã được đăng!</div><div className="text-[13px] text-slate-400">Chưa thấy tin nào khớp lúc này. Khi có người đăng tin về đúng người này, họ sẽ thấy số liên hệ của bạn.</div></div> : <>
        <div className="font-black text-xl text-slate-900 mb-5">👤 Đăng tin tìm người thân</div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
          {[["missing","🟠 Tôi đang tìm"],["found_person","🟢 Tôi gặp người lạc"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPtype(v)} className={`flex-1 py-2.5 px-2 rounded-lg border-none font-bold text-[13px] cursor-pointer transition ${ptype===v?(v==="missing"?"bg-warn-600 text-white":"bg-ok-500 text-white"):"bg-transparent text-slate-500 hover:bg-slate-200"}`}>{l}</button>
          ))}
        </div>
        <div className="mb-3.5">
          <label className="block text-[11px] text-slate-500 mb-2 font-bold uppercase tracking-wide">
            Ảnh khuôn mặt {ptype==="missing" ? "người cần tìm" : "người bạn gặp"} <span className="text-ai-600 font-normal normal-case">· giúp hệ thống nhận ra dù đổi quần áo</span>
          </label>
          <div onClick={pick} className={`border-2 border-dashed rounded-xl text-center cursor-pointer min-h-[100px] flex items-center justify-center ${imgPrev ? `p-2 ${toneDash} ${toneBg}` : "p-5 border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
            {imgPrev ? <div className="relative w-full"><img src={imgPrev} alt="" className="max-h-40 max-w-full rounded-lg object-contain mx-auto"/>{faceState==="loading" && <div className="absolute inset-0 bg-black/55 rounded-lg flex items-center justify-center text-sm text-white">⏳ Đang phân tích khuôn mặt…</div>}</div>
            : <div><div className="text-[34px] mb-2">🖼️</div><div className="font-bold text-sm text-slate-700">Tải ảnh rõ mặt</div><div className="text-xs text-slate-400 mt-1">Ảnh chụp thẳng, đủ sáng cho kết quả tốt nhất</div></div>}
          </div>
          {imgPrev && <div className="flex gap-2 mt-2 flex-wrap">
            <button onClick={pick} className="bg-transparent border border-slate-300 rounded-lg px-3 py-1.5 text-slate-500 text-xs cursor-pointer">🔄 Đổi ảnh</button>
            <button onClick={removePhoto} className="bg-transparent border border-slate-300 rounded-lg px-3 py-1.5 text-slate-500 text-xs cursor-pointer">✖ Bỏ ảnh</button>
            <button onClick={describeWithAI} disabled={aiBusy} className="bg-ai-50 border border-ai-200 rounded-lg px-3 py-1.5 text-ai-700 text-xs cursor-pointer disabled:opacity-60">{aiBusy ? "🤖 AI đang mô tả…" : "🤖 Nhờ AI mô tả giúp"}</button>
          </div>}
          {aiMsg && <div className="text-xs text-slate-600 mt-1.5">{aiMsg}</div>}
          {imgPrev && <div className="text-[11px] text-slate-400 mt-1">Nút "Nhờ AI mô tả" sẽ gửi một bản ảnh nhỏ tới dịch vụ AI (Claude) để mô tả ngoại hình. Nhận diện khuôn mặt thì chạy ngay trên máy bạn.</div>}
          {faceState==="ok" && <div className="text-xs text-ok-600 mt-2">✅ Đã nhận diện khuôn mặt — hệ thống sẽ dò các tin khớp {ptype==="missing" ? "trong danh sách người đã được gặp" : "trong danh sách người đang được tìm"}. {faceNote && <span className="text-gold-600">{faceNote}</span>}</div>}
          {faceState==="none" && <div className="text-xs text-gold-600 mt-2">⚠️ Không thấy khuôn mặt rõ trong ảnh. Vẫn đăng được nhưng hệ thống chỉ dò theo họ tên. Hãy thử ảnh chụp rõ mặt hơn.</div>}
          {faceState==="error" && <div className="text-xs text-gold-600 mt-2">⚠️ Trình duyệt này không chạy được nhận diện khuôn mặt. Bạn vẫn đăng được tin (dò theo họ tên).</div>}
        </div>
        <Field label="Họ và tên" value={form.hoTen} onChange={set("hoTen")} placeholder={ptype==="missing"?"Nguyễn Thị Lan":"Không rõ tên"} required/>
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Tuổi / Năm sinh" value={form.tuoi} onChange={set("tuoi")} placeholder="72 tuổi / 1952"/>
          <Select label="Giới tính" value={form.gioiTinh} onChange={set("gioiTinh")} options={["Nam","Nữ","Không rõ"]}/>
        </div>
        <Field label="Đặc điểm nhận dạng" value={form.danhTich} onChange={set("danhTich")} placeholder="Tóc bạc, chiều cao ~1m55, nốt ruồi má trái…" multiline required hint="Mô tả càng chi tiết càng dễ nhận ra"/>
        <Field label="Trang phục khi mất tích" value={form.trangPhuc} onChange={set("trangPhuc")} placeholder="Áo bà ba xanh, quần đen, dép tổ ong"/>
        <Field label="Địa điểm lần cuối thấy" value={form.lanCuoiThay} onChange={set("lanCuoiThay")} placeholder="Chợ Bến Thành, Quận 1, TP.HCM" required/>
        <Field label="Thời gian" value={form.thoiGian} onChange={set("thoiGian")} placeholder="14:00 ngày 16/05/2026"/>
        {ptype==="missing" && <>
          <Field label="Lưu ý thêm (hiển thị công khai)" value={form.tieuChuan} onChange={set("tieuChuan")} placeholder="VD: người hay quên đường, cần dùng thuốc…" multiline hint="Tin đăng là công khai — không ghi bệnh án chi tiết"/>
          <Select label="Mức độ khẩn cấp" value={form.urgency} onChange={set("urgency")} options={[["high","🚨 Khẩn cấp"],["medium","⚠️ Bình thường"]]}/>
        </>}
        <Field label="Số điện thoại liên hệ" value={form.contact} onChange={set("contact")} placeholder="0901 234 567" type="tel" required/>
        {ptype==="missing" && <Field label="Tiền thưởng (nếu có)" value={form.reward} onChange={set("reward")} placeholder="VD: 2.000.000đ"/>}
        {imgPrev && <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-3.5">
          <label className={chkCls}>
            <input type="checkbox" checked={showPhoto} onChange={e=>setPublicPhoto(e.target.checked)} className="mt-0.5"/>
            <span><strong>Hiển thị ảnh công khai trên trang</strong>{ptype==="found_person" ? " — mặc định TẮT để bảo vệ người bạn gặp; hệ thống vẫn so khuôn mặt và báo cho gia đình đang tìm." : " — giúp nhiều người nhận ra hơn."}</span>
          </label>
          <label className={`${chkCls} mb-0`}>
            <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-0.5"/>
            <span>Tôi đăng ảnh này với mục đích giúp {ptype==="missing" ? "tìm người thân" : "người lạc đoàn tụ với gia đình"}, và đồng ý để hệ thống lưu <strong>dãy số đặc trưng khuôn mặt</strong> (không phải ảnh) để đối chiếu. Tôi sẽ nhờ quản trị viên đóng tin khi đã tìm thấy.</span>
          </label>
        </div>}
        <CaptchaBox elRef={captchaEl}/>
        {err && <div className="bg-warn-50 border border-warn-300 rounded-lg px-3 py-2.5 text-[13px] text-warn-700 mb-3">{err}</div>}
        <button onClick={submit} disabled={busy||!captchaToken} className={btnCls(toneCls)}>{busy ? "Đang đăng…" : "🙏 Đăng tin ngay"}</button>
      </>}
    </Modal>
  );
}

// ─── Item Detail Modal ────────────────────────────────────────────────────────
function ItemDetail({ item, onClose }) {
  const tone = item.type==="lost" ? TONE.lost : TONE.found;
  const sensitive = isSensitive(item);
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-3.5 mb-4.5 mb-5">
        <div className={`w-15 h-15 w-[60px] h-[60px] rounded-2xl ${tone.soft} border ${tone.chipBorder} flex items-center justify-center text-[30px] shrink-0`}>{item.img}</div>
        <div>
          <Chip text={item.type==="lost"?"🟠 Đang tìm":"🟢 Đã nhặt được"} className={`${tone.chipBg} ${tone.chipText} ${tone.chipBorder}`}/>
          <h2 className="font-black text-lg leading-tight my-2 text-slate-900">{sensitive ? privateTitle(item) : item.title}</h2>
          <div className="text-xs text-slate-400">Đăng ngày {item.date}</div>
        </div>
      </div>
      {sensitive && <div className="bg-gold-50 border border-gold-400/40 rounded-2xl px-4 py-3.5 mb-4">
        <div className="flex gap-2.5 items-start mb-3">
          <span className="text-[22px] shrink-0">🔒</span>
          <div>
            <div className="font-extrabold text-sm mb-1 text-gold-600">Thông tin đang được bảo mật</div>
            <div className="text-[13px] text-slate-500 leading-relaxed">Số giấy tờ, ngày sinh và địa chỉ chi tiết chỉ hiển thị sau khi xác minh trùng khớp.</div>
          </div>
        </div>
        <div className="bg-white/70 rounded-lg px-3 py-2.5 mb-3">
          <div className="text-xs text-slate-600 font-bold mb-2">📋 Thông tin đã che:</div>
          <div className="flex flex-col gap-1.5">
            {item.soGiayTo && <div className="flex justify-between text-xs"><span className="text-slate-400">Số giấy tờ</span><span className="text-gold-600 font-bold tracking-widest">{maskID(item.soGiayTo)}</span></div>}
            {item.ngaySinh && <div className="flex justify-between text-xs"><span className="text-slate-400">Ngày sinh</span><span className="text-gold-600 font-bold">{maskDate(item.ngaySinh)}</span></div>}
            {item.diaChiThuongTru && <div className="flex justify-between text-xs"><span className="text-slate-400">Địa chỉ</span><span className="text-gold-600 font-bold">{maskAddress(item.diaChiThuongTru)}</span></div>}
          </div>
        </div>
        <div className="text-xs text-slate-500 leading-loose">
          💡 <strong className="text-slate-700">Để xác minh:</strong> Gọi điện cho người đăng và cung cấp:<br/>
          1. Số 3 chữ số đầu của giấy tờ<br/>
          2. Tháng và năm sinh<br/>
          3. Tỉnh/thành phố trên giấy tờ
        </div>
      </div>}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-3.5">
        <SectionTitle icon="📍" text="Thông tin địa điểm"/>
        <InfoRow label="Loại đồ vật" value={item.category}/>
        <InfoRow label="Địa điểm" value={item.location}/>
        <InfoRow label="Ngày đăng" value={item.date}/>
      </div>
      {item.note && !sensitive && <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-3.5">
        <SectionTitle icon="📝" text="Ghi chú"/>
        <p className="text-sm text-slate-600 leading-relaxed m-0">{item.note}</p>
      </div>}
      {(item.hoTen||item.soGiayTo) && <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-3.5">
        <SectionTitle icon="📋" text="Thông tin trên giấy tờ"/>
        <InfoRow label="Họ và tên" value={sensitive ? "*** ***" : item.hoTen}/>
        <InfoRow label="Số giấy tờ" value={sensitive ? maskID(item.soGiayTo) : item.soGiayTo}/>
        <InfoRow label="Ngày sinh" value={sensitive ? maskDate(item.ngaySinh) : item.ngaySinh}/>
        {item.diaChiThuongTru && <InfoRow label="Địa chỉ" value={sensitive ? maskAddress(item.diaChiThuongTru) : item.diaChiThuongTru}/>}
      </div>}
      {item.reward && <div className="bg-gold-50 border border-gold-400/30 rounded-lg px-4 py-3 mb-3.5 flex items-center gap-2">
        <span className="text-xl">🏆</span><span className="text-gold-600 font-bold text-[15px]">Tiền thưởng: {item.reward}</span>
      </div>}
      <div className="border-t border-slate-200 pt-4">
        <div className="text-xs text-slate-400 mb-2">{sensitive?"📞 Liên hệ để xác minh và nhận lại giấy tờ:":"📞 Liên hệ để trả / nhận đồ:"}</div>
        <a href={`tel:${item.contact}`} className={`block ${tone.solid} rounded-xl p-3.5 text-white font-extrabold text-[17px] no-underline text-center transition`}>{item.contact}</a>
        {sensitive && <div className="text-center text-xs text-slate-400 mt-2">🔒 Thông tin giấy tờ chỉ xác nhận qua điện thoại</div>}
      </div>
    </Modal>
  );
}

// ─── Missing Detail Modal ─────────────────────────────────────────────────────
function MissingDetail({ person, onClose, onFaceSearch }) {
  const isFound = person.type==="found_person";
  const uTone = person.urgency==="high" && !isFound ? TONE.urgent_high : isFound ? TONE.found_person : TONE.urgent_medium;
  return (
    <Modal onClose={onClose}>
      <div className="flex gap-3.5 items-start mb-4.5 mb-5">
        <div className={`w-16 h-16 rounded-2xl ${uTone.chipBg} border ${uTone.chipBorder} flex items-center justify-center text-[34px] shrink-0 overflow-hidden`}>
          {person.img ? <img src={person.img} alt="" className="w-full h-full object-cover rounded-[14px]"/> : person.avatar}
        </div>
        <div>
          {!isFound && person.urgency==="high" && <Chip text="🚨 Khẩn cấp" className="bg-red-50 text-red-700 border-red-200"/>}
          {isFound && <Chip text="🟢 Đã gặp được" className="bg-ok-50 text-ok-700 border-ok-200"/>}
          {!isFound && person.urgency==="medium" && <Chip text="⚠️ Đang tìm" className="bg-warn-50 text-warn-700 border-warn-200"/>}
          <h2 className="font-black text-[19px] my-2 text-slate-900">{person.hoTen}</h2>
          <div className="text-[13px] text-slate-400">{person.tuoi} · {person.gioiTinh}</div>
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-3.5">
        <SectionTitle icon="🔍" text="Đặc điểm nhận dạng"/>
        <p className="text-sm text-slate-800 leading-relaxed m-0 mb-2.5">{person.danhTich}</p>
        {person.trangPhuc && <InfoRow label="👔 Trang phục" value={person.trangPhuc}/>}
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-3.5">
        <SectionTitle icon="📍" text="Thông tin sự cố"/>
        <InfoRow label="Lần cuối thấy" value={person.lanCuoiThay}/>
        <InfoRow label="Thời gian" value={person.thoiGian}/>
        <InfoRow label="Ngày đăng tin" value={person.date}/>
        {person.tieuChuan && <InfoRow label="Ghi chú" value={person.tieuChuan}/>}
      </div>
      {person.reward && <div className="bg-gold-50 border border-gold-400/30 rounded-lg px-4 py-3 mb-3.5 flex items-center gap-2">
        <span className="text-xl">🏆</span><span className="text-gold-600 font-bold text-[15px]">Tiền thưởng: {person.reward}</span>
      </div>}
      <button onClick={()=>{onClose();onFaceSearch();}} className={btnCls("ai", "mb-2.5")}>🔎 Tôi có ảnh — Đối chiếu ngay</button>
      <div className="border-t border-slate-200 pt-3.5">
        <div className="text-xs text-slate-400 mb-2">📞 Liên hệ ngay nếu có thông tin:</div>
        <a href={`tel:${person.contact}`} className={`block ${uTone.solid||"bg-warn-600 hover:bg-warn-700"} rounded-xl p-3.5 text-white font-extrabold text-[17px] no-underline text-center transition`}>{person.contact}</a>
      </div>
    </Modal>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, onClick }) {
  const tone = item.type==="lost" ? TONE.lost : TONE.found;
  const sensitive = isSensitive(item);
  return (
    <div onClick={onClick}
      className={`${cardCls} p-4.5 p-[18px] cursor-pointer transition-all duration-150 relative hover:-translate-y-1 hover:shadow-lg hover:${tone.ring}`}>
      <div className="absolute top-3.5 right-3.5"><Chip text={item.type==="lost"?"Đang tìm":"Đã nhặt"} className={`${tone.chipBg} ${tone.chipText} ${tone.chipBorder}`}/></div>
      <div className={`text-[32px] mb-3 w-13 h-13 w-[52px] h-[52px] ${tone.soft} rounded-xl flex items-center justify-center`}>{item.img}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{item.category}</div>
      <div className="font-bold text-sm mb-1.5 leading-snug pr-[70px] text-slate-900">{sensitive ? privateTitle(item) : item.title}</div>
      {item.hoTen && <div className="text-[11px] text-ai-600 font-semibold mb-1.5">
        👤 {sensitive ? "*** ***" : item.hoTen}
        {item.soGiayTo && <span className="text-slate-400"> · {sensitive ? maskID(item.soGiayTo) : item.soGiayTo}</span>}
      </div>}
      {sensitive && item.type==="found" && <div className="text-[10px] text-gold-600 mb-1 flex items-center gap-1">🔒 <span>Thông tin được bảo mật — Liên hệ để xác minh</span></div>}
      <div className="text-[11px] text-slate-400">📍 {item.location}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">📅 {item.date}</div>
      {sensitive && <div className="mt-2 flex items-center gap-1"><span className="text-[11px]">🔒</span><span className="text-[11px] text-slate-400">Bấm để liên hệ xác minh</span></div>}
      {item.reward && <div className="mt-2 bg-gold-50 rounded-lg px-2.5 py-1 inline-block"><span className="text-xs text-gold-600 font-bold">🏆 {item.reward}</span></div>}
    </div>
  );
}

// ─── Missing Card ─────────────────────────────────────────────────────────────
function MissingCard({ person, onClick }) {
  const isFound = person.type==="found_person";
  const uTone = person.urgency==="high" && !isFound ? TONE.urgent_high : isFound ? TONE.found_person : TONE.urgent_medium;
  return (
    <div onClick={onClick}
      className={`${cardCls} p-4.5 p-[18px] cursor-pointer transition-all duration-150 relative hover:-translate-y-1 hover:shadow-lg`}>
      {person.urgency==="high" && !isFound && <div className="absolute top-3.5 right-3.5"><Chip text="🚨 Khẩn" className="bg-red-50 text-red-700 border-red-200"/></div>}
      {isFound && <div className="absolute top-3.5 right-3.5"><Chip text="🟢 Đã gặp" className="bg-ok-50 text-ok-700 border-ok-200"/></div>}
      {!isFound && person.urgency==="medium" && <div className="absolute top-3.5 right-3.5"><Chip text="⚠️ Tìm kiếm" className="bg-warn-50 text-warn-700 border-warn-200"/></div>}
      <div className="flex items-center gap-3 mb-2.5">
        <div className={`w-[50px] h-[50px] rounded-xl ${uTone.chipBg} border ${uTone.chipBorder} flex items-center justify-center text-2xl shrink-0 overflow-hidden`}>
          {person.img ? <img src={person.img} alt="" className="w-full h-full object-cover"/> : person.avatar}
        </div>
        <div className="min-w-0 pr-16">
          <div className="font-extrabold text-sm leading-tight text-slate-900 truncate">{person.hoTen}</div>
          <div className="text-xs text-slate-400">{person.tuoi} · {person.gioiTinh}</div>
        </div>
      </div>
      <div className="text-xs text-slate-500 leading-relaxed mb-1.5">{person.danhTich.slice(0,90)}{person.danhTich.length>90?"…":""}</div>
      <div className="text-[11px] text-slate-400">📍 {person.lanCuoiThay}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">📅 {person.date}</div>
      {person.reward && <div className="mt-2 bg-gold-50 rounded-lg px-2.5 py-1 inline-block"><span className="text-xs text-gold-600 font-bold">🏆 {person.reward}</span></div>}
    </div>
  );
}

// ─── Login Modal (demo, chưa gắn với hệ thống xác thực thật) ─────────────────
function LoginModal({ onClose, onLogin }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const refs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const sendOtp = () => {
    if (phone.replace(/\s/g,"").length < 9) { setErr("Số điện thoại không hợp lệ"); return; }
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1500);
  };
  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < 5) refs[i+1].current?.focus();
  };
  const verify = () => {
    const code = otp.join("");
    if (code.length < 6) { setErr("Nhập đủ 6 số OTP"); return; }
    setLoading(true);
    setTimeout(() => {
      if (code === "123456") { setStep("done"); setTimeout(() => { onLogin({ phone }); onClose(); }, 1000); }
      else { setLoading(false); setErr("Mã OTP không đúng. Demo dùng: 123456"); }
    }, 1000);
  };
  return (
    <Modal onClose={onClose} className="max-w-[400px]">
      {step==="done" ? <div className="text-center py-10"><div className="text-[56px] mb-3.5">🎉</div><div className="font-black text-xl text-slate-900">Đăng nhập thành công!</div></div> : <>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-[28px] mx-auto mb-3">🔍</div>
          <div className="font-black text-xl text-slate-900">Đăng nhập TìmĐồ<span className="text-brand-600">.vn</span></div>
          <div className="text-[13px] text-slate-400 mt-1">{step==="phone"?"Nhập số điện thoại để nhận mã OTP":`Nhập mã OTP gửi đến ${phone}`}</div>
        </div>
        {step==="phone" && <>
          <div className="mb-3.5">
            <label className="block text-[11px] text-slate-500 mb-1.5 font-bold uppercase tracking-wide">Số điện thoại</label>
            <div className="flex gap-2">
              <div className="bg-slate-100 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-500">🇻🇳 +84</div>
              <input value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendOtp()} placeholder="090 123 4567" className={`${inputCls} flex-1`} maxLength={12}/>
            </div>
          </div>
          {err && <div className="text-warn-600 text-[13px] mb-2.5">⚠️ {err}</div>}
          <button onClick={sendOtp} disabled={loading} className={btnCls("brand")}>{loading?"Đang gửi OTP…":"Gửi mã OTP →"}</button>
          <div className="text-center mt-3.5 text-xs text-slate-400">Bằng cách đăng nhập, bạn đồng ý với <span className="text-brand-600 cursor-pointer">Điều khoản sử dụng</span></div>
        </>}
        {step==="otp" && <>
          <div className="flex gap-2 justify-center mb-5">
            {otp.map((v,i)=>(
              <input key={i} ref={refs[i]} value={v} onChange={e=>handleOtp(i,e.target.value)} onKeyDown={e=>e.key==="Backspace"&&!v&&i>0&&refs[i-1].current?.focus()} maxLength={1} inputMode="numeric"
                className={`w-[46px] h-[54px] text-center text-2xl font-extrabold bg-slate-50 border-2 rounded-xl text-slate-900 outline-none ${v?"border-brand-500":"border-slate-300"}`}/>
            ))}
          </div>
          {err && <div className="text-warn-600 text-[13px] mb-2.5 text-center">⚠️ {err}</div>}
          <button onClick={verify} disabled={loading} className={btnCls("brand")}>{loading?"Đang xác minh…":"Xác nhận"}</button>
          <div className="flex justify-between mt-3.5">
            <button onClick={()=>{setStep("phone");setOtp(["","","","","",""]);setErr("");}} className="bg-transparent border-none text-slate-400 text-[13px] cursor-pointer">← Đổi số</button>
            <button onClick={sendOtp} className="bg-transparent border-none text-brand-600 text-[13px] cursor-pointer font-semibold">Gửi lại OTP</button>
          </div>
          <div className="text-center mt-2.5 text-[11px] text-slate-400 bg-slate-50 rounded-lg px-2.5 py-1.5">💡 Demo: mã <strong className="text-gold-600">123456</strong></div>
        </>}
      </>}
    </Modal>
  );
}

// ─── Notifications Panel ──────────────────────────────────────────────────────
const DEMO_NOTIFS = [
  { id:1, type:"match",  read:false, time:"5 phút trước",  icon:"🎯", title:"Có tin khớp với đồ bạn đang tìm!", body:"Một người vừa đăng tin nhặt được Ví/Túi xách tại Đống Đa, Hà Nội.", action:"Xem ngay" },
  { id:2, type:"urgent", read:false, time:"12 phút trước", icon:"🚨", title:"Trường hợp khẩn cấp gần bạn",       body:"Em Phạm Quốc Bảo (8 tuổi) đang được tìm kiếm tại Công viên 23/9.", action:"Xem hồ sơ" },
  { id:3, type:"system", read:true,  time:"1 giờ trước",   icon:"✅", title:"Đăng ký thông báo thành công",       body:"Bạn sẽ nhận SMS khi có tin khớp với từ khóa đã đăng ký.", action:null },
  { id:4, type:"match",  read:true,  time:"3 giờ trước",   icon:"🔑", title:"Tin nhặt được khớp khu vực bạn",    body:"Chùm chìa khóa Honda nhặt được tại Bình Thạnh.", action:"Kiểm tra" },
];
function NotifPanel({ onClose, user }) {
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);
  const [tab, setTab] = useState("all");
  const [showSub, setShowSub] = useState(false);
  const [subPhone, setSubPhone] = useState(user?.phone||"");
  const [subKw, setSubKw] = useState("");
  const [subCh, setSubCh] = useState("sms");
  const [subDone, setSubDone] = useState(false);
  const unread = notifs.filter(n=>!n.read).length;
  const shown = tab==="unread" ? notifs.filter(n=>!n.read) : notifs;
  const tc = t => t==="match"?"text-ok-600":t==="urgent"?"text-warn-600":"text-ai-600";
  const tbg = t => t==="match"?"bg-ok-50":t==="urgent"?"bg-warn-50":"bg-ai-50";
  return (
    <div onClick={onClose} className="fixed inset-0 z-[500] bg-slate-900/40">
      <div onClick={e=>e.stopPropagation()} className="absolute top-[70px] right-4 w-[380px] max-w-[92vw] max-h-[80vh] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="px-4.5 px-[18px] pt-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="font-extrabold text-base text-slate-900">🔔 Thông báo {unread>0&&<span className="bg-warn-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full ml-1.5">{unread}</span>}</div>
            <div className="flex gap-2">
              {unread>0 && <button onClick={()=>setNotifs(p=>p.map(n=>({...n,read:true})))} className="bg-transparent border-none text-brand-600 text-xs cursor-pointer font-semibold">Đọc tất cả</button>}
              <button onClick={onClose} className="bg-slate-100 border-none rounded-md w-6.5 h-6.5 w-[26px] h-[26px] text-slate-500 cursor-pointer text-base">×</button>
            </div>
          </div>
          <div className="flex gap-1">
            {[["all","Tất cả"],["unread","Chưa đọc"]].map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v)} className={`px-3.5 py-1.5 rounded-t-lg border-none font-semibold text-xs cursor-pointer ${tab===v?"bg-slate-100 text-slate-900":"bg-transparent text-slate-400"}`}>{l}{v==="unread"&&unread>0?` (${unread})`:""}</button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {shown.length===0 ? <div className="text-center py-10 text-slate-400"><div className="text-4xl mb-2">🔕</div><div>Không có thông báo mới</div></div>
          : shown.map(n=>(
            <div key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))} className={`px-4.5 px-[18px] py-3.5 border-b border-slate-100 cursor-pointer ${n.read?"":tbg(n.type)}`}>
              <div className="flex gap-2.5">
                <div className={`w-[38px] h-[38px] rounded-lg ${tbg(n.type)} flex items-center justify-center text-lg shrink-0`}>{n.icon}</div>
                <div className="flex-1">
                  <div className={`text-[13px] leading-snug ${n.read?"font-semibold text-slate-600":"font-extrabold text-slate-900"}`}>{n.title}</div>
                  <div className="text-xs text-slate-400 leading-relaxed mt-0.5">{n.body}</div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[11px] text-slate-400">{n.time}</span>
                    {n.action && <span className={`text-[11px] font-bold cursor-pointer ${tc(n.type)}`}>{n.action} →</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 px-4.5 px-[18px] py-3">
          {!showSub ? <button onClick={()=>setShowSub(true)} className={btnCls("ai", "py-2.5 text-[13px]")}>📲 Đăng ký nhận thông báo SMS / Zalo</button>
          : subDone ? <div className="text-center py-2.5 text-ok-600 font-bold">✅ Đăng ký thành công!</div>
          : <div>
              <div className="font-bold text-[13px] mb-2.5 text-slate-900">📲 Cài đặt thông báo</div>
              <div className="flex gap-1.5 mb-2">
                {[["sms","📱 SMS"],["zalo","💬 Zalo"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setSubCh(v)} className={`flex-1 py-2 rounded-lg border font-semibold text-[13px] cursor-pointer ${subCh===v?"border-ai-500 bg-ai-50 text-ai-700":"border-slate-300 bg-transparent text-slate-500"}`}>{l}</button>
                ))}
              </div>
              <input value={subPhone} onChange={e=>setSubPhone(e.target.value)} placeholder="090 123 4567" className={`${inputCls} text-[13px] mb-2`}/>
              <input value={subKw} onChange={e=>setSubKw(e.target.value)} placeholder="Từ khóa: ví, CCCD, Quận 1…" className={`${inputCls} text-[13px] mb-2.5`}/>
              <div className="flex gap-2">
                <button onClick={()=>setShowSub(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-xl py-2.5 text-[13px] text-slate-600 border-none cursor-pointer font-bold">Huỷ</button>
                <button onClick={()=>setSubDone(true)} className="flex-[2] bg-ai-600 hover:bg-ai-700 rounded-xl py-2.5 text-[13px] text-white border-none cursor-pointer font-bold">Đăng ký</button>
              </div>
            </div>}
        </div>
      </div>
    </div>
  );
}

// ─── Map Modal ────────────────────────────────────────────────────────────────
const MAP_PINS = [
  { id:1, lat:10.7769, lng:106.7009, title:"CCCD — Đang tìm",        location:"Quận 1, TP.HCM",      type:"lost",    cat:"item" },
  { id:2, lat:21.0285, lng:105.8542, title:"Bằng lái xe B2",          location:"Hoàn Kiếm, Hà Nội",   type:"found",   cat:"item" },
  { id:3, lat:21.0245, lng:105.8412, title:"Ví da đen",               location:"Đống Đa, Hà Nội",     type:"lost",    cat:"item" },
  { id:4, lat:10.8100, lng:106.7100, title:"Chìa khóa Honda",         location:"Bình Thạnh, TP.HCM",  type:"found",   cat:"item" },
  { id:101,lat:10.7731,lng:106.6980, title:"Bà Nguyễn Thị Lan (72t)", location:"Chợ Bến Thành",       type:"missing", cat:"person" },
  { id:102,lat:10.7710,lng:106.6920, title:"Em Phạm Quốc Bảo (8t)",   location:"Công viên 23/9",       type:"missing", cat:"person" },
];
const PIN_COLOR = { lost:"#2563EB", found:"#10B981", missing:"#EA580C" };
function MapModal({ onClose }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [pick, setPick] = useState(false);
  const [picked, setPicked] = useState(null);
  const pins = MAP_PINS.filter(p => filter==="all"||(filter==="items"&&p.cat==="item")||(filter==="missing"&&p.cat==="person"));
  const toX = lng => ((lng-102)/(110-102))*100;
  const toY = lat => ((23.5-lat)/(23.5-8.5))*100;
  return (
    <Modal onClose={onClose} className="max-w-[680px] p-0 overflow-hidden">
      <div className="px-5.5 px-[22px] pt-4.5 pt-[18px] pb-3.5 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="font-extrabold text-lg text-slate-900">🗺️ Bản đồ tin đăng</div>
          <button onClick={onClose} className="bg-slate-100 border-none rounded-lg w-[30px] h-[30px] text-slate-500 cursor-pointer text-lg">×</button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[["all","🗺️ Tất cả"],["items","🪪 Đồ vật"],["missing","👤 Người thân"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setFilter(v);setSelected(null);}} className={`px-3.5 py-1.5 rounded-lg border font-semibold text-xs cursor-pointer ${filter===v?"border-brand-500 bg-brand-50 text-brand-700":"border-slate-300 bg-transparent text-slate-500"}`}>{l}</button>
          ))}
          <button onClick={()=>setPick(!pick)} className={`ml-auto px-3.5 py-1.5 rounded-lg border font-semibold text-xs cursor-pointer ${pick?"border-ai-500 bg-ai-50 text-ai-700":"border-slate-300 bg-transparent text-slate-500"}`}>
            {pick?"✅ Đang chọn":"📍 Chọn vị trí"}
          </button>
        </div>
      </div>
      <div className="relative bg-slate-900" style={{ cursor:pick?"crosshair":"default" }}
        onClick={e=>{
          if (!pick) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const lng = 102+((e.clientX-rect.left)/rect.width)*(110-102);
          const lat = 23.5-((e.clientY-rect.top)/rect.height)*(23.5-8.5);
          setPicked({ lat:lat.toFixed(4), lng:lng.toFixed(4) });
        }}>
        <svg viewBox="0 0 100 100" className="w-full h-[380px] block" preserveAspectRatio="none">
          <rect width="100" height="100" fill="#0F172A"/>
          <path d="M 52 5 L 58 8 L 64 12 L 68 18 L 70 25 L 66 32 L 72 38 L 74 44 L 70 50 L 65 55 L 68 62 L 66 70 L 60 78 L 54 85 L 50 90 L 46 85 L 44 78 L 46 70 L 42 62 L 40 55 L 38 48 L 42 42 L 38 36 L 36 30 L 40 22 L 44 15 L 48 8 Z" fill="#1E293B" stroke="#334155" strokeWidth="0.5"/>
          {[{n:"Hà Nội",lat:21.03,lng:105.85},{n:"TP.HCM",lat:10.78,lng:106.70},{n:"Đà Nẵng",lat:16.05,lng:108.22}].map(c=>(
            <text key={c.n} x={toX(c.lng)} y={toY(c.lat)+5} fontSize="2" fill="#64748B" textAnchor="middle">{c.n}</text>
          ))}
          {pins.map(p=>{
            const x=toX(p.lng), y=toY(p.lat), color=PIN_COLOR[p.type]||"#2563EB", sel=selected?.id===p.id;
            return <g key={p.id} onClick={e=>{e.stopPropagation();setSelected(p);}} style={{ cursor:"pointer" }}>
              <circle cx={x} cy={y} r={sel?3.5:2.5} fill={color} opacity={0.9}/>
              <circle cx={x} cy={y} r={sel?5:4} fill={color} opacity={0.2}/>
              {sel && <circle cx={x} cy={y} r={7} fill="none" stroke={color} strokeWidth="0.5" opacity={0.5}/>}
            </g>;
          })}
          {picked && <>
            <circle cx={toX(parseFloat(picked.lng))} cy={toY(parseFloat(picked.lat))} r="3" fill="#6366F1" opacity={0.9}/>
            <circle cx={toX(parseFloat(picked.lng))} cy={toY(parseFloat(picked.lat))} r="6" fill="#6366F1" opacity={0.2}/>
          </>}
        </svg>
        <div className="absolute top-3 left-3 bg-black/70 rounded-lg px-3 py-2 flex flex-col gap-1.5">
          {[["Đang tìm đồ","#2563EB"],["Đã nhặt được","#10B981"],["Người mất tích","#EA580C"]].map(([l,c])=>(
            <div key={l} className="flex items-center gap-1.5 text-[11px] text-slate-200">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:c }}/>{l}
            </div>
          ))}
        </div>
        {pick && <div className="absolute bottom-0 left-0 right-0 bg-ai-600/90 py-2.5 text-center text-[13px] text-white font-semibold">📍 Bấm vào bản đồ để chọn vị trí</div>}
      </div>
      {selected && <div className="px-5.5 px-[22px] py-3.5 border-t border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background:`${PIN_COLOR[selected.type]}1A` }}>{selected.cat==="person"?"👤":"📦"}</div>
        <div className="flex-1"><div className="font-bold text-sm text-slate-900">{selected.title}</div><div className="text-xs text-slate-400">📍 {selected.location}</div></div>
      </div>}
      {picked && pick && <div className="px-5.5 px-[22px] py-3 border-t border-slate-200 bg-ai-50 flex items-center gap-2.5">
        <span className="text-xl">📍</span>
        <div className="flex-1"><div className="text-[13px] font-bold text-slate-900">Vị trí đã chọn</div><div className="text-xs text-slate-400">Lat: {picked.lat} · Lng: {picked.lng}</div></div>
        <button onClick={()=>{setPick(false);setPicked(null);}} className="bg-ai-600 hover:bg-ai-700 rounded-lg px-3.5 py-2 text-xs text-white border-none cursor-pointer font-bold">Dùng vị trí này ✓</button>
      </div>}
      <div className="px-5.5 px-[22px] py-2.5 border-t border-slate-200 flex justify-between text-xs text-slate-400">
        <span>Hiển thị <strong className="text-slate-700">{pins.length}</strong> vị trí</span>
        <span>{["🔵","🟢","🟠"].map((i,k)=>`${i} ${[pins.filter(p=>p.type==="lost").length,pins.filter(p=>p.type==="found").length,pins.filter(p=>p.type==="missing").length][k]}`).join("  ")}</span>
      </div>
    </Modal>
  );
}

// ─── Trang quản trị (mở bằng timdovn.vn/#admin) ───────────────────────────────
const digitsOnly = v => String(v||"").replace(/\D/g,"");
const dupKey = i => `${i.type}|${String(i.so_giay_to||"").replace(/\W/g,"").toUpperCase() || String(i.title||"").trim().toLowerCase()}|${digitsOnly(i.contact)}`;
const adminBtnCls = (tone) => {
  const map = { brand:"border-brand-600 text-brand-600 hover:bg-brand-50", warn:"border-warn-600 text-warn-600 hover:bg-warn-50", ok:"border-ok-600 text-ok-600 hover:bg-ok-50", ghost:"border-slate-300 text-slate-500 hover:bg-slate-100" };
  return `bg-white border rounded-lg px-3 py-1.5 font-bold text-xs cursor-pointer transition ${map[tone]||map.ghost}`;
};
const adminBadgeCls = (tone) => {
  const map = { brand:"text-brand-700 border-brand-300", warn:"text-warn-700 border-warn-300", ok:"text-ok-700 border-ok-300", gold:"text-gold-600 border-gold-400", red:"text-red-700 border-red-300", slate:"text-slate-500 border-slate-300" };
  return `inline-block text-[11px] font-extrabold border rounded-md px-1.5 py-0.5 mr-1.5 mb-1 ${map[tone]||map.slate}`;
};

function AdminPanel({ onExit }) {
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("items");
  const [items, setAdminItems] = useState([]);
  const [persons, setPersons] = useState([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s || null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("is_admin").then(({ data, error }) => setIsAdmin(!error && data === true));
  }, [session]);

  const loadAll = useCallback(async () => {
    setMsg("");
    const a = await supabase.from("items").select("*").order("created_at", { ascending:false }).limit(500);
    const b = await supabase.from("missing_persons").select("id,created_at,type,ho_ten,tuoi,gioi_tinh,danh_tich,trang_phuc,lan_cuoi_thay,thoi_gian,contact,reward,urgency,avatar,date,status,photo_path,photo_public").order("created_at", { ascending:false }).limit(500);
    if (a.error || b.error) setMsg("Không tải được dữ liệu: " + (a.error?.message || b.error?.message));
    setAdminItems(a.data || []); setPersons(b.data || []);
  }, []);
  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin, loadAll]);

  const login = async e => {
    e.preventDefault(); setBusy(true); setLoginErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false); setPassword("");
    if (error) setLoginErr("Sai email hoặc mật khẩu.");
  };

  const removeRow = async (table, row, label) => {
    if (!window.confirm("Xóa VĨNH VIỄN tin này?\n\n" + label)) return;
    const { data, error } = await supabase.from(table).delete().eq("id", row.id).select();
    if (error || !data?.length) { setMsg("Không xóa được: " + (error?.message || "không có quyền hoặc tin không còn tồn tại")); return; }
    if (table === "items") setAdminItems(p => p.filter(x => x.id !== row.id));
    else {
      setPersons(p => p.filter(x => x.id !== row.id));
      if (row.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([row.photo_path]);
    }
    setMsg("Đã xóa.");
  };

  const markPersonFound = async row => {
    if (!window.confirm("Đánh dấu ĐÃ TÌM THẤY?\n\nTin sẽ ẩn khỏi trang công khai, dữ liệu khuôn mặt và ảnh sẽ bị xóa (không hoàn lại được).\n\n" + (row.ho_ten || ""))) return;
    const { data, error } = await supabase.from("missing_persons")
      .update({ status:"resolved", resolved_at:new Date().toISOString(), face_embedding:null, photo_public:false })
      .eq("id", row.id).select("id");
    if (error || !data?.length) { setMsg("Không cập nhật được: " + (error?.message || "không có quyền")); return; }
    if (row.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([row.photo_path]);
    setPersons(p => p.map(x => x.id === row.id ? { ...x, status:"resolved", photo_path:null, photo_public:false } : x));
    setMsg("Đã đánh dấu đã tìm thấy; đã xóa dữ liệu khuôn mặt và ảnh.");
  };

  const toggleResolved = async row => {
    const next = row.status === "resolved" ? "open" : "resolved";
    const { data, error } = await supabase.from("items")
      .update({ status: next, resolved_at: next === "resolved" ? new Date().toISOString() : null })
      .eq("id", row.id).select();
    if (error || !data?.length) { setMsg("Không cập nhật được: " + (error?.message || "không có quyền")); return; }
    setAdminItems(p => p.map(x => x.id === row.id ? { ...x, status: next } : x));
    setMsg(next === "resolved" ? "Đã đánh dấu đã trả (tin ẩn khỏi trang công khai, không bị tự xóa)." : "Đã mở lại tin.");
  };

  const needle = q.trim().toLowerCase();
  const hit = row => !needle || Object.values(row).some(v => typeof v === "string" && v.toLowerCase().includes(needle));
  const dupCount = {}; const phoneCount = {};
  items.forEach(i => { const k = dupKey(i); dupCount[k] = (dupCount[k] || 0) + 1; const ph = digitsOnly(i.contact); phoneCount[ph] = (phoneCount[ph] || 0) + 1; });
  const shownItems = items.filter(hit);
  const shownPersons = persons.filter(hit);

  const wrap = "min-h-screen bg-slate-50 text-slate-900 px-4 py-5";
  const inner = "max-w-[900px] mx-auto";
  const card = "bg-white border border-slate-200 rounded-2xl px-4 py-3.5 mb-2.5";

  if (session === undefined) return <div className={wrap}><div className={inner}>Đang kiểm tra đăng nhập…</div></div>;

  if (!session) return (
    <div className={wrap}><div className={`${inner} max-w-[400px]`}>
      <div className={`${cardCls} shadow-sm p-7 mt-10`}>
        <div className="font-black text-xl text-slate-900 mb-1">🛡️ Quản trị TìmĐồ.vn</div>
        <div className="text-[13px] text-slate-400 mb-4.5 mb-5">Chỉ dành cho quản trị viên.</div>
        <form onSubmit={login}>
          <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="email@quantri.com" required/>
          <Field label="Mật khẩu" value={password} onChange={setPassword} type="password" required/>
          {loginErr && <div className="text-warn-600 text-[13px] mb-3">{loginErr}</div>}
          <button type="submit" disabled={busy} className={btnCls("brand")}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
        </form>
        <button onClick={onExit} className={`${adminBtnCls("ghost")} mt-3.5`}>← Về trang chủ</button>
      </div>
    </div></div>
  );

  if (isAdmin === null) return <div className={wrap}><div className={inner}>Đang kiểm tra quyền…</div></div>;

  if (!isAdmin) return (
    <div className={wrap}><div className={`${inner} max-w-[460px]`}>
      <div className={`${cardCls} shadow-sm p-7 mt-10`}>
        <div className="font-black text-lg text-slate-900 mb-2">Tài khoản chưa có quyền admin</div>
        <div className="text-[13px] text-slate-400 mb-4">{session.user?.email} chưa nằm trong danh sách quản trị viên.</div>
        <button onClick={() => supabase.auth.signOut()} className={btnCls("ghost")}>Đăng xuất</button>
      </div>
    </div></div>
  );

  return (
    <div className={wrap}><div className={inner}>
      <div className="flex justify-between items-center flex-wrap gap-2.5 mb-4">
        <div>
          <div className="font-black text-xl text-slate-900">🛡️ Quản trị TìmĐồ.vn</div>
          <div className="text-xs text-slate-400">{session.user?.email}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className={adminBtnCls("ok")}>↻ Tải lại</button>
          <button onClick={onExit} className={adminBtnCls("ghost")}>Trang chủ</button>
          <button onClick={() => supabase.auth.signOut()} className={adminBtnCls("warn")}>Đăng xuất</button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {[["items", `Đồ vật (${items.length})`], ["missing", `Người mất tích (${persons.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`${adminBtnCls(tab===k?"brand":"ghost")} ${tab===k?"bg-brand-50":""}`}>{l}</button>
        ))}
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên, số giấy tờ, SĐT, địa điểm, nội dung…" className={`${inputCls} mb-3`}/>
      {msg && <div className={`${card} border-gold-400 text-gold-600 text-[13px]`}>{msg}</div>}

      {tab === "items" && <>
        <div className="text-xs text-slate-400 mb-2">Hiển thị {Math.min(shownItems.length, 200)}/{shownItems.length} tin. ⚠ = nghi trùng lặp hoặc spam. Xóa là vĩnh viễn.</div>
        {shownItems.slice(0, 200).map(row => {
          const dup = dupCount[dupKey(row)] > 1;
          const spam = phoneCount[digitsOnly(row.contact)] >= 5;
          const label = `${row.category} — ${row.title || ""}`;
          return (
            <div key={row.id} className={card} style={{ opacity: row.status === "resolved" ? 0.6 : 1 }}>
              <div className="mb-1.5">
                <span className={adminBadgeCls(row.type === "found" ? "ok" : "brand")}>{row.type === "found" ? "ĐÃ NHẶT" : "ĐANG TÌM"}</span>
                <span className={adminBadgeCls("slate")}>{row.category}</span>
                {row.status === "resolved" && <span className={adminBadgeCls("ok")}>ĐÃ TRẢ</span>}
                {dup && <span className={adminBadgeCls("gold")}>⚠ Nghi trùng lặp</span>}
                {spam && <span className={adminBadgeCls("gold")}>⚠ SĐT đăng {phoneCount[digitsOnly(row.contact)]} tin</span>}
              </div>
              <div className="font-bold text-sm mb-1 text-slate-900">{row.title}</div>
              <div className="text-xs text-slate-600 leading-relaxed">
                {row.ho_ten && <div>👤 {row.ho_ten}{row.so_giay_to ? ` · ${row.so_giay_to}` : ""}{row.ngay_sinh ? ` · ${row.ngay_sinh}` : ""}</div>}
                <div>📍 {row.location} · 📞 {row.contact} · 📅 {row.date} {row.reward ? `· 🏆 ${row.reward}` : ""}</div>
                {row.note && <div>📝 {row.note}</div>}
                <div className="text-slate-400">Đăng lúc {row.created_at ? new Date(row.created_at).toLocaleString("vi-VN") : "?"}</div>
              </div>
              <div className="flex gap-2 mt-2.5">
                <button onClick={() => toggleResolved(row)} className={adminBtnCls("ok")}>{row.status === "resolved" ? "↩ Mở lại" : "✅ Đã trả"}</button>
                <button onClick={() => removeRow("items", row, label)} className={adminBtnCls("warn")}>🗑 Xóa</button>
              </div>
            </div>
          );
        })}
      </>}

      {tab === "missing" && <>
        <div className="text-xs text-slate-400 mb-2">Hiển thị {Math.min(shownPersons.length, 200)}/{shownPersons.length} tin. ⏳ = đăng quá 60 ngày, nên xem xét xóa (không tự động xóa). Xóa là vĩnh viễn.</div>
        {shownPersons.slice(0, 200).map(row => {
          const oldPost = row.status !== "resolved" && row.created_at &&
            (Date.now() - new Date(row.created_at).getTime()) > 60 * 24 * 60 * 60 * 1000;
          return (
          <div key={row.id} className={card}>
            <div className="flex gap-3">
              {row.photo_path && <img src={photoUrl(row.photo_path)} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0"/>}
              <div className="min-w-0">
                <div className="mb-1.5">
                  <span className={adminBadgeCls(row.type === "found_person" ? "ok" : "warn")}>{row.type === "missing" ? "ĐANG TÌM NGƯỜI" : row.type === "found_person" ? "ĐÃ GẶP NGƯỜI LẠC" : String(row.type || "").toUpperCase()}</span>
                  {row.urgency === "high" && row.type === "missing" && <span className={adminBadgeCls("red")}>KHẨN</span>}
                  {row.status === "resolved" && <span className={adminBadgeCls("ok")}>ĐÃ TÌM THẤY</span>}
                  {oldPost && <span className={adminBadgeCls("gold")}>⏳ Quá 60 ngày — nên xem xét xóa</span>}
                </div>
                <div className="font-bold text-sm mb-1 text-slate-900">{row.ho_ten} {row.tuoi ? `· ${row.tuoi}` : ""} {row.gioi_tinh ? `· ${row.gioi_tinh}` : ""}</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              {row.danh_tich && <div>🔎 {row.danh_tich}</div>}
              {row.lan_cuoi_thay && <div>📍 {row.lan_cuoi_thay} {row.thoi_gian ? `· ${row.thoi_gian}` : ""}</div>}
              <div>📞 {row.contact} · 📅 {row.date}</div>
            </div>
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {row.status !== "resolved" && <button onClick={() => markPersonFound(row)} className={adminBtnCls("ok")}>✅ Đã tìm thấy</button>}
              <button onClick={() => removeRow("missing_persons", row, row.ho_ten || "")} className={adminBtnCls("warn")}>🗑 Xóa</button>
            </div>
          </div>
          );
        })}
      </>}
    </div></div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [items, setItems] = useState(INIT_ITEMS);
  const [missing, setMissing] = useState(INIT_MISSING);
  const [mainTab, setMainTab] = useState("items");
  const [subTab, setSubTab] = useState("all");
  const [missingSubTab, setMissingSubTab] = useState("all");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [detailItem, setDetailItem] = useState(null);
  const [detailMissing, setDetailMissing] = useState(null);
  const [postItem, setPostItem] = useState(false);
  const [postMissing, setPostMissing] = useState(false);
  const [faceSearch, setFaceSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [navOpen, setNavOpen] = useState(false); // menu di động cho Navbar — chỉ UI, không ảnh hưởng dữ liệu
  const [adminMode, setAdminMode] = useState(() => typeof window !== "undefined" && window.location.hash === "#admin");
  useEffect(() => {
    const onHash = () => setAdminMode(window.location.hash === "#admin");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Load dữ liệu từ Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { data: d1 } = await supabase.from("items_public").select("*").order("created_at", { ascending: false });
        const { data: d2 } = await supabase.from("missing_public").select("*").order("created_at", { ascending: false });
        if (d1?.length > 0) setItems(d1.map(i => ({ ...i, category:normalizeCategory(i.category), hoTen:i.ho_ten, soGiayTo:i.so_giay_to, ngaySinh:i.ngay_sinh })));
        if (d2?.length > 0) setMissing(d2.map(m => ({ ...m, hoTen:m.ho_ten||"", tuoi:m.tuoi||"", gioiTinh:m.gioi_tinh||"", danhTich:m.danh_tich||"", trangPhuc:m.trang_phuc||"", lanCuoiThay:m.lan_cuoi_thay||"", thoiGian:m.thoi_gian||"", img:photoUrl(m.photo_path) })));
      } catch {}
    };
    load();
  }, []);

  const urgentCount = missing.filter(m=>m.urgency==="high"&&m.type==="missing").length;

  const filteredItems = items.filter(i => {
    const matchSub = subTab==="all"||i.type===subTab;
    const matchCat = cat==="Tất cả"||i.category===cat;
    const q = search.toLowerCase();
    const fields = isSensitive(i) ? [i.location, i.category] : [i.title, i.location, i.hoTen, i.soGiayTo, i.note];
    return matchSub && matchCat && (!q || fields.some(f=>f?.toLowerCase().includes(q)));
  });

  const filteredMissing = missing.filter(m => {
    const matchSub = missingSubTab==="all"||m.type===missingSubTab;
    const q = search.toLowerCase();
    return matchSub && (!q||[m.hoTen,m.danhTich,m.lanCuoiThay].some(f=>f?.toLowerCase().includes(q)));
  });

  const addItem = async (item, captchaToken) => {
    const r = await fetch("/api/post-item", { method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ p: {
        type:item.type, category:item.category, title:item.title,
        ho_ten:item.hoTen||"", so_giay_to:item.soGiayTo||"", ngay_sinh:item.ngaySinh||"",
        location:item.location, contact:item.contact, reward:item.reward||"",
        note:item.note||"", img:item.img, date:item.date }, captchaToken }) });
    const j = await r.json().catch(()=>({}));
    if (!r.ok || j.error) { console.error("Lỗi lưu tin:", j.error); return { ok:false, error: dbMsg({ message:j.error }) || j.error }; }
    setItems(prev=>[{ ...item, id: j.data?.id ?? item.id }, ...prev]);
    return { ok:true, matches: j.data?.matches || [] };
  };
  const addMissing = async (m, captchaToken) => {
    const r = await fetch("/api/post-missing", { method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ p: {
        type:m.type, ho_ten:m.hoTen||"", tuoi:m.tuoi||"", gioi_tinh:m.gioiTinh||"", danh_tich:m.danhTich||"",
        trang_phuc:m.trangPhuc||"", lan_cuoi_thay:m.lanCuoiThay||"", thoi_gian:m.thoiGian||"",
        contact:m.contact, reward:m.reward||"", urgency:m.urgency||"medium", avatar:m.avatar||"👤", date:m.date,
        face:m.face||null, photo_path:m.photoPath||null, photo_public:!!m.photoPublic }, captchaToken }) });
    const j = await r.json().catch(()=>({}));
    if (!r.ok || j.error) { console.error("Lỗi lưu tin:", j.error); return { ok:false, error: dbMsg({ message:j.error }) || j.error || "Không lưu được tin, vui lòng thử lại sau." }; }
    const shown = { ...m, id: j.data?.id ?? m.id, img: photoUrl(m.photoPath) };
    delete shown.face; delete shown.photoPath; delete shown.photoPublic;
    setMissing(prev=>[shown, ...prev]);
    return { ok:true, matches: j.data?.matches || [] };
  };

  if (adminMode) return <AdminPanel onExit={() => { window.location.hash = ""; }} />;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ─── NAVBAR (thông minh, responsive, menu di động) ─── */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-5.5 sm:px-[22px] sticky top-0 z-[200]">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9.5 h-9.5 w-[38px] h-[38px] rounded-xl bg-brand-600 flex items-center justify-center text-xl text-white shrink-0">🔍</div>
            <div>
              <div className="font-black text-lg sm:text-[19px] tracking-tight leading-none text-slate-900">TìmĐồ<span className="text-brand-600">.vn</span></div>
              <div className="text-[9px] text-slate-400 tracking-widest uppercase hidden sm:block">Đồ vật · Người thân · AI</div>
            </div>
          </div>
          {/* Desktop actions */}
          <div className="hidden md:flex gap-2 items-center">
            <button onClick={()=>setShowMap(true)} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-base cursor-pointer transition">🗺️</button>
            <button onClick={()=>setShowNotif(v=>!v)} className="relative bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 cursor-pointer text-lg transition">🔔</button>
            {mainTab==="missing" && <button onClick={()=>setFaceSearch(true)} className="bg-warn-600 hover:bg-warn-700 border-none rounded-lg px-3.5 py-2.5 text-white font-bold text-[13px] cursor-pointer transition">🔎 Đối chiếu ảnh</button>}
            <button onClick={()=>{ mainTab==="items"?setPostItem(true):setPostMissing(true); }} className={`border-none rounded-lg px-4 py-2.5 text-white font-extrabold text-sm cursor-pointer transition ${mainTab==="missing"?"bg-warn-600 hover:bg-warn-700":"bg-brand-600 hover:bg-brand-700"}`}>+ Đăng tin</button>
          </div>
          {/* Mobile hamburger */}
          <button onClick={()=>setNavOpen(v=>!v)} className="md:hidden bg-slate-50 border border-slate-200 rounded-lg w-10 h-10 flex items-center justify-center text-slate-600 text-xl" aria-label="Mở menu">
            {navOpen ? "✕" : "☰"}
          </button>
        </div>
        {/* Mobile dropdown menu */}
        {navOpen && (
          <div className="md:hidden max-w-[1140px] mx-auto pb-3 flex flex-col gap-2">
            <button onClick={()=>{setShowMap(true);setNavOpen(false);}} className="text-left bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600 font-semibold">🗺️ Bản đồ tin đăng</button>
            <button onClick={()=>{setShowNotif(true);setNavOpen(false);}} className="text-left bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600 font-semibold">🔔 Thông báo</button>
            {mainTab==="missing" && <button onClick={()=>{setFaceSearch(true);setNavOpen(false);}} className="text-left bg-warn-50 border border-warn-200 rounded-lg px-3.5 py-2.5 text-sm text-warn-700 font-semibold">🔎 Đối chiếu ảnh</button>}
            <button onClick={()=>{ mainTab==="items"?setPostItem(true):setPostMissing(true); setNavOpen(false); }} className={`text-left border-none rounded-lg px-3.5 py-2.5 text-white font-extrabold text-sm ${mainTab==="missing"?"bg-warn-600":"bg-brand-600"}`}>+ Đăng tin</button>
          </div>
        )}
      </header>

      {/* MAIN TAB BAR */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1140px] mx-auto flex overflow-x-auto">
          {[["items","🪪","Đồ vật thất lạc"],["missing","👤","Tìm người thân"]].map(([v,icon,l])=>(
            <button key={v} onClick={()=>{setMainTab(v);setSearch("");}} className={`px-4 sm:px-5 py-3.5 border-0 border-b-[2.5px] bg-transparent font-bold text-sm cursor-pointer flex items-center gap-1.5 relative whitespace-nowrap transition ${mainTab===v?(v==="missing"?"text-warn-700 border-warn-600":"text-brand-700 border-brand-600"):"text-slate-400 border-transparent hover:text-slate-600"}`}>
              <span>{icon}</span><span>{l}</span>
              {v==="missing"&&urgentCount>0 && <span className="bg-red-600 text-white text-[10px] font-extrabold w-[18px] h-[18px] rounded-full inline-flex items-center justify-center animate-blink">{urgentCount}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* HERO / BANNER TÌM KIẾM ĐA NĂNG */}
      <div className={`bg-gradient-to-b ${mainTab==="missing" ? "from-warn-700 to-warn-600" : "from-brand-700 to-brand-600"} px-4 sm:px-5.5 sm:px-[22px] pt-9 sm:pt-10 pb-14 text-center`}>
        <div className="max-w-[600px] mx-auto">
          {mainTab==="missing" ? <>
            <div className="text-[11px] text-warn-100 font-bold tracking-[3px] uppercase mb-2.5">Kết nối · Chia sẻ · Tìm thấy</div>
            <h1 className="text-[28px] sm:text-[34px] font-black m-0 mb-2.5 leading-[1.1] tracking-tight text-white">Tìm người thân<br/><span className="text-white/90">thất lạc</span></h1>
            <p className="text-warn-50 text-sm m-0 mb-5 leading-relaxed">Đăng tin hoặc <strong className="text-white">tải ảnh để AI đối chiếu</strong> với hồ sơ người mất tích</p>
          </> : <>
            <div className="text-[11px] text-brand-100 font-bold tracking-[3px] uppercase mb-2.5">Nền tảng kết nối và hỗ trợ cộng đồng</div>
            <h1 className="text-[28px] sm:text-[34px] font-black m-0 mb-2.5 leading-[1.1] tracking-tight text-white">Mất đồ? Nhặt được?<br/><span className="text-white/90">Kết nối ngay!</span></h1>
            <p className="text-brand-50 text-sm m-0 mb-5 leading-relaxed">Tải ảnh giấy tờ — <strong className="text-white">AI tự nhận diện & điền thông tin</strong></p>
          </>}
          <div className="relative max-w-[440px] mx-auto">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={mainTab==="missing"?"Tìm theo tên, đặc điểm, địa điểm…":"Tra cứu nhanh theo tên, số giấy tờ hoặc địa điểm…"} className="w-full box-border px-3.5 py-3 pl-11 rounded-2xl text-[15px] border-0 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-lg"/>
            {search && <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 cursor-pointer text-lg">×</button>}
          </div>
        </div>
      </div>

      {/* STAT CARD — nổi đè lên mép dưới hero */}
      <div className="px-4 sm:px-5.5 sm:px-[22px] -mt-8 mb-6 relative z-10">
        <div className="max-w-[640px] mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
          {(mainTab==="missing"
            ? [[urgentCount,"Khẩn cấp","🚨","bg-red-50 text-red-600"],[missing.filter(m=>m.type==="missing").length,"Đang tìm","🟠","bg-warn-50 text-warn-600"],[missing.filter(m=>m.type==="found_person").length,"Đã gặp","✅","bg-ok-50 text-ok-600"]]
            : [[items.filter(i=>i.type==="lost").length,"Đang xác minh","🔵","bg-brand-50 text-brand-600"],[items.filter(i=>i.type==="found").length,"Chờ xác nhận","🟠","bg-warn-50 text-warn-600"],["312","Đã kết nối thành công","✅","bg-ok-50 text-ok-600"]]
          ).map(([n,l,icon,tone])=>(
            <div key={l} className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 text-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${tone}`}>{icon}</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 leading-none">{n}</div>
              <div className="text-[10px] text-slate-400 tracking-wide uppercase leading-snug">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI BANNER */}
      {mainTab==="missing" ? (
        <div className="bg-warn-50 border-b border-warn-200 px-4 sm:px-5.5 sm:px-[22px] py-2.5 flex items-center justify-center gap-2.5 flex-wrap text-center">
          <span className="text-[13px] text-warn-700">🔎 <strong>AI Đối Chiếu Ảnh</strong> — Tải ảnh người lạc, AI so sánh với toàn bộ hồ sơ</span>
          <button onClick={()=>setFaceSearch(true)} className="bg-white border border-warn-300 rounded-lg px-3 py-1.5 text-warn-700 text-xs font-bold cursor-pointer">Thử ngay →</button>
        </div>
      ) : (
        <div className="bg-ai-50 border-b border-ai-200 px-4 sm:px-5.5 sm:px-[22px] py-2.5 text-center">
          <span className="text-[13px] text-ai-700">🤖 <strong>AI Vision</strong> — Ứng dụng công nghệ AI hỗ trợ nhận diện và điền thông tin nhanh chóng, chính xác và bảo mật.</span>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-5.5 sm:px-[22px] py-2.5 overflow-x-auto">
        <div className="max-w-[1140px] mx-auto flex gap-2 items-center flex-nowrap sm:flex-wrap">
          {mainTab==="items" ? <>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
              {[["all","Tất cả"],["lost","🔵 Đang tìm"],["found","🟢 Đã nhặt"]].map(([v,l])=>(
                <button key={v} onClick={()=>setSubTab(v)} className={`px-3 py-1.5 rounded-md border-none font-bold text-xs cursor-pointer whitespace-nowrap transition ${subTab===v?(v==="lost"?"bg-brand-600 text-white":v==="found"?"bg-ok-500 text-white":"bg-slate-700 text-white"):"bg-transparent text-slate-500"}`}>{l}</button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-200 shrink-0"/>
            {["Tất cả",...ITEM_CAT].map(c=>(
              <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1.5 rounded-lg border font-semibold text-[11px] cursor-pointer whitespace-nowrap shrink-0 transition ${cat===c?"border-brand-500 bg-brand-50 text-brand-700":"border-slate-200 bg-transparent text-slate-500"}`}>{c}</button>
            ))}
          </> : (
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {[["all","Tất cả"],["missing","🟠 Đang tìm"],["found_person","🟢 Đã gặp"]].map(([v,l])=>(
                <button key={v} onClick={()=>setMissingSubTab(v)} className={`px-3 py-1.5 rounded-md border-none font-bold text-xs cursor-pointer whitespace-nowrap transition ${missingSubTab===v?(v==="missing"?"bg-warn-600 text-white":v==="found_person"?"bg-ok-500 text-white":"bg-slate-700 text-white"):"bg-transparent text-slate-500"}`}>{l}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* URGENT BANNER */}
      {mainTab==="missing" && urgentCount>0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 sm:px-5.5 sm:px-[22px] py-2.5">
          <div className="max-w-[1140px] mx-auto flex items-center gap-2.5 flex-wrap">
            <span className="animate-blink text-lg">🚨</span>
            <span className="text-[13px] text-red-700 font-semibold">{urgentCount} trường hợp khẩn cấp cần sự giúp đỡ ngay</span>
            <button onClick={()=>setFaceSearch(true)} className="sm:ml-auto bg-white border border-red-300 rounded-lg px-3.5 py-1.5 text-red-700 text-xs font-bold cursor-pointer">Tôi có thể giúp →</button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <main className="max-w-[1140px] mx-auto px-4 sm:px-5.5 sm:px-[22px] pt-6 pb-16">
        {mainTab==="items" ? <>
          <div className="mb-3.5 text-slate-400 text-xs">Tìm thấy <strong className="text-slate-600">{filteredItems.length}</strong> kết quả</div>
          {filteredItems.length===0 ? <Empty icon="🔍" text="Không tìm thấy kết quả phù hợp"/> :
            <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))" }}>
              {filteredItems.map(item=><ItemCard key={item.id} item={item} onClick={()=>setDetailItem(item)}/>)}
            </div>}
        </> : <>
          <div className="mb-3.5 text-slate-400 text-xs"><strong className="text-slate-600">{filteredMissing.length}</strong> hồ sơ</div>
          {filteredMissing.length===0 ? <Empty icon="👤" text="Không tìm thấy hồ sơ phù hợp"/> :
            <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))" }}>
              {filteredMissing.map(p=><MissingCard key={p.id} person={p} onClick={()=>setDetailMissing(p)}/>)}
            </div>}
          <div className="mt-8 bg-warn-50 border border-warn-200 rounded-2xl px-5 sm:px-6.5 sm:px-[26px] py-5.5 py-[22px] flex items-center gap-4.5 gap-[18px] flex-wrap">
            <div className="flex-1 min-w-[200px]"><div className="font-extrabold text-base mb-1 text-slate-900">Bạn gặp người có vẻ bị lạc?</div><div className="text-[13px] text-slate-500 leading-relaxed">Chụp ảnh và để AI tự động đối chiếu với hồ sơ người đang tìm kiếm.</div></div>
            <button onClick={()=>setFaceSearch(true)} className="bg-warn-600 hover:bg-warn-700 border-none rounded-xl px-5.5 px-[22px] py-3.5 text-white font-extrabold text-[15px] cursor-pointer transition">🔎 Đối chiếu ảnh ngay</button>
          </div>
        </>}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 px-4 sm:px-5.5 sm:px-[22px] py-6">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex justify-between items-start flex-wrap gap-5 mb-5">
            <div>
              <div className="font-black text-lg mb-1.5 text-white">TìmĐồ<span className="text-brand-400">.vn</span></div>
              <div className="text-[13px] text-slate-400 max-w-[280px] leading-relaxed">Hỗ trợ tìm kiếm và trao trả tài sản, người thân thất lạc nhanh chóng, tin cậy.</div>
            </div>
            <div className="flex gap-10 flex-wrap">
              {[["Tính năng",["🔍 Tìm đồ vật","👤 Tìm người thân","🤖 AI Nhận diện","🔎 Đối chiếu ảnh"]],["Hỗ trợ",["📞 Hotline: 1800 9999","📧 help@timdovn.vn","💬 Chat hỗ trợ"]]].map(([title,links])=>(
                <div key={title}>
                  <div className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5">{title}</div>
                  {links.map(l=><div key={l} className="text-[13px] text-slate-400 mb-1.5 cursor-pointer hover:text-slate-200">{l}</div>)}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-700 pt-4 flex justify-between items-center flex-wrap gap-2.5">
            <div className="text-xs text-slate-500">© 2026 TìmĐồ.vn · <span onClick={()=>setShowPrivacy(true)} className="underline cursor-pointer hover:text-slate-300">Chính sách quyền riêng tư</span></div>
            <div className="flex gap-2 flex-wrap">
              {["🚨 Khẩn cấp 113","🏥 Cấp cứu 115","👮 Công an 114"].map(t=>(
                <div key={t} className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400">{t}</div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {detailItem && <ItemDetail item={detailItem} onClose={()=>setDetailItem(null)}/>}
      {detailMissing && <MissingDetail person={detailMissing} onClose={()=>setDetailMissing(null)} onFaceSearch={()=>{setDetailMissing(null);setFaceSearch(true);}}/>}
      {postItem && <PostItemModal onClose={()=>setPostItem(false)} onAdd={addItem}/>}
      {postMissing && <PostMissingModal onClose={()=>setPostMissing(false)} onAdd={addMissing}/>}
      {faceSearch && <FaceMatchModal onClose={()=>setFaceSearch(false)} missing={missing.filter(m=>m.type==="missing")}/>}

      {showNotif && <NotifPanel onClose={()=>setShowNotif(false)} user={null}/>}
      {showMap && <MapModal onClose={()=>setShowMap(false)}/>}
      {showPrivacy && <PrivacyModal onClose={()=>setShowPrivacy(false)}/>}
    </div>
  );
}
