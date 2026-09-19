import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { computeFace, compressToJpegBlob, compressToDataUrl } from "./face.js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://kvbtvjzkeukcjgqqdddu.supabase.co",
  "sb_publishable_t9L83Ag6Tbr3PK3_SNEIGw_uiKra69S"
);

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  accent: "#27AE60", accentDark: "#1E8449",
  teal: "#2EC4B6",   tealDark: "#1AA398",
  violet: "#7C6FFF", violetDark: "#4F46E5",
  rose: "#FF4F7B",   roseDark: "#C9184A",
  gold: "#F1C40F",
  bg: "#0A1A0F", bg1: "#0D1F12", bg2: "#112816", bg3: "#163020",
  border: "#1E4D2B", border2: "#2A6B3A",
  text: "#FFFFFF", text2: "#D1D5DB", text3: "#9CA3AF",
  heroTitle: "#FFFFFF", heroAccent: "#F1C40F",
  statText: "#E0F2FE",
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = () => new Date().toLocaleDateString("vi-VN");
const uid = () => Date.now() + Math.random();
const ITEM_CAT = ["CMND/CCCD","Bằng lái xe","Hộ chiếu","Ví/Túi xách","Chìa khóa","Điện thoại","Khác"];
const catIcon = c => ({ "CMND/CCCD":"🪪","Bằng lái xe":"🪪","Hộ chiếu":"📘","Ví/Túi xách":"👛","Chìa khóa":"🔑","Điện thoại":"📱","Khác":"📦" }[c]||"📦");
const SENSITIVE_CATS = ["CMND/CCCD","Bằng lái xe","Hộ chiếu"];
// Chuẩn hóa loại giấy tờ (AI có thể trả "CCCD", "Căn cước công dân", "GPLX"...) về đúng danh mục
const normalizeCategory = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return "";
  const l = s.toLowerCase();
  if (/cccd|cmnd|cmt|căn cước|can cuoc|chứng minh|chung minh/.test(l)) return "CMND/CCCD";
  if (/bằng lái|bang lai|gplx|giấy phép lái|giay phep lai/.test(l)) return "Bằng lái xe";
  if (/hộ chiếu|ho chieu|passport/.test(l)) return "Hộ chiếu";
  return s;
};
// Loại giấy tờ từ AI -> danh mục có trong ITEM_CAT (không khớp thì đưa vào "Khác")
const docCategory = (raw) => {
  const c = normalizeCategory(raw);
  return ITEM_CAT.includes(c) ? c : "Khác";
};
// Tin nhạy cảm nếu thuộc loại giấy tờ HOẶC có số giấy tờ (bắt cả tin cũ bị sai loại)
const isSensitive = item =>
  SENSITIVE_CATS.includes(normalizeCategory(item.category)) ||
  !!(item.soGiayTo && String(item.soGiayTo).trim());
const privateTitle = item => {
  if (!isSensitive(item)) return item.title;
  return `${normalizeCategory(item.category) || "Giấy tờ"} — ${item.type==="found"?"Đã nhặt được":"Đang tìm"}`;
};

// Che thông tin nhạy cảm — chỉ hiện khi xác minh
const maskID = (id) => {
  if (!id) return "";
  if (id.length <= 3) return id;
  return id.slice(0, 3) + "*".repeat(id.length - 3);
};
const maskDate = (date) => {
  if (!date) return "";
  // Chỉ hiện tháng và năm, che ngày
  const parts = date.split("/");
  if (parts.length === 3) return `**/${parts[1]}/${parts[2]}`;
  return "**/**/****";
};
const maskAddress = (addr) => {
  if (!addr) return "";
  // Chỉ hiện tỉnh/thành phố cuối
  const parts = addr.split(",");
  if (parts.length > 1) return `***, ${parts[parts.length-1].trim()}`;
  return addr.slice(0, 3) + "***";
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:400, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"20px 16px", overflowY:"auto" },
  box: { background:C.bg2, border:`1.5px solid ${C.border}`, borderRadius:20, padding:28, width:"100%", position:"relative", marginTop:"auto", marginBottom:"auto" },
  btn: (bg,color="#fff") => ({ background:bg, border:"none", borderRadius:12, padding:"13px 18px", color, fontWeight:800, fontSize:15, cursor:"pointer", width:"100%", transition:"opacity 0.2s" }),
  input: { width:"100%", boxSizing:"border-box", padding:"11px 13px", background:C.bg3, border:`1.5px solid ${C.border2}`, borderRadius:10, color:C.text, fontSize:14, outline:"none", fontFamily:"inherit" },
};

// ─── Primitive Components ─────────────────────────────────────────────────────
function Overlay({ onClose, children }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return <div style={S.overlay} onClick={onClose}>{children}</div>;
}
function Modal({ onClose, style, children }) {
  return (
    <Overlay onClose={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ ...S.box, maxWidth:520, ...style }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, background:"#222", border:"none", borderRadius:8, width:30, height:30, color:"#888", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1 }}>×</button>
        {children}
      </div>
    </Overlay>
  );
}
function Field({ label, value, onChange, placeholder, type="text", multiline=false, hint, required=false }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, color:C.text3, marginBottom:5, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>
        {label}{required && <span style={{ color:C.rose, marginLeft:3 }}>*</span>}
      </label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ ...S.input, resize:"vertical" }}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={S.input}/>}
      {hint && <div style={{ fontSize:11, color:"#444", marginTop:4 }}>💡 {hint}</div>}
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, color:C.text3, marginBottom:5, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ ...S.input, cursor:"pointer" }}>
        {options.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function InfoRow({ label, value }) {
  if (!value) return null;
  return <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}`, gap:12 }}>
    <span style={{ color:C.text3, fontSize:12, flexShrink:0 }}>{label}</span>
    <span style={{ fontSize:13, fontWeight:600, textAlign:"right", color:C.text }}>{value}</span>
  </div>;
}
function Chip({ text, color, bg }) {
  return <span style={{ display:"inline-flex", alignItems:"center", background:bg||`${color}18`, color, fontSize:11, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", padding:"4px 12px", borderRadius:20, border:`1px solid ${color}30` }}>{text}</span>;
}
function SectionTitle({ icon, text, color }) {
  return <div style={{ fontSize:11, color:color||C.violet, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}><span>{icon}</span>{text}</div>;
}
function Empty({ icon, text }) {
  return <div style={{ textAlign:"center", padding:"60px 0" }}>
    <div style={{ fontSize:48, marginBottom:12, filter:"grayscale(1)" }}>{icon}</div>
    <div style={{ fontSize:16, fontWeight:700, color:"#444" }}>{text}</div>
  </div>;
}

// ─── Claude AI qua Vercel Edge Function (tránh CORS) ────────────────────────
// Vercel tự động làm proxy an toàn, không lộ API key
const AI_PROXY = "/api/ai";

// Ảnh chụp từ điện thoại thường 3-8MB; máy chủ Vercel chỉ nhận yêu cầu dưới ~4MB (lỗi 413).
// Vì vậy thu nhỏ ảnh về tối đa 1600 điểm ảnh/JPEG trước khi gửi cho AI (chữ trên giấy tờ vẫn đọc rõ).
async function shrinkB64(b64, mime) {
  if (!b64 || b64.length < 900000) return { b64, mime };   // ảnh đã nhỏ (< ~650KB) thì gửi nguyên
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
    // Tự detect mime type từ base64 header
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
    const errText = await res.text();
    throw new Error(`Server lỗi (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  if (data.error) throw new Error("AI lỗi: " + data.error);

  let raw = (data.text || "").trim();
  if (!raw) throw new Error("AI không trả về nội dung. Thử ảnh khác hoặc thử lại.");

  // Xóa markdown code block nếu có
  raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  try { return JSON.parse(raw); }
  catch {
    // Tìm JSON object trong text
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
  const inputEl = <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handle(e.target.files[0])}/>;
  return { pick, inputEl, handleDrop: useCallback(e=>{e.preventDefault();handle(e.dataTransfer.files[0]);}, [handle]) };
}// ─── AI Doc Scanner Modal ─────────────────────────────────────────────────────
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
    <Modal onClose={onClose} style={{ maxWidth:480 }}>
      {inputEl}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${C.violet},${C.violetDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
        <div><div style={{ fontWeight:800, fontSize:18 }}>AI Đọc Giấy Tờ</div><div style={{ fontSize:12, color:C.text3 }}>Tải ảnh → AI trích xuất thông tin tự động</div></div>
      </div>
      <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={pick}
        style={{ border:`2px dashed ${preview?C.violet:C.border2}`, borderRadius:14, padding:preview?"8px":"30px 20px", textAlign:"center", cursor:"pointer", background:preview?`${C.violet}08`:C.bg, marginBottom:14, minHeight:120, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {preview ? <img src={preview} alt="" style={{ maxHeight:200, maxWidth:"100%", borderRadius:10, objectFit:"contain" }}/>
          : <div><div style={{ fontSize:40, marginBottom:10 }}>📷</div><div style={{ fontWeight:700, fontSize:15 }}>Kéo thả hoặc bấm chọn ảnh</div><div style={{ fontSize:12, color:C.text3, marginTop:4 }}>CCCD · Bằng lái · Hộ chiếu · Thẻ BHYT…</div></div>}
      </div>
      {preview && phase!=="scanning" && <button onClick={pick} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8, padding:"5px 12px", color:C.text3, fontSize:12, cursor:"pointer", marginBottom:12 }}>🔄 Đổi ảnh khác</button>}
      {err && <div style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"#FF7070", fontSize:13 }}>⚠️ {err}</div>}
      {phase==="scanning" && <div style={{ textAlign:"center", padding:"32px 0" }}>
        <div style={{ fontSize:44, marginBottom:12, display:"inline-block", animation:"spin 1.2s linear infinite" }}>🔄</div>
        <div style={{ fontWeight:700 }}>AI đang phân tích giấy tờ…</div>
      </div>}
      {phase==="done" && result && <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <span style={{ fontSize:18 }}>✅</span><span style={{ fontWeight:700 }}>Nhận diện thành công</span>
          <Chip text={`${result.doTinCay||90}% chính xác`} color={C.teal}/>
        </div>
        <div style={{ background:C.bg, borderRadius:12, padding:"12px 14px" }}>
          {[["Loại giấy tờ",result.loaiGiayTo],["Họ và tên",result.hoTen],["Số giấy tờ",result.soGiayTo],["Ngày sinh",result.ngaySinh],["Giới tính",result.gioiTinh],["Quê quán",result.queQuan],["Địa chỉ",result.diaChiThuongTru],["Ngày cấp",result.ngayCap],["Nơi cấp",result.noiCap]].map(([k,v])=><InfoRow key={k} label={k} value={v}/>)}
        </div>
      </div>}
      {phase!=="scanning" && (
        phase==="done"
          ? <button onClick={()=>{onFill(result,preview);onClose();}} style={S.btn(`linear-gradient(135deg,${C.accent},${C.accentDark})`)}>Dùng thông tin này để đăng tin →</button>
          : <button onClick={scan} disabled={!preview} style={S.btn(preview?`linear-gradient(135deg,${C.violet},${C.violetDark})`:"#222", preview?"#fff":"#555")}>✨ {err?"Thử lại":"Nhận diện ngay"}</button>
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
  rat_giong: { label:"Rất giống khuôn mặt", color:C.gold },
  kha_giong: { label:"Khá giống khuôn mặt", color:C.teal },
  co_the:    { label:"Có thể giống khuôn mặt", color:C.violet },
  trung_ten: { label:"Trùng họ tên", color:C.text3 },
};

function PersonMatchCard({ m }) {
  const lv = FACE_LEVELS[m.level] || FACE_LEVELS.co_the;
  const url = photoUrl(m.photo_path);
  const isFound = m.type === "found_person";
  return (
    <div style={{ background:C.bg3, border:`1.5px solid ${lv.color}66`, borderRadius:14, padding:"12px 14px", marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
        <span style={{ fontWeight:800, fontSize:13, color:lv.color }}>{lv.label}</span>
        <span style={{ fontSize:11, color:C.text3 }}>{isFound ? "Có người đã gặp người này" : "Gia đình đang tìm người này"}</span>
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10 }}>
        <div style={{ width:60, height:60, borderRadius:12, background:C.bg, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>
          {url ? <img src={url} alt="" onError={e=>{e.currentTarget.style.display="none";}} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : (isFound ? "🟢" : "🔴")}
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontWeight:800, fontSize:15 }}>{m.ho_ten}</div>
          <div style={{ fontSize:12, color:C.text3 }}>{[m.tuoi, m.gioi_tinh].filter(Boolean).join(" · ")}</div>
          <div style={{ fontSize:12, color:C.text3 }}>📍 {m.lan_cuoi_thay}{m.thoi_gian ? ` · ${m.thoi_gian}` : ""}</div>
          <div style={{ fontSize:11, color:C.text3 }}>📅 Đăng ngày {m.date}</div>
        </div>
      </div>
      {m.level === "trung_ten" && <div style={{ fontSize:11, color:C.text3, marginBottom:8 }}>Cùng họ tên nhưng chưa có ảnh để so khuôn mặt — hãy hỏi thêm để xác minh.</div>}
      {m.reward && !isFound && <div style={{ fontSize:12, color:C.gold, marginBottom:8 }}>🏆 Tiền thưởng: {m.reward}</div>}
      <a href={`tel:${String(m.contact||"").replace(/[^\d+]/g,"")}`} style={{ display:"block", textAlign:"center", background:`linear-gradient(135deg,${C.rose},${C.roseDark})`, borderRadius:10, padding:"11px", color:"#fff", fontWeight:800, fontSize:14, textDecoration:"none" }}>📞 Gọi {m.contact}</a>
    </div>
  );
}

const FACE_DISCLAIMER = "Đây là gợi ý tự động dựa trên khuôn mặt, có thể sai. Hãy gọi điện và hỏi thêm thông tin (nốt ruồi, sẹo, nơi ở…) trước khi kết luận. Nếu người lạc là trẻ em hoặc người già cần giúp đỡ, hãy báo công an/UBND phường gần nhất.";

// Kết quả dò người khớp ngay sau khi đăng tin
function PersonMatchResult({ matches, onClose }) {
  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🔔</div>
        <div style={{ fontWeight:900, fontSize:20, marginBottom:6 }}>Tin đã đăng — có {matches.length} tin có thể khớp!</div>
        <div style={{ fontSize:12, color:C.text3, lineHeight:1.6 }}>{FACE_DISCLAIMER}</div>
      </div>
      {matches.map(m => <PersonMatchCard key={m.id} m={m}/>)}
      <button onClick={onClose} style={{ ...S.btn(C.bg3, C.text2), marginTop:6 }}>Đóng</button>
    </div>
  );
}

// ─── Tìm người bằng ảnh khuôn mặt ────────────────────────────────────────────
function FaceMatchModal({ onClose, missing }) {
  const [preview, setPreview] = useState(null);
  const [phase, setPhase] = useState("idle");   // idle | analyzing | ready | noface | searching | done | error
  const [face, setFace] = useState(null);
  const [warn, setWarn] = useState("");
  const [err, setErr] = useState("");
  const [scope, setScope] = useState("");       // "" = tất cả, "missing", "found_person"
  const [results, setResults] = useState(null);
  const token = useRef(0);
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
    setPhase("searching"); setErr("");
    const { data, error } = await supabase.rpc("search_face", { p_face: face, p_type: scope || null, p_gender: null });
    if (error) { setErr("Không tìm được: " + error.message); setPhase("ready"); return; }
    setResults(data || []); setPhase("done");
  };
  const reset = () => { token.current++; setPhase("idle"); setPreview(null); setFace(null); setResults(null); setErr(""); setWarn(""); };
  const total = (missing || []).length;

  return (
    <Modal onClose={onClose} style={{ maxWidth:500, maxHeight:"92vh", overflowY:"auto" }}>
      {inputEl}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${C.rose},${C.roseDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🔎</div>
        <div><div style={{ fontWeight:800, fontSize:18 }}>Tìm người bằng khuôn mặt</div><div style={{ fontSize:12, color:C.text3 }}>So khuôn mặt — không phụ thuộc quần áo{total ? ` · ${total} hồ sơ đang tìm` : ""}</div></div>
      </div>
      <div style={{ background:`${C.rose}0A`, border:`1px solid ${C.rose}25`, borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#FF9AB9", lineHeight:1.6 }}>
        ⚠️ Kết quả chỉ là <strong>gợi ý</strong>, không đảm bảo chính xác. Luôn xác nhận qua điện thoại.<br/>
        🔒 Ảnh được xử lý ngay trên máy bạn, <strong>không tải lên</strong> và không được lưu lại.
      </div>
      <div style={{ display:"flex", gap:4, background:C.bg, borderRadius:12, padding:4, marginBottom:14 }}>
        {[["","Tất cả"],["missing","Đang mất tích"],["found_person","Đã gặp người lạc"]].map(([v,l])=>(
          <button key={v} onClick={()=>{ setScope(v); setResults(null); if (phase==="done") setPhase("ready"); }} style={{ flex:1, padding:"8px 6px", borderRadius:9, border:"none", background:scope===v?C.rose:"transparent", color:scope===v?"#fff":C.text3, fontWeight:700, fontSize:12, cursor:"pointer" }}>{l}</button>
        ))}
      </div>
      <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={pick}
        style={{ border:`2px dashed ${preview?C.rose:C.border2}`, borderRadius:14, padding:preview?"8px":"30px 20px", textAlign:"center", cursor:"pointer", background:preview?`${C.rose}05`:C.bg, marginBottom:12, minHeight:120, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {preview ? <img src={preview} alt="" style={{ maxHeight:200, maxWidth:"100%", borderRadius:10, objectFit:"contain" }}/>
          : <div><div style={{ fontSize:40, marginBottom:10 }}>👤</div><div style={{ fontWeight:700, fontSize:15 }}>Tải ảnh người cần đối chiếu</div><div style={{ fontSize:12, color:C.text3, marginTop:4 }}>Ảnh rõ mặt, nhìn thẳng cho kết quả tốt nhất</div></div>}
      </div>
      {preview && phase!=="analyzing" && phase!=="searching" && <button onClick={pick} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8, padding:"5px 12px", color:C.text3, fontSize:12, cursor:"pointer", marginBottom:12 }}>🔄 Đổi ảnh</button>}
      {phase==="analyzing" && <div style={{ textAlign:"center", padding:"14px 0", color:C.text2, fontSize:13 }}><span style={{ display:"inline-block", animation:"spin 1.2s linear infinite", marginRight:8 }}>🔄</span>Đang phân tích khuôn mặt… (lần đầu có thể mất vài giây)</div>}
      {phase==="noface" && <div style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"#FF7070", fontSize:13 }}>⚠️ Không thấy khuôn mặt rõ trong ảnh. Hãy thử ảnh chụp rõ mặt, đủ sáng, nhìn thẳng.</div>}
      {err && <div style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"#FF7070", fontSize:13 }}>⚠️ {err}</div>}
      {warn && (phase==="ready"||phase==="done") && <div style={{ fontSize:12, color:C.gold, marginBottom:12 }}>ℹ️ {warn}</div>}
      {phase==="searching" && <div style={{ textAlign:"center", padding:"20px 0" }}><div style={{ fontSize:38, display:"inline-block", animation:"spin 1.2s linear infinite" }}>🔄</div><div style={{ fontWeight:700, marginTop:8 }}>Đang so khớp…</div></div>}
      {phase==="done" && results && (results.length ? <>
        <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>⚡ Tìm thấy {results.length} hồ sơ có khuôn mặt giống</div>
        {results.map(m => <PersonMatchCard key={m.id} m={m}/>)}
        <div style={{ fontSize:11, color:C.text3, lineHeight:1.6, margin:"4px 0 12px" }}>{FACE_DISCLAIMER}</div>
      </> : (
        <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 16px", marginBottom:14, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Chưa có hồ sơ nào có khuôn mặt giống</div>
          <div style={{ fontSize:13, color:C.text3, lineHeight:1.6 }}>Hãy <strong>đăng tin kèm ảnh</strong> — khi sau này có người đăng tin về đúng người này, hệ thống sẽ hiện ngay số liên hệ của bạn cho họ.</div>
        </div>
      ))}
      {phase==="done" && <button onClick={reset} style={{ ...S.btn("#222","#aaa"), width:"auto", padding:"9px 18px", fontSize:13 }}>← Đối chiếu ảnh khác</button>}
      {(phase==="ready"||phase==="error") && face && <button onClick={search} style={S.btn(`linear-gradient(135deg,${C.rose},${C.roseDark})`)}>🔎 Tìm người giống khuôn mặt này</button>}
      {!preview && <button disabled style={S.btn("#1C1C1C","#444")}>🔎 Chọn ảnh trước</button>}
    </Modal>
  );
}

// ─── Kết quả dò tin trùng khớp sau khi đăng ──────────────────────────────────
function MatchResult({ matches, onClose }) {
  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🔔</div>
        <div style={{ fontWeight:900, fontSize:20, marginBottom:6 }}>Tin đã đăng — có {matches.length} tin có thể khớp!</div>
        <div style={{ fontSize:13, color:C.text3, lineHeight:1.5 }}>Hãy gọi điện để xác minh. Giấy tờ chỉ nên trao khi đối chiếu đúng thông tin.</div>
      </div>
      {matches.map(m => (
        <div key={m.id} style={{ background:C.bg3, border:`1.5px solid ${m.score>=90?C.gold:C.border2}`, borderRadius:14, padding:"12px 14px", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
            <span style={{ fontWeight:800, fontSize:13, color:m.score>=90?C.gold:C.teal }}>{m.reason}</span>
            <span style={{ fontSize:11, color:C.text3 }}>{m.type==="found" ? "Người khác đã nhặt được" : "Người khác đang tìm"}</span>
          </div>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{catIcon(m.category)} {m.title || m.category}</div>
          <div style={{ fontSize:12, color:C.text3, marginBottom:8 }}>📍 {m.location} · 📅 {m.date}</div>
          <a href={`tel:${String(m.contact||"").replace(/[^\d+]/g,"")}`} style={{ display:"block", textAlign:"center", background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, borderRadius:10, padding:"10px", color:"#fff", fontWeight:800, fontSize:14, textDecoration:"none" }}>📞 Gọi {m.contact}</a>
        </div>
      ))}
      <button onClick={onClose} style={{ ...S.btn(C.bg3, C.text2), marginTop:6 }}>Đóng</button>
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
  const set = k => v => setForm(f=>({...f,[k]:v}));
  const isDoc = ["CMND/CCCD","Bằng lái xe","Hộ chiếu"].includes(form.category);
  const onFill = (r, prev) => {
    setDocPrev(prev);
    setForm(f=>({ ...f, category:r.loaiGiayTo ? docCategory(r.loaiGiayTo) : f.category, hoTen:r.hoTen||f.hoTen, soGiayTo:r.soGiayTo||f.soGiayTo, ngaySinh:r.ngaySinh||f.ngaySinh, gioiTinh:r.gioiTinh||f.gioiTinh, queQuan:r.queQuan||f.queQuan, diaChiThuongTru:r.diaChiThuongTru||f.diaChiThuongTru, title:r.hoTen?`${r.loaiGiayTo||"Giấy tờ"} mang tên ${r.hoTen}`:f.title, note:r.moTaThem||f.note }));
  };
  const submit = async () => {
    if (busy || !form.title || !form.location || !form.contact) return;
    setBusy(true); setErr("");
    const res = await onAdd({ id:uid(), type:ptype, ...form, img:catIcon(form.category), date:fmtDate() });
    setBusy(false);
    if (!res?.ok) { setErr("Không lưu được tin (kiểm tra số điện thoại hoặc thử lại sau)."); return; }
    setDone(true);
    if (res.matches?.length) setMatches(res.matches);
    else setTimeout(onClose, 1800);
  };
  return (<>
    <Modal onClose={onClose} style={{ maxHeight:"92vh", overflowY:"auto" }}>
      {done && matches?.length ? <MatchResult matches={matches} onClose={onClose}/> : done ? <div style={{ textAlign:"center", padding:"50px 0" }}><div style={{ fontSize:60, marginBottom:16 }}>🎉</div><div style={{ fontWeight:900, fontSize:22, marginBottom:8 }}>Đăng tin thành công!</div></div> : <>
        <div style={{ fontWeight:900, fontSize:20, marginBottom:20 }}>📝 Đăng tin đồ vật</div>
        <div style={{ display:"flex", gap:4, background:C.bg, borderRadius:12, padding:4, marginBottom:20 }}>
          {[["found","🟢 Tôi nhặt được"],["lost","🔴 Tôi bị mất"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPtype(v)} style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:ptype===v?(v==="found"?C.teal:C.accent):"transparent", color:ptype===v?"#fff":C.text3, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>{l}</button>
          ))}
        </div>
        <div style={{ background:`linear-gradient(135deg,${C.violet}18,${C.violetDark}08)`, border:`1.5px solid ${C.violet}28`, borderRadius:14, padding:"14px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:26 }}>🤖</span>
          <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>Tự động điền bằng AI</div><div style={{ fontSize:12, color:C.text3, marginTop:2 }}>Chụp ảnh giấy tờ → AI đọc & điền form</div></div>
          <button onClick={()=>setShowScan(true)} style={{ background:`linear-gradient(135deg,${C.violet},${C.violetDark})`, border:"none", borderRadius:10, padding:"9px 14px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>Quét ✨</button>
        </div>
        {docPrev && <div style={{ marginBottom:16, borderRadius:10, overflow:"hidden", border:`1.5px solid ${C.violet}35`, position:"relative" }}>
          <img src={docPrev} alt="" style={{ width:"100%", maxHeight:90, objectFit:"cover", objectPosition:"top" }}/>
          <div style={{ position:"absolute", top:8, right:8, background:`${C.violet}E0`, borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700, color:"#fff" }}>✅ Đã quét AI</div>
          <button onClick={()=>setShowScan(true)} style={{ position:"absolute", top:8, left:8, background:"rgba(0,0,0,0.6)", border:"none", borderRadius:8, padding:"3px 10px", fontSize:11, color:"#ccc", cursor:"pointer" }}>🔄 Quét lại</button>
        </div>}
        <Field label="Tên / Mô tả đồ vật" value={form.title} onChange={set("title")} placeholder="VD: CCCD mang tên Nguyễn Văn A" required/>
        <Select label="Loại đồ vật" value={form.category} onChange={set("category")} options={ITEM_CAT}/>
        {isDoc && <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
          <SectionTitle icon="📋" text="Thông tin trên giấy tờ"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
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
        {err && <div style={{ background:"rgba(255,79,123,0.12)", border:`1px solid ${C.rose}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:C.rose, marginBottom:12 }}>{err}</div>}
        <button onClick={submit} disabled={busy} style={{ ...S.btn(`linear-gradient(135deg,${ptype==="found"?C.teal:C.accent},${ptype==="found"?C.tealDark:C.accentDark})`), opacity:busy?0.6:1 }}>{busy ? "Đang đăng…" : "Đăng tin ngay →"}</button>
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
  const [faceState, setFaceState] = useState("idle");   // idle | loading | ok | none | error
  const [face, setFace] = useState(null);
  const [faceNote, setFaceNote] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [consent, setConsent] = useState(false);
  const [publicPhoto, setPublicPhoto] = useState(null); // null = theo mặc định của loại tin
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [matches, setMatches] = useState(null);
  const token = useRef(0);
  const set = k => v => setForm(f=>({...f,[k]:v}));
  // Mặc định: gia đình đang tìm người -> hiện ảnh công khai; người gặp người lạc -> KHÔNG hiện ảnh công khai
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
      });
      if (!res?.ok) throw new Error(res?.error || "Không lưu được tin, vui lòng thử lại.");
      setDone(true);
      if (res.matches?.length) setMatches(res.matches); else setTimeout(onClose, 1800);
    } catch (e) { setErr(e.message || "Có lỗi xảy ra, vui lòng thử lại."); }
    setBusy(false);
  };
  const tone = ptype==="missing" ? C.rose : C.teal;
  const chk = { display:"flex", gap:10, alignItems:"flex-start", fontSize:12, color:C.text2, lineHeight:1.6, cursor:"pointer", marginBottom:8 };
  return (
    <Modal onClose={onClose} style={{ maxHeight:"92vh", overflowY:"auto" }}>
      {inputEl}
      {done && matches?.length ? <PersonMatchResult matches={matches} onClose={onClose}/> : done ? <div style={{ textAlign:"center", padding:"50px 0" }}><div style={{ fontSize:60, marginBottom:16 }}>🙏</div><div style={{ fontWeight:900, fontSize:22, marginBottom:8 }}>Tin đã được đăng!</div><div style={{ fontSize:13, color:C.text3 }}>Chưa thấy tin nào khớp lúc này. Khi có người đăng tin về đúng người này, họ sẽ thấy số liên hệ của bạn.</div></div> : <>
        <div style={{ fontWeight:900, fontSize:20, marginBottom:20 }}>👤 Đăng tin tìm người thân</div>
        <div style={{ display:"flex", gap:4, background:C.bg, borderRadius:12, padding:4, marginBottom:20 }}>
          {[["missing","🔴 Tôi đang tìm"],["found_person","🟢 Tôi gặp người lạc"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPtype(v)} style={{ flex:1, padding:"10px 8px", borderRadius:9, border:"none", background:ptype===v?(v==="missing"?C.rose:C.teal):"transparent", color:ptype===v?"#fff":C.text3, fontWeight:700, fontSize:13, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:11, color:C.text3, marginBottom:8, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>
            Ảnh khuôn mặt {ptype==="missing" ? "người cần tìm" : "người bạn gặp"} <span style={{ color:C.violet, fontWeight:400, textTransform:"none" }}>· giúp hệ thống nhận ra dù đổi quần áo</span>
          </label>
          <div onClick={pick} style={{ border:`2px dashed ${imgPrev?tone:C.border2}`, borderRadius:12, padding:imgPrev?"8px":"22px", textAlign:"center", cursor:"pointer", background:imgPrev?`${tone}04`:C.bg, minHeight:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {imgPrev ? <div style={{ position:"relative", width:"100%" }}><img src={imgPrev} alt="" style={{ maxHeight:160, maxWidth:"100%", borderRadius:8, objectFit:"contain" }}/>{faceState==="loading" && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.55)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#fff" }}>⏳ Đang phân tích khuôn mặt…</div>}</div>
            : <div><div style={{ fontSize:34, marginBottom:8 }}>🖼️</div><div style={{ fontWeight:700, fontSize:14 }}>Tải ảnh rõ mặt</div><div style={{ fontSize:12, color:C.text3, marginTop:4 }}>Ảnh chụp thẳng, đủ sáng cho kết quả tốt nhất</div></div>}
          </div>
          {imgPrev && <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
            <button onClick={pick} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8, padding:"5px 12px", color:C.text3, fontSize:12, cursor:"pointer" }}>🔄 Đổi ảnh</button>
            <button onClick={removePhoto} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8, padding:"5px 12px", color:C.text3, fontSize:12, cursor:"pointer" }}>✖ Bỏ ảnh</button>
            <button onClick={describeWithAI} disabled={aiBusy} style={{ background:`${C.violet}22`, border:`1px solid ${C.violet}55`, borderRadius:8, padding:"5px 12px", color:"#C9C3FF", fontSize:12, cursor:"pointer", opacity:aiBusy?0.6:1 }}>{aiBusy ? "🤖 AI đang mô tả…" : "🤖 Nhờ AI mô tả giúp"}</button>
          </div>}
          {aiMsg && <div style={{ fontSize:12, color:C.text2, marginTop:6 }}>{aiMsg}</div>}
          {imgPrev && <div style={{ fontSize:11, color:C.text3, marginTop:4 }}>Nút “Nhờ AI mô tả” sẽ gửi một bản ảnh nhỏ tới dịch vụ AI (Claude) để mô tả ngoại hình. Nhận diện khuôn mặt thì chạy ngay trên máy bạn.</div>}
          {faceState==="ok" && <div style={{ fontSize:12, color:C.accent, marginTop:8 }}>✅ Đã nhận diện khuôn mặt — hệ thống sẽ dò các tin khớp {ptype==="missing" ? "trong danh sách người đã được gặp" : "trong danh sách người đang được tìm"}. {faceNote && <span style={{ color:C.gold }}>{faceNote}</span>}</div>}
          {faceState==="none" && <div style={{ fontSize:12, color:C.gold, marginTop:8 }}>⚠️ Không thấy khuôn mặt rõ trong ảnh. Vẫn đăng được nhưng hệ thống chỉ dò theo họ tên. Hãy thử ảnh chụp rõ mặt hơn.</div>}
          {faceState==="error" && <div style={{ fontSize:12, color:C.gold, marginTop:8 }}>⚠️ Trình duyệt này không chạy được nhận diện khuôn mặt. Bạn vẫn đăng được tin (dò theo họ tên).</div>}
        </div>
        <Field label="Họ và tên" value={form.hoTen} onChange={set("hoTen")} placeholder={ptype==="missing"?"Nguyễn Thị Lan":"Không rõ tên"} required/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
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
        {imgPrev && <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <label style={chk}>
            <input type="checkbox" checked={showPhoto} onChange={e=>setPublicPhoto(e.target.checked)} style={{ marginTop:3 }}/>
            <span><strong>Hiển thị ảnh công khai trên trang</strong>{ptype==="found_person" ? " — mặc định TẮT để bảo vệ người bạn gặp; hệ thống vẫn so khuôn mặt và báo cho gia đình đang tìm." : " — giúp nhiều người nhận ra hơn."}</span>
          </label>
          <label style={{ ...chk, marginBottom:0 }}>
            <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{ marginTop:3 }}/>
            <span>Tôi đăng ảnh này với mục đích giúp {ptype==="missing" ? "tìm người thân" : "người lạc đoàn tụ với gia đình"}, và đồng ý để hệ thống lưu <strong>dãy số đặc trưng khuôn mặt</strong> (không phải ảnh) để đối chiếu. Tôi sẽ nhờ quản trị viên đóng tin khi đã tìm thấy.</span>
          </label>
        </div>}
        {err && <div style={{ background:"rgba(255,79,123,0.12)", border:`1px solid ${C.rose}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:C.rose, marginBottom:12 }}>{err}</div>}
        <button onClick={submit} disabled={busy} style={{ ...S.btn(`linear-gradient(135deg,${tone},${ptype==="missing"?C.roseDark:C.tealDark})`), opacity:busy?0.6:1 }}>{busy ? "Đang đăng…" : "🙏 Đăng tin ngay"}</button>
      </>}
    </Modal>
  );
}

// ─── Item Detail Modal ────────────────────────────────────────────────────────
function ItemDetail({ item, onClose }) {
  const color = item.type==="lost" ? C.accent : C.teal;
  const sensitive = isSensitive(item);
  return (
    <Modal onClose={onClose}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
        <div style={{ width:60, height:60, borderRadius:16, background:`${color}18`, border:`1.5px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, flexShrink:0 }}>{item.img}</div>
        <div>
          <Chip text={item.type==="lost"?"🔴 Đang tìm":"🟢 Đã nhặt được"} color={color}/>
          <h2 style={{ fontWeight:900, fontSize:18, margin:"8px 0 4px", lineHeight:1.3 }}>{sensitive ? privateTitle(item) : item.title}</h2>
          <div style={{ fontSize:12, color:C.text3 }}>Đăng ngày {item.date}</div>
        </div>
      </div>
      {sensitive && <div style={{ background:"rgba(241,196,15,0.08)", border:`1.5px solid #F1C40F40`, borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:12 }}>
          <span style={{ fontSize:22, flexShrink:0 }}>🔒</span>
          <div>
            <div style={{ fontWeight:800, fontSize:14, marginBottom:4, color:"#F1C40F" }}>Thông tin đang được bảo mật</div>
            <div style={{ fontSize:13, color:C.text3, lineHeight:1.6 }}>Số giấy tờ, ngày sinh và địa chỉ chi tiết chỉ hiển thị sau khi xác minh trùng khớp.</div>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"10px 12px", marginBottom:12 }}>
          <div style={{ fontSize:12, color:C.text2, fontWeight:700, marginBottom:8 }}>📋 Thông tin đã che:</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {item.soGiayTo && <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
              <span style={{ color:C.text3 }}>Số giấy tờ</span>
              <span style={{ color:"#F1C40F", fontWeight:700, letterSpacing:2 }}>{maskID(item.soGiayTo)}</span>
            </div>}
            {item.ngaySinh && <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
              <span style={{ color:C.text3 }}>Ngày sinh</span>
              <span style={{ color:"#F1C40F", fontWeight:700 }}>{maskDate(item.ngaySinh)}</span>
            </div>}
            {item.diaChiThuongTru && <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
              <span style={{ color:C.text3 }}>Địa chỉ</span>
              <span style={{ color:"#F1C40F", fontWeight:700 }}>{maskAddress(item.diaChiThuongTru)}</span>
            </div>}
          </div>
        </div>
        <div style={{ fontSize:12, color:C.text3, lineHeight:1.7 }}>
          💡 <strong style={{ color:C.text2 }}>Để xác minh:</strong> Gọi điện cho người đăng và cung cấp:<br/>
          1. Số 3 chữ số đầu của giấy tờ<br/>
          2. Tháng và năm sinh<br/>
          3. Tỉnh/thành phố trên giấy tờ
        </div>
      </div>}
      <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <SectionTitle icon="📍" text="Thông tin địa điểm"/>
        <InfoRow label="Loại đồ vật" value={item.category}/>
        <InfoRow label="Địa điểm" value={item.location}/>
        <InfoRow label="Ngày đăng" value={item.date}/>
      </div>
      {item.note && !sensitive && <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <SectionTitle icon="📝" text="Ghi chú"/>
        <p style={{ fontSize:14, color:C.text2, lineHeight:1.6, margin:0 }}>{item.note}</p>
      </div>}
      {(item.hoTen||item.soGiayTo) && <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <SectionTitle icon="📋" text="Thông tin trên giấy tờ"/>
        <InfoRow label="Họ và tên" value={sensitive ? "*** ***" : item.hoTen}/>
        <InfoRow label="Số giấy tờ" value={sensitive ? maskID(item.soGiayTo) : item.soGiayTo}/>
        <InfoRow label="Ngày sinh" value={sensitive ? maskDate(item.ngaySinh) : item.ngaySinh}/>
        {item.diaChiThuongTru && <InfoRow label="Địa chỉ" value={sensitive ? maskAddress(item.diaChiThuongTru) : item.diaChiThuongTru}/>}
      </div>}
      {item.reward && <div style={{ background:`${C.gold}10`, border:`1px solid ${C.gold}25`, borderRadius:10, padding:"12px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>🏆</span><span style={{ color:C.gold, fontWeight:700, fontSize:15 }}>Tiền thưởng: {item.reward}</span>
      </div>}
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
        <div style={{ fontSize:12, color:C.text3, marginBottom:8 }}>{sensitive?"📞 Liên hệ để xác minh và nhận lại giấy tờ:":"📞 Liên hệ để trả / nhận đồ:"}</div>
        <a href={`tel:${item.contact}`} style={{ display:"block", background:`linear-gradient(135deg,${color},${item.type==="found"?C.tealDark:C.accentDark})`, borderRadius:12, padding:"14px", color:"#fff", fontWeight:800, fontSize:17, textDecoration:"none", textAlign:"center" }}>{item.contact}</a>
        {sensitive && <div style={{ textAlign:"center", fontSize:12, color:"#444", marginTop:8 }}>🔒 Thông tin giấy tờ chỉ xác nhận qua điện thoại</div>}
      </div>
    </Modal>
  );
}

// ─── Missing Detail Modal ─────────────────────────────────────────────────────
function MissingDetail({ person, onClose, onFaceSearch }) {
  const isFound = person.type==="found_person";
  const uc = person.urgency==="high" ? C.rose : C.gold;
  return (
    <Modal onClose={onClose}>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18 }}>
        <div style={{ width:64, height:64, borderRadius:16, background:`${uc}15`, border:`1.5px solid ${uc}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, flexShrink:0 }}>
          {person.img ? <img src={person.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:14 }}/> : person.avatar}
        </div>
        <div>
          {!isFound && person.urgency==="high" && <Chip text="🚨 Khẩn cấp" color={C.rose}/>}
          {isFound && <Chip text="🟢 Đã gặp được" color={C.teal}/>}
          {!isFound && person.urgency==="medium" && <Chip text="⚠️ Đang tìm" color={C.gold}/>}
          <h2 style={{ fontWeight:900, fontSize:19, margin:"8px 0 4px" }}>{person.hoTen}</h2>
          <div style={{ fontSize:13, color:C.text3 }}>{person.tuoi} · {person.gioiTinh}</div>
        </div>
      </div>
      <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <SectionTitle icon="🔍" text="Đặc điểm nhận dạng"/>
        <p style={{ fontSize:14, color:C.text, lineHeight:1.7, margin:"0 0 10px" }}>{person.danhTich}</p>
        {person.trangPhuc && <InfoRow label="👔 Trang phục" value={person.trangPhuc}/>}
      </div>
      <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <SectionTitle icon="📍" text="Thông tin sự cố"/>
        <InfoRow label="Lần cuối thấy" value={person.lanCuoiThay}/>
        <InfoRow label="Thời gian" value={person.thoiGian}/>
        <InfoRow label="Ngày đăng tin" value={person.date}/>
        {person.tieuChuan && <InfoRow label="Ghi chú" value={person.tieuChuan}/>}
      </div>
      {person.reward && <div style={{ background:`${C.gold}10`, border:`1px solid ${C.gold}25`, borderRadius:10, padding:"12px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>🏆</span><span style={{ color:C.gold, fontWeight:700, fontSize:15 }}>Tiền thưởng: {person.reward}</span>
      </div>}
      <button onClick={()=>{onClose();onFaceSearch();}} style={{ ...S.btn(`linear-gradient(135deg,${C.violet},${C.violetDark})`), marginBottom:10 }}>🔎 Tôi có ảnh — Đối chiếu ngay</button>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
        <div style={{ fontSize:12, color:C.text3, marginBottom:8 }}>📞 Liên hệ ngay nếu có thông tin:</div>
        <a href={`tel:${person.contact}`} style={{ display:"block", background:`linear-gradient(135deg,${uc},${person.urgency==="high"?C.roseDark:"#E6A817"})`, borderRadius:12, padding:"14px", color:"#fff", fontWeight:800, fontSize:17, textDecoration:"none", textAlign:"center" }}>{person.contact}</a>
      </div>
    </Modal>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, onClick }) {
  const [hov, setHov] = useState(false);
  const color = item.type==="lost" ? C.accent : C.teal;
  const sensitive = isSensitive(item);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:C.bg2, border:`1.5px solid ${hov?color:C.border}`, borderRadius:16, padding:18, cursor:"pointer", transition:"all 0.18s", transform:hov?"translateY(-3px) scale(1.01)":"none", boxShadow:hov?`0 8px 24px ${color}18`:"none", position:"relative" }}>
      <div style={{ position:"absolute", top:13, right:13 }}><Chip text={item.type==="lost"?"Đang tìm":"Đã nhặt"} color={color}/></div>
      <div style={{ fontSize:32, marginBottom:12, width:52, height:52, background:`${color}12`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>{item.img}</div>
      <div style={{ fontSize:10, color:C.text3, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{item.category}</div>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:6, lineHeight:1.4, paddingRight:70 }}>{sensitive ? privateTitle(item) : item.title}</div>
      {item.hoTen && <div style={{ fontSize:11, color:C.violet, fontWeight:600, marginBottom:6 }}>
        👤 {sensitive ? "*** ***" : item.hoTen}
        {item.soGiayTo && <span style={{ color:"#444" }}> · {sensitive ? maskID(item.soGiayTo) : item.soGiayTo}</span>}
      </div>}
      {sensitive && item.type==="found" && <div style={{ fontSize:10, color:"#F1C40F", marginBottom:4, display:"flex", alignItems:"center", gap:4 }}>
        🔒 <span>Thông tin được bảo mật — Liên hệ để xác minh</span>
      </div>}
      <div style={{ fontSize:11, color:"#444" }}>📍 {item.location}</div>
      <div style={{ fontSize:11, color:"#333", marginTop:2 }}>📅 {item.date}</div>
      {sensitive && <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:11 }}>🔒</span><span style={{ fontSize:11, color:"#555" }}>Bấm để liên hệ xác minh</span></div>}
      {item.reward && <div style={{ marginTop:8, background:`${C.gold}12`, borderRadius:8, padding:"4px 10px", display:"inline-block" }}><span style={{ fontSize:12, color:C.gold, fontWeight:700 }}>🏆 {item.reward}</span></div>}
    </div>
  );
}

// ─── Missing Card ─────────────────────────────────────────────────────────────
function MissingCard({ person, onClick }) {
  const [hov, setHov] = useState(false);
  const isFound = person.type==="found_person";
  const uc = person.urgency==="high"&&!isFound ? C.rose : (isFound ? C.teal : C.gold);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:C.bg2, border:`1.5px solid ${hov?uc:C.border}`, borderRadius:16, padding:18, cursor:"pointer", transition:"all 0.18s", transform:hov?"translateY(-3px) scale(1.01)":"none", boxShadow:hov?`0 8px 24px ${uc}18`:"none", position:"relative" }}>
      {person.urgency==="high"&&!isFound && <div style={{ position:"absolute", top:13, right:13 }}><Chip text="🚨 Khẩn" color={C.rose}/></div>}
      {isFound && <div style={{ position:"absolute", top:13, right:13 }}><Chip text="🟢 Đã gặp" color={C.teal}/></div>}
      {!isFound&&person.urgency==="medium" && <div style={{ position:"absolute", top:13, right:13 }}><Chip text="⚠️ Tìm kiếm" color={C.gold}/></div>}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <div style={{ width:50, height:50, borderRadius:12, background:`${uc}15`, border:`1.5px solid ${uc}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, overflow:"hidden" }}>
          {person.img ? <img src={person.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : person.avatar}
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:14, lineHeight:1.3 }}>{person.hoTen}</div>
          <div style={{ fontSize:12, color:C.text3 }}>{person.tuoi} · {person.gioiTinh}</div>
        </div>
      </div>
      <div style={{ fontSize:12, color:C.text3, lineHeight:1.5, marginBottom:6 }}>{person.danhTich.slice(0,90)}{person.danhTich.length>90?"…":""}</div>
      <div style={{ fontSize:11, color:"#444" }}>📍 {person.lanCuoiThay}</div>
      <div style={{ fontSize:11, color:"#333", marginTop:2 }}>📅 {person.date}</div>
      {person.reward && <div style={{ marginTop:8, background:`${C.gold}12`, borderRadius:8, padding:"4px 10px", display:"inline-block" }}><span style={{ fontSize:12, color:C.gold, fontWeight:700 }}>🏆 {person.reward}</span></div>}
    </div>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────────────────
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
    <Modal onClose={onClose} style={{ maxWidth:400 }}>
      {step==="done" ? <div style={{ textAlign:"center", padding:"40px 0" }}><div style={{ fontSize:56, marginBottom:14 }}>🎉</div><div style={{ fontWeight:900, fontSize:20 }}>Đăng nhập thành công!</div></div> : <>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 12px" }}>🔍</div>
          <div style={{ fontWeight:900, fontSize:20 }}>Đăng nhập TìmĐồ<span style={{ color:C.accent }}>.vn</span></div>
          <div style={{ fontSize:13, color:C.text3, marginTop:4 }}>{step==="phone"?"Nhập số điện thoại để nhận mã OTP":`Nhập mã OTP gửi đến ${phone}`}</div>
        </div>
        {step==="phone" && <>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, color:C.text3, marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Số điện thoại</label>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ background:C.bg3, border:`1.5px solid ${C.border2}`, borderRadius:10, padding:"11px 13px", fontSize:14, color:C.text3 }}>🇻🇳 +84</div>
              <input value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendOtp()} placeholder="090 123 4567" style={{ ...S.input, flex:1 }} maxLength={12}/>
            </div>
          </div>
          {err && <div style={{ color:"#FF7070", fontSize:13, marginBottom:10 }}>⚠️ {err}</div>}
          <button onClick={sendOtp} disabled={loading} style={S.btn(loading?"#222":`linear-gradient(135deg,${C.accent},${C.accentDark})`, loading?"#555":"#fff")}>{loading?"Đang gửi OTP…":"Gửi mã OTP →"}</button>
          <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:C.text3 }}>Bằng cách đăng nhập, bạn đồng ý với <span style={{ color:C.accent, cursor:"pointer" }}>Điều khoản sử dụng</span></div>
        </>}
        {step==="otp" && <>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:20 }}>
            {otp.map((v,i)=>(
              <input key={i} ref={refs[i]} value={v} onChange={e=>handleOtp(i,e.target.value)} onKeyDown={e=>e.key==="Backspace"&&!v&&i>0&&refs[i-1].current?.focus()} maxLength={1} inputMode="numeric"
                style={{ width:46, height:54, textAlign:"center", fontSize:22, fontWeight:800, background:C.bg3, border:`2px solid ${v?C.accent:C.border2}`, borderRadius:12, color:C.text, outline:"none" }}/>
            ))}
          </div>
          {err && <div style={{ color:"#FF7070", fontSize:13, marginBottom:10, textAlign:"center" }}>⚠️ {err}</div>}
          <button onClick={verify} disabled={loading} style={S.btn(loading?"#222":`linear-gradient(135deg,${C.accent},${C.accentDark})`, loading?"#555":"#fff")}>{loading?"Đang xác minh…":"Xác nhận"}</button>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
            <button onClick={()=>{setStep("phone");setOtp(["","","","","",""]);setErr("");}} style={{ background:"transparent", border:"none", color:C.text3, fontSize:13, cursor:"pointer" }}>← Đổi số</button>
            <button onClick={sendOtp} style={{ background:"transparent", border:"none", color:C.accent, fontSize:13, cursor:"pointer", fontWeight:600 }}>Gửi lại OTP</button>
          </div>
          <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:"#444", background:C.bg, borderRadius:8, padding:"6px 10px" }}>💡 Demo: mã <strong style={{ color:C.gold }}>123456</strong></div>
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
  const tc = t => t==="match"?C.teal:t==="urgent"?C.rose:C.violet;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.5)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", top:70, right:16, width:380, maxHeight:"80vh", background:C.bg1, border:`1.5px solid ${C.border}`, borderRadius:20, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ padding:"16px 18px 0", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontWeight:800, fontSize:16 }}>🔔 Thông báo {unread>0&&<span style={{ background:C.rose, color:"#fff", fontSize:11, fontWeight:700, padding:"2px 7px", borderRadius:20, marginLeft:6 }}>{unread}</span>}</div>
            <div style={{ display:"flex", gap:8 }}>
              {unread>0 && <button onClick={()=>setNotifs(p=>p.map(n=>({...n,read:true})))} style={{ background:"transparent", border:"none", color:C.accent, fontSize:12, cursor:"pointer", fontWeight:600 }}>Đọc tất cả</button>}
              <button onClick={onClose} style={{ background:"#222", border:"none", borderRadius:6, width:26, height:26, color:"#888", cursor:"pointer", fontSize:16 }}>×</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {[["all","Tất cả"],["unread","Chưa đọc"]].map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v)} style={{ padding:"6px 14px", borderRadius:"8px 8px 0 0", border:"none", background:tab===v?C.bg2:"transparent", color:tab===v?"#fff":C.text3, fontWeight:600, fontSize:12, cursor:"pointer" }}>{l}{v==="unread"&&unread>0?` (${unread})`:""}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          {shown.length===0 ? <div style={{ textAlign:"center", padding:"40px 0", color:C.text3 }}><div style={{ fontSize:36, marginBottom:8 }}>🔕</div><div>Không có thông báo mới</div></div>
          : shown.map(n=>(
            <div key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))} style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, background:n.read?"transparent":`${tc(n.type)}08`, cursor:"pointer" }}>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${tc(n.type)}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{n.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:n.read?600:800, fontSize:13, lineHeight:1.4, color:n.read?C.text2:C.text }}>{n.title}</div>
                  <div style={{ fontSize:12, color:C.text3, lineHeight:1.5, marginTop:3 }}>{n.body}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                    <span style={{ fontSize:11, color:"#444" }}>{n.time}</span>
                    {n.action && <span style={{ fontSize:11, color:tc(n.type), fontWeight:700, cursor:"pointer" }}>{n.action} →</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 18px" }}>
          {!showSub ? <button onClick={()=>setShowSub(true)} style={{ ...S.btn(`linear-gradient(135deg,${C.violet},${C.violetDark})`), padding:"10px", fontSize:13 }}>📲 Đăng ký nhận thông báo SMS / Zalo</button>
          : subDone ? <div style={{ textAlign:"center", padding:"10px 0", color:C.teal, fontWeight:700 }}>✅ Đăng ký thành công!</div>
          : <div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>📲 Cài đặt thông báo</div>
              <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                {[["sms","📱 SMS"],["zalo","💬 Zalo"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setSubCh(v)} style={{ flex:1, padding:"8px", borderRadius:8, border:`1.5px solid ${subCh===v?C.violet:C.border2}`, background:subCh===v?`${C.violet}18`:"transparent", color:subCh===v?C.violet:C.text3, fontWeight:600, fontSize:13, cursor:"pointer" }}>{l}</button>
                ))}
              </div>
              <input value={subPhone} onChange={e=>setSubPhone(e.target.value)} placeholder="090 123 4567" style={{ ...S.input, fontSize:13, marginBottom:8 }}/>
              <input value={subKw} onChange={e=>setSubKw(e.target.value)} placeholder="Từ khóa: ví, CCCD, Quận 1…" style={{ ...S.input, fontSize:13, marginBottom:10 }}/>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setShowSub(false)} style={{ ...S.btn("#222","#aaa"), flex:1, padding:"9px", fontSize:13 }}>Huỷ</button>
                <button onClick={()=>setSubDone(true)} style={{ ...S.btn(`linear-gradient(135deg,${C.violet},${C.violetDark})`), flex:2, padding:"9px", fontSize:13 }}>Đăng ký</button>
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
const PIN_COLOR = { lost:"#FF6B35", found:"#2EC4B6", missing:"#FF4F7B" };
function MapModal({ onClose }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [pick, setPick] = useState(false);
  const [picked, setPicked] = useState(null);
  const pins = MAP_PINS.filter(p => filter==="all"||(filter==="items"&&p.cat==="item")||(filter==="missing"&&p.cat==="person"));
  const toX = lng => ((lng-102)/(110-102))*100;
  const toY = lat => ((23.5-lat)/(23.5-8.5))*100;
  return (
    <Modal onClose={onClose} style={{ maxWidth:680, padding:0, overflow:"hidden" }}>
      <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:18 }}>🗺️ Bản đồ tin đăng</div>
          <button onClick={onClose} style={{ background:"#222", border:"none", borderRadius:8, width:30, height:30, color:"#888", cursor:"pointer", fontSize:18 }}>×</button>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["all","🗺️ Tất cả"],["items","🪪 Đồ vật"],["missing","👤 Người thân"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setFilter(v);setSelected(null);}} style={{ padding:"6px 14px", borderRadius:8, border:`1.5px solid ${filter===v?C.accent:C.border}`, background:filter===v?`${C.accent}12`:"transparent", color:filter===v?C.accent:C.text3, fontWeight:600, fontSize:12, cursor:"pointer" }}>{l}</button>
          ))}
          <button onClick={()=>setPick(!pick)} style={{ marginLeft:"auto", padding:"6px 14px", borderRadius:8, border:`1.5px solid ${pick?C.violet:C.border}`, background:pick?`${C.violet}18`:"transparent", color:pick?C.violet:C.text3, fontWeight:600, fontSize:12, cursor:"pointer" }}>
            {pick?"✅ Đang chọn":"📍 Chọn vị trí"}
          </button>
        </div>
      </div>
      <div style={{ position:"relative", background:"#0D1117", cursor:pick?"crosshair":"default" }}
        onClick={e=>{
          if (!pick) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const lng = 102+((e.clientX-rect.left)/rect.width)*(110-102);
          const lat = 23.5-((e.clientY-rect.top)/rect.height)*(23.5-8.5);
          setPicked({ lat:lat.toFixed(4), lng:lng.toFixed(4) });
        }}>
        <svg viewBox="0 0 100 100" style={{ width:"100%", height:380, display:"block" }} preserveAspectRatio="none">
          <rect width="100" height="100" fill="#0D1117"/>
          <path d="M 52 5 L 58 8 L 64 12 L 68 18 L 70 25 L 66 32 L 72 38 L 74 44 L 70 50 L 65 55 L 68 62 L 66 70 L 60 78 L 54 85 L 50 90 L 46 85 L 44 78 L 46 70 L 42 62 L 40 55 L 38 48 L 42 42 L 38 36 L 36 30 L 40 22 L 44 15 L 48 8 Z" fill="#1a2332" stroke="#2A3F5F" strokeWidth="0.5"/>
          {[{n:"Hà Nội",lat:21.03,lng:105.85},{n:"TP.HCM",lat:10.78,lng:106.70},{n:"Đà Nẵng",lat:16.05,lng:108.22}].map(c=>(
            <text key={c.n} x={toX(c.lng)} y={toY(c.lat)+5} fontSize="2" fill="#3A4A6A" textAnchor="middle">{c.n}</text>
          ))}
          {pins.map(p=>{
            const x=toX(p.lng), y=toY(p.lat), color=PIN_COLOR[p.type]||C.accent, sel=selected?.id===p.id;
            return <g key={p.id} onClick={e=>{e.stopPropagation();setSelected(p);}} style={{ cursor:"pointer" }}>
              <circle cx={x} cy={y} r={sel?3.5:2.5} fill={color} opacity={0.9}/>
              <circle cx={x} cy={y} r={sel?5:4} fill={color} opacity={0.2}/>
              {sel && <circle cx={x} cy={y} r={7} fill="none" stroke={color} strokeWidth="0.5" opacity={0.5}/>}
            </g>;
          })}
          {picked && <>
            <circle cx={toX(parseFloat(picked.lng))} cy={toY(parseFloat(picked.lat))} r="3" fill={C.violet} opacity={0.9}/>
            <circle cx={toX(parseFloat(picked.lng))} cy={toY(parseFloat(picked.lat))} r="6" fill={C.violet} opacity={0.2}/>
          </>}
        </svg>
        <div style={{ position:"absolute", top:12, left:12, background:"rgba(0,0,0,0.75)", borderRadius:10, padding:"8px 12px", display:"flex", flexDirection:"column", gap:5 }}>
          {[["Đang tìm đồ",C.accent],["Đã nhặt được",C.teal],["Người mất tích",C.rose]].map(([l,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#ccc" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:c, flexShrink:0 }}/>{l}
            </div>
          ))}
        </div>
        {pick && <div style={{ position:"absolute", bottom:0, left:0, right:0, background:`${C.violet}E0`, padding:"10px", textAlign:"center", fontSize:13, color:"#fff", fontWeight:600 }}>📍 Bấm vào bản đồ để chọn vị trí</div>}
      </div>
      {selected && <div style={{ padding:"14px 22px", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${PIN_COLOR[selected.type]}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{selected.cat==="person"?"👤":"📦"}</div>
        <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>{selected.title}</div><div style={{ fontSize:12, color:C.text3 }}>📍 {selected.location}</div></div>
      </div>}
      {picked && pick && <div style={{ padding:"12px 22px", borderTop:`1px solid ${C.border}`, background:`${C.violet}08`, display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:20 }}>📍</span>
        <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700 }}>Vị trí đã chọn</div><div style={{ fontSize:12, color:C.text3 }}>Lat: {picked.lat} · Lng: {picked.lng}</div></div>
        <button onClick={()=>{setPick(false);setPicked(null);}} style={{ ...S.btn(`linear-gradient(135deg,${C.violet},${C.violetDark})`), width:"auto", padding:"8px 14px", fontSize:12 }}>Dùng vị trí này ✓</button>
      </div>}
      <div style={{ padding:"10px 22px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", fontSize:12, color:C.text3 }}>
        <span>Hiển thị <strong style={{ color:"#ccc" }}>{pins.length}</strong> vị trí</span>
        <span>{["🔴","🟢","🔵"].map((i,k)=>`${i} ${[pins.filter(p=>p.type==="lost").length,pins.filter(p=>p.type==="found").length,pins.filter(p=>p.type==="missing").length][k]}`).join("  ")}</span>
      </div>
    </Modal>
  );
}

// ─── Trang quản trị (mở bằng timdovn.vn/#admin) ───────────────────────────────
const digitsOnly = v => String(v||"").replace(/\D/g,"");
const dupKey = i => `${i.type}|${String(i.so_giay_to||"").replace(/\W/g,"").toUpperCase() || String(i.title||"").trim().toLowerCase()}|${digitsOnly(i.contact)}`;
const btnSm = (color) => ({ background:"transparent", border:`1.5px solid ${color}`, borderRadius:8, padding:"6px 12px", color, fontWeight:700, fontSize:12, cursor:"pointer" });
const badge = (color) => ({ display:"inline-block", fontSize:11, fontWeight:800, color, border:`1px solid ${color}`, borderRadius:6, padding:"1px 7px", marginRight:6 });

function AdminPanel({ onExit }) {
  const [session, setSession] = useState(undefined);   // undefined = đang kiểm tra đăng nhập
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

  const wrap = { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"20px 16px" };
  const inner = { maxWidth:900, margin:"0 auto" };
  const card = { background:C.bg2, border:`1.5px solid ${C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:10 };

  if (session === undefined) return <div style={wrap}><div style={inner}>Đang kiểm tra đăng nhập…</div></div>;

  if (!session) return (
    <div style={wrap}><div style={{ ...inner, maxWidth:400 }}>
      <div style={{ ...S.box, marginTop:40 }}>
        <div style={{ fontWeight:900, fontSize:20, marginBottom:4 }}>🛡️ Quản trị TìmĐồ.vn</div>
        <div style={{ fontSize:13, color:C.text3, marginBottom:18 }}>Chỉ dành cho quản trị viên.</div>
        <form onSubmit={login}>
          <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="email@quantri.com" required/>
          <Field label="Mật khẩu" value={password} onChange={setPassword} type="password" required/>
          {loginErr && <div style={{ color:C.rose, fontSize:13, marginBottom:12 }}>{loginErr}</div>}
          <button type="submit" disabled={busy} style={{ ...S.btn(`linear-gradient(135deg,${C.accent},${C.accentDark})`), opacity:busy?0.6:1 }}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
        </form>
        <button onClick={onExit} style={{ ...btnSm(C.text3), marginTop:14 }}>← Về trang chủ</button>
      </div>
    </div></div>
  );

  if (isAdmin === null) return <div style={wrap}><div style={inner}>Đang kiểm tra quyền…</div></div>;

  if (!isAdmin) return (
    <div style={wrap}><div style={{ ...inner, maxWidth:460 }}>
      <div style={{ ...S.box, marginTop:40 }}>
        <div style={{ fontWeight:900, fontSize:18, marginBottom:8 }}>Tài khoản chưa có quyền admin</div>
        <div style={{ fontSize:13, color:C.text3, marginBottom:16 }}>{session.user?.email} chưa nằm trong danh sách quản trị viên.</div>
        <button onClick={() => supabase.auth.signOut()} style={S.btn(C.bg3, C.text2)}>Đăng xuất</button>
      </div>
    </div></div>
  );

  return (
    <div style={wrap}><div style={inner}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:16 }}>
        <div>
          <div style={{ fontWeight:900, fontSize:20 }}>🛡️ Quản trị TìmĐồ.vn</div>
          <div style={{ fontSize:12, color:C.text3 }}>{session.user?.email}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={loadAll} style={btnSm(C.teal)}>↻ Tải lại</button>
          <button onClick={onExit} style={btnSm(C.text2)}>Trang chủ</button>
          <button onClick={() => supabase.auth.signOut()} style={btnSm(C.rose)}>Đăng xuất</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {[["items", `Đồ vật (${items.length})`], ["missing", `Người mất tích (${persons.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...btnSm(tab === k ? C.accent : C.text3), background: tab === k ? "rgba(39,174,96,0.15)" : "transparent" }}>{l}</button>
        ))}
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên, số giấy tờ, SĐT, địa điểm, nội dung…" style={{ ...S.input, marginBottom:12 }}/>
      {msg && <div style={{ ...card, borderColor:C.gold, color:C.gold, fontSize:13 }}>{msg}</div>}

      {tab === "items" && <>
        <div style={{ fontSize:12, color:C.text3, marginBottom:8 }}>Hiển thị {Math.min(shownItems.length, 200)}/{shownItems.length} tin. ⚠ = nghi trùng lặp hoặc spam. Xóa là vĩnh viễn.</div>
        {shownItems.slice(0, 200).map(row => {
          const dup = dupCount[dupKey(row)] > 1;
          const spam = phoneCount[digitsOnly(row.contact)] >= 5;
          const label = `${row.category} — ${row.title || ""}`;
          return (
            <div key={row.id} style={{ ...card, opacity: row.status === "resolved" ? 0.6 : 1 }}>
              <div style={{ marginBottom:6 }}>
                <span style={badge(row.type === "found" ? C.teal : C.rose)}>{row.type === "found" ? "ĐÃ NHẶT" : "ĐANG TÌM"}</span>
                <span style={badge(C.text3)}>{row.category}</span>
                {row.status === "resolved" && <span style={badge(C.accent)}>ĐÃ TRẢ</span>}
                {dup && <span style={badge(C.gold)}>⚠ Nghi trùng lặp</span>}
                {spam && <span style={badge(C.gold)}>⚠ SĐT đăng {phoneCount[digitsOnly(row.contact)]} tin</span>}
              </div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{row.title}</div>
              <div style={{ fontSize:12, color:C.text2, lineHeight:1.7 }}>
                {row.ho_ten && <div>👤 {row.ho_ten}{row.so_giay_to ? ` · ${row.so_giay_to}` : ""}{row.ngay_sinh ? ` · ${row.ngay_sinh}` : ""}</div>}
                <div>📍 {row.location} · 📞 {row.contact} · 📅 {row.date} {row.reward ? `· 🏆 ${row.reward}` : ""}</div>
                {row.note && <div>📝 {row.note}</div>}
                <div style={{ color:C.text3 }}>Đăng lúc {row.created_at ? new Date(row.created_at).toLocaleString("vi-VN") : "?"}</div>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <button onClick={() => toggleResolved(row)} style={btnSm(C.accent)}>{row.status === "resolved" ? "↩ Mở lại" : "✅ Đã trả"}</button>
                <button onClick={() => removeRow("items", row, label)} style={btnSm(C.rose)}>🗑 Xóa</button>
              </div>
            </div>
          );
        })}
      </>}

      {tab === "missing" && <>
        <div style={{ fontSize:12, color:C.text3, marginBottom:8 }}>Hiển thị {Math.min(shownPersons.length, 200)}/{shownPersons.length} tin. Xóa là vĩnh viễn.</div>
        {shownPersons.slice(0, 200).map(row => (
          <div key={row.id} style={card}>
            <div style={{ display:"flex", gap:12 }}>
              {row.photo_path && <img src={photoUrl(row.photo_path)} alt="" style={{ width:64, height:64, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>}
              <div style={{ minWidth:0 }}>
                <div style={{ marginBottom:6 }}>
                  <span style={badge(row.type === "found_person" ? C.teal : C.rose)}>{row.type === "missing" ? "ĐANG TÌM NGƯỜI" : row.type === "found_person" ? "ĐÃ GẶP NGƯỜI LẠC" : String(row.type || "").toUpperCase()}</span>
                  {row.urgency === "high" && row.type === "missing" && <span style={badge(C.gold)}>KHẨN</span>}
                  {row.status === "resolved" && <span style={badge(C.accent)}>ĐÃ TÌM THẤY</span>}
                </div>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{row.ho_ten} {row.tuoi ? `· ${row.tuoi}` : ""} {row.gioi_tinh ? `· ${row.gioi_tinh}` : ""}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:C.text2, lineHeight:1.7 }}>
              {row.danh_tich && <div>🔎 {row.danh_tich}</div>}
              {row.lan_cuoi_thay && <div>📍 {row.lan_cuoi_thay} {row.thoi_gian ? `· ${row.thoi_gian}` : ""}</div>}
              <div>📞 {row.contact} · 📅 {row.date}</div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
              {row.status !== "resolved" && <button onClick={() => markPersonFound(row)} style={btnSm(C.accent)}>✅ Đã tìm thấy</button>}
              <button onClick={() => removeRow("missing_persons", row, row.ho_ten || "")} style={btnSm(C.rose)}>🗑 Xóa</button>
            </div>
          </div>
        ))}
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

  const addItem = async item => {
    // Lưu tin + dò tin trùng khớp ngay trong database (hàm post_item trong Supabase)
    const { data, error } = await supabase.rpc("post_item", { p: {
      type:item.type, category:item.category, title:item.title,
      ho_ten:item.hoTen||"", so_giay_to:item.soGiayTo||"", ngay_sinh:item.ngaySinh||"",
      location:item.location, contact:item.contact, reward:item.reward||"",
      note:item.note||"", img:item.img, date:item.date } });
    if (error) { console.error("Lỗi lưu tin vào Supabase:", error); return { ok:false }; }
    setItems(prev=>[{ ...item, id: data?.id ?? item.id }, ...prev]);
    return { ok:true, matches: data?.matches || [] };
  };
  const addMissing = async m => {
    // Lưu tin + dò người khớp (khuôn mặt / họ tên) ngay trong database (hàm post_missing)
    const { data, error } = await supabase.rpc("post_missing", { p: {
      type:m.type, ho_ten:m.hoTen||"", tuoi:m.tuoi||"", gioi_tinh:m.gioiTinh||"", danh_tich:m.danhTich||"",
      trang_phuc:m.trangPhuc||"", lan_cuoi_thay:m.lanCuoiThay||"", thoi_gian:m.thoiGian||"",
      contact:m.contact, reward:m.reward||"", urgency:m.urgency||"medium", avatar:m.avatar||"👤", date:m.date,
      face:m.face||null, photo_path:m.photoPath||null, photo_public:!!m.photoPublic } });
    if (error) { console.error("Lỗi lưu tin vào Supabase:", error); return { ok:false, error:"Không lưu được tin: " + (error.message || "lỗi máy chủ") }; }
    const shown = { ...m, id: data?.id ?? m.id, img: photoUrl(m.photoPath) };
    delete shown.face; delete shown.photoPath; delete shown.photoPublic;   // không giữ vector khuôn mặt trong bộ nhớ trang
    setMissing(prev=>[shown, ...prev]);
    return { ok:true, matches: data?.matches || [] };
  };

  if (adminMode) return <AdminPanel onExit={() => { window.location.hash = ""; }} />;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.text }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        * { -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0D1F12} ::-webkit-scrollbar-thumb{background:#1E4D2B;border-radius:3px}
        input::placeholder { color: #9CA3AF !important; }
        input { color: #FFFFFF; }
      `}</style>

      {/* HEADER */}
      <header style={{ background:`${C.bg1}F8`, backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"0 22px", position:"sticky", top:0, zIndex:200 }}>
        <div style={{ maxWidth:1040, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:62 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔍</div>
            <div>
              <div style={{ fontWeight:900, fontSize:19, letterSpacing:-0.5, lineHeight:1 }}>TìmĐồ<span style={{ color:C.heroAccent }}>.vn</span></div>
              <div style={{ fontSize:9, color:C.text3, letterSpacing:1.5, textTransform:"uppercase" }}>Đồ vật · Người thân · AI</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:8, padding:"4px 10px", background:"rgba(255,255,255,0.08)", borderRadius:8, border:`1px solid ${C.border}` }}>
              <span style={{ fontSize:16 }}>🚔</span>
              <div style={{ fontSize:9, color:C.text3, lineHeight:1.3 }}>
                <div style={{ fontWeight:700, color:"#E0F2FE", fontSize:10 }}>CÔNG AN</div>
                <div>NHÂN DÂN</div>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={()=>setShowMap(true)} style={{ background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text3, fontSize:16, cursor:"pointer" }}>🗺️</button>
            <button onClick={()=>setShowNotif(v=>!v)} style={{ position:"relative", background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text3, cursor:"pointer", fontSize:18 }}>🔔</button>
            {mainTab==="missing" && <button onClick={()=>setFaceSearch(true)} style={{ background:`linear-gradient(135deg,${C.violet},${C.violetDark})`, border:"none", borderRadius:10, padding:"9px 14px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>🔎 Đối chiếu ảnh</button>}
            <button onClick={()=>{ mainTab==="items"?setPostItem(true):setPostMissing(true); }} style={{ background:`linear-gradient(135deg,${mainTab==="missing"?C.rose:C.accent},${mainTab==="missing"?C.roseDark:C.accentDark})`, border:"none", borderRadius:10, padding:"9px 16px", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>+ Đăng tin</button>
          </div>
        </div>
      </header>

      {/* MAIN TAB BAR */}
      <div style={{ background:C.bg1, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1040, margin:"0 auto", display:"flex" }}>
          {[["items","🪪","Đồ vật thất lạc"],["missing","👤","Tìm người thân"]].map(([v,icon,l])=>(
            <button key={v} onClick={()=>{setMainTab(v);setSearch("");}} style={{ padding:"14px 20px", border:"none", background:"transparent", color:mainTab===v?"#fff":C.text3, fontWeight:700, fontSize:14, cursor:"pointer", borderBottom:`2.5px solid ${mainTab===v?(v==="missing"?C.rose:C.accent):"transparent"}`, display:"flex", alignItems:"center", gap:6, position:"relative" }}>
              <span>{icon}</span><span>{l}</span>
              {v==="missing"&&urgentCount>0 && <span style={{ background:C.rose, color:"#fff", fontSize:10, fontWeight:800, width:18, height:18, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", animation:"blink 1.5s ease infinite" }}>{urgentCount}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div style={{ background:`linear-gradient(180deg,#0D2B1A 0%,${C.bg} 100%)`, padding:"40px 22px 28px", textAlign:"center", borderBottom:`1px solid #1E4D2B` }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          {mainTab==="missing" ? <>
            <div style={{ fontSize:11, color:C.rose, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Kết nối · Chia sẻ · Tìm thấy</div>
            <h1 style={{ fontSize:34, fontWeight:900, margin:"0 0 10px", lineHeight:1.1, letterSpacing:-1, color:C.heroTitle }}>Tìm người thân<br/><span style={{ color:C.rose }}>thất lạc</span></h1>
            <p style={{ color:C.statText, fontSize:14, margin:"0 0 20px", lineHeight:1.65 }}>Đăng tin hoặc <strong style={{ color:C.heroAccent }}>tải ảnh để AI đối chiếu</strong> với hồ sơ người mất tích</p>
          </> : <>
            <div style={{ fontSize:11, color:C.accent, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Cộng đồng hỗ trợ lẫn nhau</div>
            <h1 style={{ fontSize:34, fontWeight:900, margin:"0 0 10px", lineHeight:1.1, letterSpacing:-1, color:C.heroTitle }}>Mất đồ? Nhặt được?<br/><span style={{ color:C.heroAccent }}>Kết nối ngay!</span></h1>
            <p style={{ color:C.statText, fontSize:14, margin:"0 0 20px", lineHeight:1.65 }}>Tải ảnh giấy tờ — <strong style={{ color:C.heroAccent }}>AI tự nhận diện & điền thông tin</strong></p>
          </>}
          <div style={{ position:"relative", maxWidth:440, margin:"0 auto 20px" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={mainTab==="missing"?"Tìm theo tên, đặc điểm, địa điểm…":"Tìm theo tên, số CCCD, địa điểm…"} style={{ ...S.input, padding:"13px 14px 13px 42px", borderRadius:14, fontSize:15, border:`1.5px solid ${C.border}`, color:"#FFFFFF", background:"rgba(255,255,255,0.1)", "::placeholder":{color:"#9CA3AF"} }}/>
            {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:C.text3, cursor:"pointer", fontSize:18 }}>×</button>}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:32 }}>
            {(mainTab==="missing"
              ? [[C.rose,urgentCount,"Khẩn cấp"],[C.heroAccent,missing.filter(m=>m.type==="missing").length,"Đang tìm"],[C.teal,missing.filter(m=>m.type==="found_person").length,"Đã gặp"]]
              : [[C.heroAccent,items.filter(i=>i.type==="lost").length,"Đang tìm"],[C.teal,items.filter(i=>i.type==="found").length,"Chờ nhận"],[C.statText,"312","Đã trả lại"]]
            ).map(([color,n,l])=>(
              <div key={l}><div style={{ fontSize:26, fontWeight:900, color, lineHeight:1 }}>{n}</div><div style={{ fontSize:10, color:C.statText, letterSpacing:1, textTransform:"uppercase", marginTop:3 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* AI BANNER */}
      {mainTab==="missing" ? (
        <div style={{ background:`linear-gradient(90deg,${C.rose}12,${C.roseDark}05)`, borderBottom:`1px solid ${C.rose}20`, padding:"10px 22px", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <span style={{ fontSize:13, color:"#FF9AB9" }}>🔎 <strong>AI Đối Chiếu Ảnh</strong> — Tải ảnh người lạc, AI so sánh với toàn bộ hồ sơ</span>
          <button onClick={()=>setFaceSearch(true)} style={{ background:`${C.rose}25`, border:`1px solid ${C.rose}40`, borderRadius:8, padding:"5px 12px", color:C.rose, fontSize:12, fontWeight:700, cursor:"pointer" }}>Thử ngay →</button>
        </div>
      ) : (
        <div style={{ background:`linear-gradient(90deg,${C.violet}12,${C.violetDark}05)`, borderBottom:`1px solid ${C.violet}20`, padding:"10px 22px", textAlign:"center" }}>
          <span style={{ fontSize:13, color:"#9D99FF" }}>🤖 <strong>AI Vision</strong> — Chụp ảnh CCCD / Bằng lái / Hộ chiếu, AI tự đọc họ tên & số giấy tờ</span>
        </div>
      )}

      {/* FILTERS */}
      <div style={{ background:C.bg1, borderBottom:`1px solid ${C.border}`, padding:"10px 22px", overflowX:"auto" }}>
        <div style={{ maxWidth:1040, margin:"0 auto", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {mainTab==="items" ? <>
            <div style={{ display:"flex", gap:3, background:C.bg, borderRadius:10, padding:3 }}>
              {[["all","Tất cả"],["lost","🔴 Đang tìm"],["found","🟢 Đã nhặt"]].map(([v,l])=>(
                <button key={v} onClick={()=>setSubTab(v)} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:subTab===v?(v==="lost"?C.accent:v==="found"?C.teal:"#333"):"transparent", color:subTab===v?"#fff":C.text3, fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>{l}</button>
              ))}
            </div>
            <div style={{ width:1, height:24, background:C.border }}/>
            {["Tất cả",...ITEM_CAT].map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{ padding:"6px 12px", borderRadius:8, border:`1.5px solid ${cat===c?C.accent:C.border}`, background:cat===c?`${C.accent}12`:"transparent", color:cat===c?C.accent:C.text3, fontWeight:600, fontSize:11, cursor:"pointer", whiteSpace:"nowrap" }}>{c}</button>
            ))}
          </> : (
            <div style={{ display:"flex", gap:3, background:C.bg, borderRadius:10, padding:3 }}>
              {[["all","Tất cả"],["missing","🔴 Đang tìm"],["found_person","🟢 Đã gặp"]].map(([v,l])=>(
                <button key={v} onClick={()=>setMissingSubTab(v)} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:missingSubTab===v?(v==="missing"?C.rose:v==="found_person"?C.teal:"#333"):"transparent", color:missingSubTab===v?"#fff":C.text3, fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>{l}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* URGENT BANNER */}
      {mainTab==="missing" && urgentCount>0 && (
        <div style={{ background:`${C.rose}08`, borderBottom:`1px solid ${C.rose}18`, padding:"10px 22px" }}>
          <div style={{ maxWidth:1040, margin:"0 auto", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ animation:"blink 1s ease infinite", fontSize:18 }}>🚨</span>
            <span style={{ fontSize:13, color:C.rose, fontWeight:600 }}>{urgentCount} trường hợp khẩn cấp cần sự giúp đỡ ngay</span>
            <button onClick={()=>setFaceSearch(true)} style={{ marginLeft:"auto", background:`${C.rose}18`, border:`1px solid ${C.rose}35`, borderRadius:8, padding:"6px 13px", color:C.rose, fontSize:12, fontWeight:700, cursor:"pointer" }}>Tôi có thể giúp →</button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <main style={{ maxWidth:1040, margin:"0 auto", padding:"24px 22px 60px" }}>
        {mainTab==="items" ? <>
          <div style={{ marginBottom:14, color:"#3A3A3A", fontSize:12 }}>Tìm thấy <strong style={{ color:"#aaa" }}>{filteredItems.length}</strong> kết quả</div>
          {filteredItems.length===0 ? <Empty icon="🔍" text="Không tìm thấy kết quả phù hợp"/> :
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
              {filteredItems.map(item=><ItemCard key={item.id} item={item} onClick={()=>setDetailItem(item)}/>)}
            </div>}
        </> : <>
          <div style={{ marginBottom:14, color:"#3A3A3A", fontSize:12 }}><strong style={{ color:"#aaa" }}>{filteredMissing.length}</strong> hồ sơ</div>
          {filteredMissing.length===0 ? <Empty icon="👤" text="Không tìm thấy hồ sơ phù hợp"/> :
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
              {filteredMissing.map(p=><MissingCard key={p.id} person={p} onClick={()=>setDetailMissing(p)}/>)}
            </div>}
          <div style={{ marginTop:32, background:`linear-gradient(135deg,${C.rose}0A,${C.roseDark}05)`, border:`1px solid ${C.rose}22`, borderRadius:16, padding:"22px 26px", display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200 }}><div style={{ fontWeight:800, fontSize:16, marginBottom:5 }}>Bạn gặp người có vẻ bị lạc?</div><div style={{ fontSize:13, color:C.text3, lineHeight:1.5 }}>Chụp ảnh và để AI tự động đối chiếu với hồ sơ người đang tìm kiếm.</div></div>
            <button onClick={()=>setFaceSearch(true)} style={{ ...S.btn(`linear-gradient(135deg,${C.rose},${C.roseDark})`), width:"auto", padding:"13px 22px" }}>🔎 Đối chiếu ảnh ngay</button>
          </div>
        </>}
      </main>

      {/* FOOTER */}
      <footer style={{ background:C.bg1, borderTop:`1px solid ${C.border}`, padding:"24px 22px" }}>
        <div style={{ maxWidth:1040, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:20, marginBottom:20 }}>
            <div>
              <div style={{ fontWeight:900, fontSize:18, marginBottom:6 }}>TìmĐồ<span style={{ color:C.accent }}>.vn</span></div>
              <div style={{ fontSize:13, color:C.text3, maxWidth:280, lineHeight:1.6 }}>Nền tảng cộng đồng giúp tìm lại đồ vật thất lạc và kết nối người thân.</div>
            </div>
            <div style={{ display:"flex", gap:40, flexWrap:"wrap" }}>
              {[["Tính năng",["🔍 Tìm đồ vật","👤 Tìm người thân","🤖 AI Nhận diện","🔎 Đối chiếu ảnh"]],["Hỗ trợ",["📞 Hotline: 1800 9999","📧 help@timdovn.vn","💬 Chat hỗ trợ"]]].map(([title,links])=>(
                <div key={title}>
                  <div style={{ fontWeight:700, fontSize:12, color:C.text2, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>{title}</div>
                  {links.map(l=><div key={l} style={{ fontSize:13, color:C.text3, marginBottom:7, cursor:"pointer" }}>{l}</div>)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
            <div style={{ fontSize:12, color:"#333" }}>© 2026 TìmĐồ.vn · Bảo mật thông tin · Điều khoản sử dụng</div>
            <div style={{ display:"flex", gap:8 }}>
              {["🚨 Khẩn cấp 113","🏥 Cấp cứu 115","👮 Công an 114"].map(t=>(
                <div key={t} style={{ background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 10px", fontSize:11, color:C.text3 }}>{t}</div>
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
    </div>
  );
}
