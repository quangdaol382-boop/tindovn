import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://kvbtvjzkeukcjgqqdddu.supabase.co",
  "sb_publishable_t9L83Ag6Tbr3PK3_SNEIGw_uiKra69S"
);

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  accent: "#FF6B35", accentDark: "#FF3D00",
  teal: "#2EC4B6",   tealDark: "#1AA398",
  violet: "#7C6FFF", violetDark: "#4F46E5",
  rose: "#FF4F7B",   roseDark: "#C9184A",
  gold: "#FFD166",
  bg: "#0A0A0A", bg1: "#111111", bg2: "#161616", bg3: "#1C1C1C",
  border: "#222222", border2: "#2A2A2A",
  text: "#F0EDE8", text2: "#999999", text3: "#555555",
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
const isSensitive = item => SENSITIVE_CATS.includes(item.category);
const privateTitle = item => {
  if (!isSensitive(item)) return item.title;
  return `${item.category} — ${item.type==="found"?"Đã nhặt được":"Đang tìm"}`;
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

// ─── Google Gemini AI (qua Supabase Edge Function proxy) ─────────────────────
// Dùng proxy để tránh CORS và bảo mật API key
const GEMINI_PROXY = "https://kvbtvjzkeukcjgqqdddu.supabase.co/functions/v1/gemini-proxy";
const SUPABASE_ANON_KEY = "sb_publishable_t9L83Ag6Tbr3PK3_SNEIGw_uiKra69S";

async function callGemini(prompt, b64Image = null) {
  const parts = [];
  if (b64Image) parts.push({ inline_data: { mime_type: "image/jpeg", data: b64Image } });
  parts.push({ text: prompt });

  let res;
  // Thay thế bằng đoạn này:
const { data, error } = await supabase.functions.invoke("gemini-proxy", {
  body: { 
    contents: [{ role: "user", parts: parts }] 
  },
});

if (error) throw error;
res = data;
    });
  } catch (e) {
    throw new Error("Không kết nối được tới server AI: " + e.message);
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Server AI lỗi (${res.status}): ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = (data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim().replace(/```json[\s\S]*?```|```/g, "").trim();
  if (!raw) throw new Error("AI không trả về dữ liệu");
  return JSON.parse(raw);
}

function useImagePicker(onPicked) {
  const ref = useRef();
  const pick = () => ref.current.click();
  const handle = useCallback(file => {
    if (!file?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => onPicked(e.target.result, e.target.result.split(",")[1]);
    r.readAsDataURL(file);
  }, [onPicked]);
  const inputEl = <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handle(e.target.files[0])}/>;
  return { pick, inputEl, handleDrop: useCallback(e=>{e.preventDefault();handle(e.dataTransfer.files[0]);}, [handle]) };
}

// ─── AI Doc Scanner Modal ─────────────────────────────────────────────────────
function DocScanModal({ onClose, onFill }) {
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const b64 = useRef(null);
  const { pick, inputEl, handleDrop } = useImagePicker((src, b) => { setPreview(src); b64.current=b; setPhase("idle"); setErr(""); });

  const scan = async () => {
    setPhase("scanning"); setErr("");
    try {
      const r = await callGemini(
        `Bạn là hệ thống OCR nhận diện giấy tờ Việt Nam. Phân tích ảnh và trả về JSON THUẦN (không markdown, không giải thích thêm).
Schema bắt buộc: {"loaiGiayTo":"CMND/CCCD|Bằng lái xe|Hộ chiếu|Thẻ sinh viên|Thẻ BHYT|Khác","hoTen":"","soGiayTo":"","ngaySinh":"","gioiTinh":"","queQuan":"","diaChiThuongTru":"","ngayCap":"","noiCap":"","moTaThem":"","doTinCay":90}
Nếu ảnh không phải giấy tờ: {"loi":"Ảnh không phải giấy tờ hợp lệ"}
Không được bịa thông tin, chỉ điền những gì đọc được rõ ràng.`,
        b64.current
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

// ─── AI Face Matcher Modal ────────────────────────────────────────────────────
function FaceMatchModal({ onClose, missing }) {
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const b64 = useRef(null);
  const { pick, inputEl, handleDrop } = useImagePicker((src, b) => { setPreview(src); b64.current=b; setPhase("idle"); setErr(""); setResult(null); });

  const match = async () => {
    setPhase("scanning"); setErr("");
    const list = missing.map(m=>`- ID ${m.id}: ${m.hoTen}, ${m.tuoi}, ${m.gioiTinh}, trang phục: ${m.trangPhuc||"không rõ"}, đặc điểm: ${m.danhTich}`).join("\n");
    try {
      const r = await callGemini(
        `Bạn hỗ trợ tìm người mất tích. Phân tích ngoại hình người trong ảnh và đối chiếu với danh sách:\n${list}
Trả JSON THUẦN không markdown: {"moTa":{"gioiTinh":"","doTuoi":"","dacDiem":"","trangPhuc":""},"khopID":null,"mucDoKhop":0,"lyDoKhop":"","deXuat":""}
- khopID: ID số nguyên của người khớp nhất hoặc null nếu không khớp
- mucDoKhop: 0-100
- Nếu không phát hiện người: {"loi":"Không phát hiện người trong ảnh"}`,
        b64.current
      );
      if (r.loi) { setErr(r.loi); setPhase("error"); return; }
      setResult({ ...r, person: missing.find(m=>m.id===r.khopID)||null });
      setPhase("done");
    } catch(e) { setErr("Không thể phân tích: " + e.message); setPhase("error"); }
  };

  return (
    <Modal onClose={onClose} style={{ maxWidth:500 }}>
      {inputEl}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${C.rose},${C.roseDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🔎</div>
        <div><div style={{ fontWeight:800, fontSize:18 }}>AI Đối Chiếu Người Mất Tích</div><div style={{ fontSize:12, color:C.text3 }}>Tải ảnh → AI so sánh với {missing.length} hồ sơ</div></div>
      </div>
      <div style={{ background:`${C.rose}0A`, border:`1px solid ${C.rose}25`, borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#FF9AB9" }}>
        ⚠️ AI phân tích <strong>đặc điểm ngoại hình</strong> để gợi ý — không đảm bảo 100% chính xác. Luôn xác nhận qua liên hệ trực tiếp.
      </div>
      <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={pick}
        style={{ border:`2px dashed ${preview?C.rose:C.border2}`, borderRadius:14, padding:preview?"8px":"30px 20px", textAlign:"center", cursor:"pointer", background:preview?`${C.rose}05`:C.bg, marginBottom:12, minHeight:120, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {preview ? <img src={preview} alt="" style={{ maxHeight:200, maxWidth:"100%", borderRadius:10, objectFit:"contain" }}/>
          : <div><div style={{ fontSize:40, marginBottom:10 }}>👤</div><div style={{ fontWeight:700, fontSize:15 }}>Tải ảnh người cần đối chiếu</div><div style={{ fontSize:12, color:C.text3, marginTop:4 }}>Ảnh rõ mặt cho kết quả chính xác hơn</div></div>}
      </div>
      {preview && phase!=="scanning" && <button onClick={pick} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8, padding:"5px 12px", color:C.text3, fontSize:12, cursor:"pointer", marginBottom:12 }}>🔄 Đổi ảnh</button>}
      {err && <div style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"#FF7070", fontSize:13 }}>⚠️ {err}</div>}
      {phase==="scanning" && <div style={{ textAlign:"center", padding:"32px 0" }}>
        <div style={{ fontSize:44, marginBottom:12, display:"inline-block", animation:"spin 1.2s linear infinite" }}>🔄</div>
        <div style={{ fontWeight:700 }}>Đang đối chiếu {missing.length} hồ sơ…</div>
        <div style={{ color:C.text3, fontSize:13, marginTop:6, animation:"pulse 1.5s ease infinite" }}>Phân tích ngoại hình & so khớp</div>
      </div>}
      {phase==="done" && result && <>
        {preview && <img src={preview} alt="" style={{ width:"100%", maxHeight:120, objectFit:"cover", objectPosition:"top", borderRadius:10, marginBottom:14 }}/>}
        <div style={{ background:C.bg, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <SectionTitle icon="👁️" text="AI phát hiện trong ảnh"/>
          {[["Giới tính",result.moTa?.gioiTinh],["Độ tuổi",result.moTa?.doTuoi],["Đặc điểm",result.moTa?.dacDiem],["Trang phục",result.moTa?.trangPhuc]].map(([k,v])=><InfoRow key={k} label={k} value={v}/>)}
        </div>
        {result.person && result.mucDoKhop>=40 ? (
          <div style={{ background:`linear-gradient(135deg,${C.rose}15,${C.roseDark}08)`, border:`1.5px solid ${C.rose}40`, borderRadius:14, padding:18, marginBottom:14 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:32 }}>{result.person.avatar}</span>
              <div>
                <div style={{ color:C.gold, fontWeight:800, fontSize:14 }}>⚡ Có thể khớp!</div>
                <div style={{ fontSize:12, color:C.text3 }}>Độ tương đồng: <strong style={{ color:C.rose, fontSize:15 }}>{result.mucDoKhop}%</strong></div>
              </div>
            </div>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:4 }}>{result.person.hoTen}</div>
            <div style={{ fontSize:13, color:C.text3, marginBottom:4 }}>{result.person.tuoi} · {result.person.gioiTinh}</div>
            <div style={{ fontSize:12, color:"#666", marginBottom:8 }}>📍 {result.person.lanCuoiThay}</div>
            {result.lyDoKhop && <div style={{ fontSize:12, color:C.text2, background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 10px", marginBottom:14 }}>💬 {result.lyDoKhop}</div>}
            <a href={`tel:${result.person.contact}`} style={{ display:"block", background:`linear-gradient(135deg,${C.rose},${C.roseDark})`, borderRadius:10, padding:"13px", color:"#fff", fontWeight:800, textDecoration:"none", textAlign:"center", fontSize:15 }}>
              📞 Gọi ngay cho gia đình: {result.person.contact}
            </a>
            {result.person.reward && <div style={{ textAlign:"center", marginTop:8, fontSize:12, color:C.gold }}>🏆 Tiền thưởng: {result.person.reward}</div>}
          </div>
        ) : (
          <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 16px", marginBottom:14, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Chưa khớp với hồ sơ nào</div>
            <div style={{ fontSize:13, color:C.text3 }}>Bạn vẫn nên đăng tin báo để gia đình nhận ra</div>
          </div>
        )}
        {result.deXuat && <div style={{ fontSize:13, color:C.text2, background:`${C.violet}10`, border:`1px solid ${C.violet}20`, borderRadius:10, padding:"10px 13px", marginBottom:14 }}>💡 {result.deXuat}</div>}
        <button onClick={()=>{setPhase("idle");setPreview(null);setResult(null);b64.current=null;}} style={{ ...S.btn("#222","#aaa"), width:"auto", padding:"9px 18px", fontSize:13 }}>← Đối chiếu ảnh khác</button>
      </>}
      {(phase==="idle"||phase==="error") && preview && <button onClick={match} style={S.btn(`linear-gradient(135deg,${C.rose},${C.roseDark})`)}>🔎 Đối chiếu ngay</button>}
      {!preview && <button disabled style={S.btn("#1C1C1C","#444")}>🔎 Chọn ảnh trước</button>}
    </Modal>
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
  const set = k => v => setForm(f=>({...f,[k]:v}));
  const isDoc = ["CMND/CCCD","Bằng lái xe","Hộ chiếu"].includes(form.category);
  const onFill = (r, prev) => {
    setDocPrev(prev);
    setForm(f=>({ ...f, category:r.loaiGiayTo||f.category, hoTen:r.hoTen||f.hoTen, soGiayTo:r.soGiayTo||f.soGiayTo, ngaySinh:r.ngaySinh||f.ngaySinh, gioiTinh:r.gioiTinh||f.gioiTinh, queQuan:r.queQuan||f.queQuan, diaChiThuongTru:r.diaChiThuongTru||f.diaChiThuongTru, title:r.hoTen?`${r.loaiGiayTo||"Giấy tờ"} mang tên ${r.hoTen}`:f.title, note:r.moTaThem||f.note }));
  };
  const submit = () => {
    if (!form.title || !form.location || !form.contact) return;
    onAdd({ id:uid(), type:ptype, ...form, img:catIcon(form.category), date:fmtDate() });
    setDone(true); setTimeout(onClose, 1800);
  };
  return (<>
    <Modal onClose={onClose} style={{ maxHeight:"92vh", overflowY:"auto" }}>
      {done ? <div style={{ textAlign:"center", padding:"50px 0" }}><div style={{ fontSize:60, marginBottom:16 }}>🎉</div><div style={{ fontWeight:900, fontSize:22, marginBottom:8 }}>Đăng tin thành công!</div></div> : <>
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
        <button onClick={submit} style={S.btn(`linear-gradient(135deg,${ptype==="found"?C.teal:C.accent},${ptype==="found"?C.tealDark:C.accentDark})`)}>Đăng tin ngay →</button>
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
  const [scanning, setScanning] = useState(false);
  const set = k => v => setForm(f=>({...f,[k]:v}));
  const { pick, inputEl } = useImagePicker(async (src, b64) => {
    setImgPrev(src); setScanning(true);
    try {
     try {
    const rawResult = await callGemini(`Mô tả người trong ảnh. Chỉ trả về JSON duy nhất với cấu trúc: {"doTuoi": "...", "gioiTinh": "...", "danhTich": "..."}`);
    
    // Thêm bước kiểm tra để đảm bảo r là đối tượng JSON
    let r;
    try {
        r = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult;
    } catch (e) {
        console.error("Lỗi parse JSON:", e);
        r = {}; // Gán rỗng nếu không parse được
    }

    console.log("--- BẮT ĐẦU NHẬN DỮ LIỆU TỪ AI ---");
    setForm(f => ({ 
        ...f, 
        tuoi: r.doTuoi || f.tuoi, 
        gioiTinh: r.gioiTinh || f.gioiTinh, 
        danhTich: r.danhTich || f.danhTich 
    }));
} catch (e) {
    console.error("Lỗi gọi Gemini:", e);
}
    } catch {}
    setScanning(false);
  });
  const submit = () => {
    if (!form.hoTen || !form.lanCuoiThay || !form.contact) return;
    const avatars = { "Nam":ptype==="missing"?"🧑":"👦", "Nữ":ptype==="missing"?"👩":"👧" };
    onAdd({ id:uid(), type:ptype, ...form, avatar:avatars[form.gioiTinh]||"👤", date:fmtDate(), img:imgPrev });
    setDone(true); setTimeout(onClose, 1800);
  };
  return (
    <Modal onClose={onClose} style={{ maxHeight:"92vh", overflowY:"auto" }}>
      {inputEl}
      {done ? <div style={{ textAlign:"center", padding:"50px 0" }}><div style={{ fontSize:60, marginBottom:16 }}>🙏</div><div style={{ fontWeight:900, fontSize:22, marginBottom:8 }}>Tin đã được đăng!</div></div> : <>
        <div style={{ fontWeight:900, fontSize:20, marginBottom:20 }}>👤 Đăng tin tìm người thân</div>
        <div style={{ display:"flex", gap:4, background:C.bg, borderRadius:12, padding:4, marginBottom:20 }}>
          {[["missing","🔴 Tôi đang tìm"],["found_person","🟢 Tôi gặp người lạc"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPtype(v)} style={{ flex:1, padding:"10px 8px", borderRadius:9, border:"none", background:ptype===v?(v==="missing"?C.rose:C.teal):"transparent", color:ptype===v?"#fff":C.text3, fontWeight:700, fontSize:13, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ marginBottom:18 }}>
          <label style={{ display:"block", fontSize:11, color:C.text3, marginBottom:8, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>
            Ảnh người cần tìm {scanning && <span style={{ color:C.violet, fontWeight:400, textTransform:"none" }}>· AI đang mô tả…</span>}
          </label>
          <div onClick={pick} style={{ border:`2px dashed ${imgPrev?C.rose:C.border2}`, borderRadius:12, padding:imgPrev?"8px":"22px", textAlign:"center", cursor:"pointer", background:imgPrev?`${C.rose}04`:C.bg, minHeight:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {imgPrev ? <div style={{ position:"relative", width:"100%" }}><img src={imgPrev} alt="" style={{ maxHeight:140, maxWidth:"100%", borderRadius:8, objectFit:"contain" }}/>{scanning && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.55)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#fff" }}>🤖 AI đang mô tả…</div>}</div>
            : <div><div style={{ fontSize:34, marginBottom:8 }}>🖼️</div><div style={{ fontWeight:700, fontSize:14 }}>Tải ảnh người thân</div><div style={{ fontSize:12, color:C.text3, marginTop:4 }}>AI sẽ tự điền đặc điểm ngoại hình</div></div>}
          </div>
        </div>
        <Field label="Họ và tên" value={form.hoTen} onChange={set("hoTen")} placeholder={ptype==="missing"?"Nguyễn Thị Lan":"Không rõ tên"} required/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
          <Field label="Tuổi / Năm sinh" value={form.tuoi} onChange={set("tuoi")} placeholder="72 tuổi / 1952"/>
          <Select label="Giới tính" value={form.gioiTinh} onChange={set("gioiTinh")} options={["Nam","Nữ","Không rõ"]}/>
        </div>
        <Field label="Đặc điểm nhận dạng" value={form.danhTich} onChange={set("danhTich")} placeholder="Tóc bạc, chiều cao ~1m55, hay mặc áo bà ba…" multiline required hint="Mô tả càng chi tiết càng dễ nhận ra"/>
        <Field label="Trang phục khi mất tích" value={form.trangPhuc} onChange={set("trangPhuc")} placeholder="Áo bà ba xanh, quần đen, dép tổ ong"/>
        <Field label="Địa điểm lần cuối thấy" value={form.lanCuoiThay} onChange={set("lanCuoiThay")} placeholder="Chợ Bến Thành, Quận 1, TP.HCM" required/>
        <Field label="Thời gian" value={form.thoiGian} onChange={set("thoiGian")} placeholder="14:00 ngày 16/05/2026"/>
        {ptype==="missing" && <>
          <Field label="Thông tin sức khỏe / lưu ý" value={form.tieuChuan} onChange={set("tieuChuan")} placeholder="Bệnh nền, thuốc đang dùng…" multiline/>
          <Select label="Mức độ khẩn cấp" value={form.urgency} onChange={set("urgency")} options={[["high","🚨 Khẩn cấp"],["medium","⚠️ Bình thường"]]}/>
        </>}
        <Field label="Số điện thoại liên hệ" value={form.contact} onChange={set("contact")} placeholder="0901 234 567" type="tel" required/>
        {ptype==="missing" && <Field label="Tiền thưởng (nếu có)" value={form.reward} onChange={set("reward")} placeholder="VD: 2.000.000đ"/>}
        <button onClick={submit} style={S.btn(`linear-gradient(135deg,${ptype==="missing"?C.rose:C.teal},${ptype==="missing"?C.roseDark:C.tealDark})`)}>🙏 Đăng tin ngay</button>
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
      {sensitive && <div style={{ background:"rgba(124,111,255,0.08)", border:`1.5px solid ${C.violet}30`, borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
          <span style={{ fontSize:22, flexShrink:0 }}>🔒</span>
          <div>
            <div style={{ fontWeight:800, fontSize:14, marginBottom:4, color:C.violet }}>Thông tin được bảo mật</div>
            <div style={{ fontSize:13, color:C.text3, lineHeight:1.6 }}>Họ tên và số giấy tờ chỉ được cung cấp khi bạn liên hệ trực tiếp qua số điện thoại bên dưới.</div>
          </div>
        </div>
        <div style={{ marginTop:12, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 12px" }}>
          <div style={{ fontSize:12, color:"#666", fontWeight:700, marginBottom:6 }}>💡 Khi liên hệ hãy:</div>
          <div style={{ fontSize:12, color:C.text3, lineHeight:1.8 }}>1. Mô tả đặc điểm giấy tờ bạn tìm / nhặt được<br/>2. Cho biết địa điểm bạn mất / nhặt<br/>3. Người có giấy tờ sẽ xác nhận thông tin</div>
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
      {!sensitive && (item.hoTen||item.soGiayTo) && <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <SectionTitle icon="📋" text="Thông tin trên giấy tờ"/>
        <InfoRow label="Họ và tên" value={item.hoTen}/>
        <InfoRow label="Số giấy tờ" value={item.soGiayTo}/>
        <InfoRow label="Ngày sinh" value={item.ngaySinh}/>
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
      {!sensitive && item.hoTen && <div style={{ fontSize:11, color:C.violet, fontWeight:600, marginBottom:6 }}>👤 {item.hoTen} {item.soGiayTo && <span style={{ color:"#444" }}>· {item.soGiayTo}</span>}</div>}
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
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [notifCount] = useState(2);

  // Load dữ liệu từ Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { data: d1 } = await supabase.from("items").select("*").order("created_at", { ascending: false });
        const { data: d2 } = await supabase.from("missing_persons").select("*").order("created_at", { ascending: false });
        if (d1?.length > 0) setItems(d1.map(i => ({ ...i, hoTen:i.ho_ten, soGiayTo:i.so_giay_to, ngaySinh:i.ngay_sinh })));
        if (d2?.length > 0) setMissing(d2.map(m => ({ ...m, hoTen:m.ho_ten, gioiTinh:m.gioi_tinh, danhTich:m.danh_tich, trangPhuc:m.trang_phuc, lanCuoiThay:m.lan_cuoi_thay, thoiGian:m.thoi_gian })));
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
    try { await supabase.from("items").insert([{ type:item.type, category:item.category, title:item.title, ho_ten:item.hoTen||"", so_giay_to:item.soGiayTo||"", ngay_sinh:item.ngaySinh||"", location:item.location, contact:item.contact, reward:item.reward||"", note:item.note||"", img:item.img, date:item.date }]); } catch {}
    setItems(prev=>[item,...prev]);
  };
  const addMissing = async m => {
    try { await supabase.from("missing_persons").insert([{ type:m.type, ho_ten:m.hoTen||"", tuoi:m.tuoi||"", gioi_tinh:m.gioiTinh||"", danh_tich:m.danhTich||"", trang_phuc:m.trangPhuc||"", lan_cuoi_thay:m.lanCuoiThay||"", thoi_gian:m.thoiGian||"", contact:m.contact, reward:m.reward||"", urgency:m.urgency||"medium", avatar:m.avatar||"👤", date:m.date }]); } catch {}
    setMissing(prev=>[m,...prev]);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.text }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        * { -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#2A2A2A;border-radius:3px}
      `}</style>

      {/* HEADER */}
      <header style={{ background:`${C.bg1}F8`, backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"0 22px", position:"sticky", top:0, zIndex:200 }}>
        <div style={{ maxWidth:1040, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:62 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔍</div>
            <div>
              <div style={{ fontWeight:900, fontSize:19, letterSpacing:-0.5, lineHeight:1 }}>TìmĐồ<span style={{ color:C.accent }}>.vn</span></div>
              <div style={{ fontSize:9, color:C.text3, letterSpacing:1.5, textTransform:"uppercase" }}>Đồ vật · Người thân · AI</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={()=>setShowMap(true)} style={{ background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text3, fontSize:16, cursor:"pointer" }}>🗺️</button>
            {user && <button onClick={()=>setShowNotif(v=>!v)} style={{ position:"relative", background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text3, cursor:"pointer", fontSize:18 }}>
              🔔{notifCount>0 && <span style={{ position:"absolute", top:4, right:4, background:C.rose, color:"#fff", fontSize:9, fontWeight:800, width:15, height:15, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", animation:"blink 2s ease infinite" }}>{notifCount}</span>}
            </button>}
            {mainTab==="missing" && <button onClick={()=>setFaceSearch(true)} style={{ background:`linear-gradient(135deg,${C.violet},${C.violetDark})`, border:"none", borderRadius:10, padding:"9px 14px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>🔎 Đối chiếu ảnh</button>}
            <button onClick={()=>{ if(!user){setShowLogin(true);return;} mainTab==="items"?setPostItem(true):setPostMissing(true); }} style={{ background:`linear-gradient(135deg,${mainTab==="missing"?C.rose:C.accent},${mainTab==="missing"?C.roseDark:C.accentDark})`, border:"none", borderRadius:10, padding:"9px 16px", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>+ Đăng tin</button>
            {user ? <div onClick={()=>setUser(null)} title="Đăng xuất" style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${C.violet},${C.violetDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:"pointer" }}>👤</div>
            : <button onClick={()=>setShowLogin(true)} style={{ background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 14px", color:C.text2, fontWeight:700, fontSize:13, cursor:"pointer" }}>Đăng nhập</button>}
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
      <div style={{ background:`linear-gradient(180deg,#181818 0%,${C.bg} 100%)`, padding:"40px 22px 28px", textAlign:"center", borderBottom:`1px solid #161616` }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          {mainTab==="missing" ? <>
            <div style={{ fontSize:11, color:C.rose, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Kết nối · Chia sẻ · Tìm thấy</div>
            <h1 style={{ fontSize:34, fontWeight:900, margin:"0 0 10px", lineHeight:1.1, letterSpacing:-1 }}>Tìm người thân<br/><span style={{ color:C.rose }}>thất lạc</span></h1>
            <p style={{ color:C.text3, fontSize:14, margin:"0 0 20px", lineHeight:1.65 }}>Đăng tin hoặc <strong style={{ color:C.violet }}>tải ảnh để AI đối chiếu</strong> với hồ sơ người mất tích</p>
          </> : <>
            <div style={{ fontSize:11, color:C.accent, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Cộng đồng hỗ trợ lẫn nhau</div>
            <h1 style={{ fontSize:34, fontWeight:900, margin:"0 0 10px", lineHeight:1.1, letterSpacing:-1 }}>Mất đồ? Nhặt được?<br/><span style={{ color:C.accent }}>Kết nối ngay!</span></h1>
            <p style={{ color:C.text3, fontSize:14, margin:"0 0 20px", lineHeight:1.65 }}>Tải ảnh giấy tờ — <strong style={{ color:C.violet }}>AI tự nhận diện & điền thông tin</strong></p>
          </>}
          <div style={{ position:"relative", maxWidth:440, margin:"0 auto 20px" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={mainTab==="missing"?"Tìm theo tên, đặc điểm, địa điểm…":"Tìm theo tên, số CCCD, địa điểm…"} style={{ ...S.input, padding:"13px 14px 13px 42px", borderRadius:14, fontSize:15, border:`1.5px solid ${C.border}` }}/>
            {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:C.text3, cursor:"pointer", fontSize:18 }}>×</button>}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:32 }}>
            {(mainTab==="missing"
              ? [[C.rose,urgentCount,"Khẩn cấp"],[C.accent,missing.filter(m=>m.type==="missing").length,"Đang tìm"],[C.teal,missing.filter(m=>m.type==="found_person").length,"Đã gặp"]]
              : [[C.accent,items.filter(i=>i.type==="lost").length,"Đang tìm"],[C.teal,items.filter(i=>i.type==="found").length,"Chờ nhận"],["#888","312","Đã trả lại"]]
            ).map(([color,n,l])=>(
              <div key={l}><div style={{ fontSize:26, fontWeight:900, color, lineHeight:1 }}>{n}</div><div style={{ fontSize:10, color:C.text3, letterSpacing:1, textTransform:"uppercase", marginTop:3 }}>{l}</div></div>
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
      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onLogin={u=>{setUser(u);setShowLogin(false);}}/>}
      {showNotif && <NotifPanel onClose={()=>setShowNotif(false)} user={user}/>}
      {showMap && <MapModal onClose={()=>setShowMap(false)}/>}
    </div>
  );
}
