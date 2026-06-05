import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// 250025002500 Supabase 25002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500
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
  { id:1,  type:"lost",  category:"CMND/CCCD",    title:"CCCD mang tên Nguyễn Văn An",        hoTen:"Nguyễn Văn An",  soGiayTo:"079201012345",  ngaySinh:"15/03/1985", location:"Quận 1, TP.HCM",       date:"17/05/2026", reward:"500.000đ",   contact:"0901 234 567", img:"🪪", note:"Đánh mất gần khu vực Bến Thành" },
  { id:2,  type:"found", category:"Bằng lái xe",   title:"Bằng lái xe B2 – Trần Thị Mai",      hoTen:"Trần Thị Mai",   soGiayTo:"B2-2204-001234",ngaySinh:"20/07/1990", location:"Hoàn Kiếm, Hà Nội",    date:"18/05/2026", reward:null,         contact:"0912 345 678", img:"🪪", note:"Nhặt được trên vỉa hè đường Đinh Tiên Hoàng" },
  { id:3,  type:"lost",  category:"Ví/Túi xách",   title:"Ví da đen, có thẻ ATM Vietcombank",  hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Đống Đa, Hà Nội",      date:"19/05/2026", reward:"200.000đ",   contact:"0933 456 789", img:"👛", note:"Ví màu đen, bên trong có khoảng 500k và 3 thẻ ngân hàng" },
  { id:4,  type:"found", category:"Chìa khóa",     title:"Chùm chìa khóa Honda, móc đỏ",       hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Bình Thạnh, TP.HCM",   date:"19/05/2026", reward:null,         contact:"0944 567 890", img:"🔑", note:"Chùm chìa khóa 3 chiếc, có móc khóa hình trái tim đỏ" },
  { id:5,  type:"lost",  category:"CMND/CCCD",    title:"CCCD mang tên Lê Hoàng Nam",          hoTen:"Lê Hoàng Nam",   soGiayTo:"001198045678",  ngaySinh:"02/11/1998", location:"Cầu Giấy, Hà Nội",     date:"16/05/2026", reward:"1.000.000đ", contact:"0955 678 901", img:"🪪", note:"Rất cần gấp để làm thủ tục" },
  { id:6,  type:"found", category:"CMND/CCCD",    title:"CCCD mang tên Trần Thị Hoa",          hoTen:"Trần Thị Hoa",   soGiayTo:"038198123456",  ngaySinh:"08/04/1972", location:"Quận 3, TP.HCM",       date:"15/05/2026", reward:null,         contact:"0966 789 012", img:"🪪", note:"Nhặt được tại siêu thị Coopmart" },
  { id:7,  type:"lost",  category:"Điện thoại",   title:"iPhone 15 Pro xanh titan",            hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Tân Bình, TP.HCM",     date:"18/05/2026", reward:"2.000.000đ", contact:"0977 888 999", img:"📱", note:"Ốp lưng trong suốt, có sticker mèo góc dưới" },
  { id:8,  type:"found", category:"Hộ chiếu",     title:"Hộ chiếu mang tên Pham Van Duc",      hoTen:"Pham Van Duc",   soGiayTo:"B1234567",      ngaySinh:"12/06/1988", location:"Sân bay Nội Bài, HN",  date:"19/05/2026", reward:null,         contact:"0988 111 222", img:"📘", note:"Tìm thấy tại khu vực check-in" },
  { id:9,  type:"lost",  category:"Ví/Túi xách",  title:"Túi xách da nâu hiệu Coach",          hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Quận 7, TP.HCM",       date:"15/05/2026", reward:"500.000đ",   contact:"0909 222 333", img:"👜", note:"Túi màu nâu, bên trong có ví, chìa khóa xe và hộp son" },
  { id:10, type:"found", category:"Chìa khóa",    title:"Chìa khóa xe Lead, 2 chiếc",          hoTen:"",               soGiayTo:"",              ngaySinh:"",           location:"Quận Thanh Xuân, HN",  date:"17/05/2026", reward:null,         contact:"0922 444 555", img:"🔑", note:"Nhặt tại bãi giữ xe chung cư" },
];

const INIT_MISSING = [
  { id:101, type:"missing",      hoTen:"Bà Nguyễn Thị Lan",         tuoi:"72 tuổi", gioiTinh:"Nữ",  danhTich:"Người cao tuổi, tóc bạc, chiều cao khoảng 1m55, hay mặc áo bà ba xanh và quần đen", trangPhuc:"Áo bà ba xanh nhạt, quần đen, dép tổ ong", lanCuoiThay:"Chợ Bến Thành, Quận 1, TP.HCM", thoiGian:"14:00 ngày 16/05/2026", date:"16/05/2026", contact:"0977 111 222", reward:"2.000.000đ", tieuChuan:"Có biểu hiện lú lẫn, không nhớ địa chỉ nhà. Người thân rất lo lắng.", avatar:"👵", urgency:"high", img:null },
  { id:102, type:"missing",      hoTen:"Em Phạm Quốc Bảo",          tuoi:"8 tuổi",  gioiTinh:"Nam", danhTich:"Trẻ em, tóc đen ngắn, mặc áo thun đỏ có chữ Doraemon, quần short xanh, dép sandal trắng", trangPhuc:"Áo thun đỏ Doraemon, quần short xanh navy", lanCuoiThay:"Công viên 23/9, Quận 1, TP.HCM", thoiGian:"10:30 ngày 17/05/2026", date:"17/05/2026", contact:"0988 333 444", reward:"5.000.000đ", tieuChuan:"Đi cùng bà nội từ sáng, bị thất lạc khoảng 10:30. Bé tên Bảo, học lớp 2.", avatar:"👦", urgency:"high", img:null },
  { id:103, type:"missing",      hoTen:"Ông Trần Minh Đức",          tuoi:"68 tuổi", gioiTinh:"Nam", danhTich:"Người cao tuổi, đeo kính cận gọng đen, tóc muối tiêu, mặc áo sơ mi kẻ xanh trắng, quần tây xám", trangPhuc:"Áo sơ mi kẻ xanh trắng, quần tây xám", lanCuoiThay:"Bệnh viện Chợ Rẫy, TP.HCM", thoiGian:"08:00 ngày 14/05/2026", date:"14/05/2026", contact:"0909 555 666", reward:"1.000.000đ", tieuChuan:"Rời khỏi bệnh viện một mình sau khi điều trị. Có tiền sử bệnh tim.", avatar:"👴", urgency:"medium", img:null },
  { id:104, type:"found_person", hoTen:"Người phụ nữ chưa rõ tên",  tuoi:"~60 tuổi",gioiTinh:"Nữ",  danhTich:"Không nhớ được tên và địa chỉ nhà, mặc áo bà ba hoa, có vẻ mệt mỏi và lạc đường", trangPhuc:"Áo bà ba hoa, quần lụa xanh", lanCuoiThay:"Trước cổng Chợ Tân Bình, TP.HCM", thoiGian:"09:00 ngày 19/05/2026", date:"19/05/2026", contact:"0911 777 888", reward:null, tieuChuan:"Người phụ nữ đang ngồi trước cổng chợ, có vẻ lạc đường và không liên lạc được người thân. Đang được trông nom tạm.", avatar:"👩", urgency:"medium", img:null },
  { id:105, type:"missing",      hoTen:"Cháu Lê Thị Ngọc Anh",      tuoi:"6 tuổi",  gioiTinh:"Nữ",  danhTich:"Bé gái tóc dài buộc 2 bên, mặc váy hồng có nơ, mang ba lô màu tím hình thỏ", trangPhuc:"Váy hồng có nơ, ba lô tím hình thỏ, giày trắng", lanCuoiThay:"Siêu thị Vincom Mega Mall, TP.Thủ Đức", thoiGian:"15:30 ngày 18/05/2026", date:"18/05/2026", contact:"0933 999 000", reward:"3.000.000đ", tieuChuan:"Đi mua sắm cùng mẹ, bị thất lạc tại tầng 3 khu vực đồ chơi.", avatar:"👧", urgency:"high", img:null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = () => new Date().toLocaleDateString("vi-VN");
const uid = () => Date.now() + Math.random();
const ITEM_CAT = ["CMND/CCCD","Bằng lái xe","Hộ chiếu","Ví/Túi xách","Chìa khóa","Điện thoại","Khác"];
const catIcon = c => ({ "CMND/CCCD":"🪪","Bằng lái xe":"🪪","Hộ chiếu":"📘","Ví/Túi xách":"👛","Chìa khóa":"🔑","Điện thoại":"📱","Khác":"📦" }[c]||"📦");

// ─── Privacy helpers ──────────────────────────────────────────────────────────
// Các loại giấy tờ cần bảo mật thông tin cá nhân
const SENSITIVE_CATS = ["CMND/CCCD","Bằng lái xe","Hộ chiếu"];
const isSensitive = item => SENSITIVE_CATS.includes(item.category);

// Tạo tiêu đề ẩn danh cho giấy tờ (không lộ họ tên)
const privateTitle = item => {
  if (!isSensitive(item)) return item.title;
  return `${item.category} — ${item.type==="found"?"Đã nhặt được":"Đang tìm"}`;
};

// ─── Primitives ───────────────────────────────────────────────────────────────
const S = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:400, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"20px 16px", overflowY:"auto" },
  box: { background:C.bg2, border:`1.5px solid ${C.border}`, borderRadius:20, padding:28, width:"100%", position:"relative", marginTop:"auto", marginBottom:"auto" },
  btn: (bg,color="#fff") => ({ background:bg, border:"none", borderRadius:12, padding:"13px 18px", color, fontWeight:800, fontSize:15, cursor:"pointer", width:"100%", transition:"opacity 0.2s" }),
  input: { width:"100%", boxSizing:"border-box", padding:"11px 13px", background:C.bg3, border:`1.5px solid ${C.border2}`, borderRadius:10, color:C.text, fontSize:14, outline:"none", fontFamily:"inherit" },
};

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

// ─── AI helpers ───────────────────────────────────────────────────────────────
async function callClaude(system, userContent) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages:[{ role:"user", content:userContent }] })
  });
  const data = await res.json();
  const raw = (data.content||[]).map(c=>c.text||"").join("").trim().replace(/```json[\s\S]*?```|```/g,"").trim();
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

// ─── AI Doc Scanner ───────────────────────────────────────────────────────────
function DocScanModal({ onClose, onFill }) {
  const [phase, setPhase] = useState("idle"); // idle | scanning | done | error
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const b64 = useRef(null);

  const { pick, inputEl, handleDrop } = useImagePicker((src, b) => { setPreview(src); b64.current=b; setPhase("idle"); setErr(""); });

  const scan = async () => {
    setPhase("scanning"); setErr("");
    try {
      const r = await callClaude(
        `Bạn là OCR nhận diện giấy tờ Việt Nam. Trả JSON thuần (không markdown, không giải thích).
Schema: {"loaiGiayTo":"CMND/CCCD|Bằng lái xe|Hộ chiếu|Thẻ sinh viên|Thẻ BHYT|Khác","hoTen":"","soGiayTo":"","ngaySinh":"","gioiTinh":"","queQuan":"","diaChiThuongTru":"","ngayCap":"","noiCap":"","moTaThem":"","doTinCay":0}
Nếu ảnh không phải giấy tờ: {"loi":"Ảnh không phải giấy tờ"}`,
        [{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data:b64.current }}, { type:"text", text:"Nhận diện giấy tờ." }]
      );
      if (r.loi) { setErr(r.loi); setPhase("error"); return; }
      setResult(r); setPhase("done");
    } catch { setErr("Không thể phân tích ảnh. Thử ảnh khác."); setPhase("error"); }
  };

  return (
    <Modal onClose={onClose} style={{ maxWidth:480 }}>
      {inputEl}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${C.violet},${C.violetDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
        <div><div style={{ fontWeight:800, fontSize:18 }}>AI Đọc Giấy Tờ</div><div style={{ fontSize:12, color:C.text3 }}>Tải ảnh → AI trích xuất thông tin tự động</div></div>
      </div>

      {/* Drop zone */}
      <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={pick}
        style={{ border:`2px dashed ${preview?C.violet:C.border2}`, borderRadius:14, padding:preview?"8px":"30px 20px", textAlign:"center", cursor:"pointer", background:preview?`${C.violet}08`:C.bg, marginBottom:14, transition:"all 0.2s", minHeight:120, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {preview ? <img src={preview} alt="" style={{ maxHeight:200, maxWidth:"100%", borderRadius:10, objectFit:"contain" }}/>
          : <div><div style={{ fontSize:40, marginBottom:10 }}>📷</div><div style={{ fontWeight:700, fontSize:15 }}>Kéo thả hoặc bấm chọn ảnh</div><div style={{ fontSize:12, color:C.text3, marginTop:4 }}>CCCD · Bằng lái · Hộ chiếu · Thẻ BHYT…</div></div>}
      </div>

      {preview && phase!=="scanning" && <button onClick={pick} style={{ background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8, padding:"5px 12px", color:C.text3, fontSize:12, cursor:"pointer", marginBottom:12 }}>🔄 Đổi ảnh khác</button>}

      {err && <div style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"#FF7070", fontSize:13 }}>⚠️ {err}</div>}

      {phase==="scanning" && (
        <div style={{ textAlign:"center", padding:"32px 0" }}>
          <div style={{ fontSize:44, marginBottom:12, display:"inline-block", animation:"spin 1.2s linear infinite" }}>🔄</div>
          <div style={{ fontWeight:700 }}>AI đang phân tích giấy tờ…</div>
        </div>
      )}

      {phase==="done" && result && (
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:18 }}>✅</span><span style={{ fontWeight:700 }}>Nhận diện thành công</span>
            <Chip text={`${result.doTinCay||90}% chính xác`} color={C.teal}/>
          </div>
          <div style={{ background:C.bg, borderRadius:12, padding:"12px 14px" }}>
            {[["Loại giấy tờ",result.loaiGiayTo],["Họ và tên",result.hoTen],["Số giấy tờ",result.soGiayTo],["Ngày sinh",result.ngaySinh],["Giới tính",result.gioiTinh],["Quê quán",result.queQuan],["Địa chỉ",result.diaChiThuongTru],["Ngày cấp",result.ngayCap],["Nơi cấp",result.noiCap]].map(([k,v])=><InfoRow key={k} label={k} value={v}/>)}
          </div>
        </div>
      )}

      {phase!=="scanning" && (
        phase==="done"
          ? <button onClick={()=>{onFill(result,preview);onClose();}} style={S.btn(`linear-gradient(135deg,${C.accent},${C.accentDark})`)}>Dùng thông tin này để đăng tin →</button>
          : <button onClick={scan} disabled={!preview} style={S.btn(preview?`linear-gradient(135deg,${C.violet},${C.violetDark})`:"#222", preview?"#fff":"#555")}>✨ {err?"Thử lại":"Nhận diện ngay"}</button>
      )}
    </Modal>
  );
}

// ─── AI Face Matcher ──────────────────────────────────────────────────────────
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
      const r = await callClaude(
        `Bạn hỗ trợ tìm người mất tích. Phân tích ngoại hình người trong ảnh và đối chiếu với danh sách sau:\n${list}
Trả JSON thuần: {"moTa":{"gioiTinh":"","doTuoi":"","dacDiem":"","trangPhuc":""},"khopID":null,"mucDoKhop":0,"lyDoKhop":"","deXuat":""}
- khopID: ID người khớp nhất hoặc null
- mucDoKhop: 0-100
- Nếu không có người: {"loi":"Không phát hiện người trong ảnh"}`,
        [{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data:b64.current }}, { type:"text", text:"Phân tích và đối chiếu." }]
      );
      if (r.loi) { setErr(r.loi); setPhase("error"); return; }
      setResult({ ...r, person: missing.find(m=>m.id===r.khopID)||null });
      setPhase("done");
    } catch { setErr("Không thể phân tích. Vui lòng thử lại."); setPhase("error"); }
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

      {(phase==="idle"||phase==="error") && preview && (
        <button onClick={match} style={S.btn(`linear-gradient(135deg,${C.rose},${C.roseDark})`)}>🔎 Đối chiếu ngay</button>
      )}
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
      {done ? (
        <div style={{ textAlign:"center", padding:"50px 0" }}>
          <div style={{ fontSize:60, marginBottom:16 }}>🎉</div>
          <div style={{ fontWeight:900, fontSize:22, marginBottom:8 }}>Đăng tin thành công!</div>
          <div style={{ color:C.text3 }}>Tin của bạn đã được đăng lên cộng đồng.</div>
        </div>
      ) : <>
        <div style={{ fontWeight:900, fontSize:20, marginBottom:20 }}>📝 Đăng tin đồ vật</div>

        {/* Type toggle */}
        <div style={{ display:"flex", gap:4, background:C.bg, borderRadius:12, padding:4, marginBottom:20 }}>
          {[["found","🟢 Tôi nhặt được"],["lost","🔴 Tôi bị mất"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPtype(v)} style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:ptype===v?(v==="found"?C.teal:C.accent):"transparent", color:ptype===v?"#fff":C.text3, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>{l}</button>
          ))}
        </div>

        {/* AI scan CTA */}
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
          <Field label="Địa chỉ thường trú" value={form.diaChiThuongTru} onChange={set("diaChiThuongTru")} placeholder="123 Đường ABC, Quận 1, TP.HCM"/>
        </div>}

        <Field label="Địa điểm mất / nhặt được" value={form.location} onChange={set("location")} placeholder="VD: Quận 1, TP.HCM" required/>
        <Field label="Số điện thoại liên hệ" value={form.contact} onChange={set("contact")} placeholder="0901 234 567" type="tel" required/>
        {ptype==="lost" && <Field label="Tiền thưởng (nếu có)" value={form.reward} onChange={set("reward")} placeholder="VD: 200.000đ"/>}
        <Field label="Ghi chú thêm" value={form.note} onChange={set("note")} placeholder="Đặc điểm nhận dạng thêm…" multiline/>

        <button onClick={submit} style={S.btn(`linear-gradient(135deg,${ptype==="found"?C.teal:C.accent},${ptype==="found"?C.tealDark:C.accentDark})`)}>
          Đăng tin ngay →
        </button>
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

  const { pick, inputEl, handleDrop:_ } = useImagePicker(async (src, b64) => {
    setImgPrev(src); setScanning(true);
    try {
      const r = await callClaude(
        `Mô tả người trong ảnh. Trả JSON: {"doTuoi":"","gioiTinh":"Nam|Nữ","dacDiem":"","trangPhuc":""}. Chỉ mô tả những gì thấy rõ.`,
        [{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data:b64 }}, { type:"text", text:"Mô tả người trong ảnh." }]
      );
      setForm(f=>({ ...f, tuoi:r.doTuoi||f.tuoi, gioiTinh:r.gioiTinh||f.gioiTinh, danhTich:[r.dacDiem,r.trangPhuc].filter(Boolean).join(". ")||f.danhTich, trangPhuc:r.trangPhuc||f.trangPhuc }));
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
      {done ? (
        <div style={{ textAlign:"center", padding:"50px 0" }}>
          <div style={{ fontSize:60, marginBottom:16 }}>🙏</div>
          <div style={{ fontWeight:900, fontSize:22, marginBottom:8 }}>Tin đã được đăng!</div>
          <div style={{ color:C.text3 }}>Cộng đồng sẽ cùng giúp tìm người thân của bạn.</div>
        </div>
      ) : <>
        <div style={{ fontWeight:900, fontSize:20, marginBottom:20 }}>👤 Đăng tin tìm người thân</div>

        <div style={{ display:"flex", gap:4, background:C.bg, borderRadius:12, padding:4, marginBottom:20 }}>
          {[["missing","🔴 Tôi đang tìm"],["found_person","🟢 Tôi gặp người lạc"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPtype(v)} style={{ flex:1, padding:"10px 8px", borderRadius:9, border:"none", background:ptype===v?(v==="missing"?C.rose:C.teal):"transparent", color:ptype===v?"#fff":C.text3, fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>{l}</button>
          ))}
        </div>

        {/* Photo upload with AI */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:"block", fontSize:11, color:C.text3, marginBottom:8, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>
            Ảnh người cần tìm {scanning && <span style={{ color:C.violet, fontWeight:400, textTransform:"none" }}>· AI đang mô tả…</span>}
          </label>
          <div onClick={pick} style={{ border:`2px dashed ${imgPrev?C.rose:C.border2}`, borderRadius:12, padding:imgPrev?"8px":"22px", textAlign:"center", cursor:"pointer", background:imgPrev?`${C.rose}04`:C.bg, transition:"all 0.2s", minHeight:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {imgPrev ? (
              <div style={{ position:"relative", width:"100%" }}>
                <img src={imgPrev} alt="" style={{ maxHeight:140, maxWidth:"100%", borderRadius:8, objectFit:"contain" }}/>
                {scanning && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.55)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#fff" }}>🤖 AI đang mô tả người…</div>}
              </div>
            ) : <div><div style={{ fontSize:34, marginBottom:8 }}>🖼️</div><div style={{ fontWeight:700, fontSize:14 }}>Tải ảnh người thân</div><div style={{ fontSize:12, color:C.text3, marginTop:4 }}>AI sẽ tự điền đặc điểm ngoại hình</div></div>}
          </div>
          {imgPrev && !scanning && <div style={{ fontSize:11, color:"#555", marginTop:5 }}>✅ AI đã điền đặc điểm — kiểm tra và chỉnh sửa bên dưới nếu cần</div>}
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
          <Field label="Thông tin sức khỏe / lưu ý" value={form.tieuChuan} onChange={set("tieuChuan")} placeholder="Bệnh nền, thuốc đang dùng, thói quen đặc biệt…" multiline/>
          <Select label="Mức độ khẩn cấp" value={form.urgency} onChange={set("urgency")} options={[["high","🚨 Khẩn cấp"],["medium","⚠️ Bình thường"]]}/>
        </>}
        <Field label="Số điện thoại liên hệ" value={form.contact} onChange={set("contact")} placeholder="0901 234 567" type="tel" required/>
        {ptype==="missing" && <Field label="Tiền thưởng (nếu có)" value={form.reward} onChange={set("reward")} placeholder="VD: 2.000.000đ"/>}

        <button onClick={submit} style={S.btn(`linear-gradient(135deg,${ptype==="missing"?C.rose:C.teal},${ptype==="missing"?C.roseDark:C.tealDark})`)}>
          🙏 Đăng tin ngay
        </button>
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
          <h2 style={{ fontWeight:900, fontSize:18, margin:"8px 0 4px", lineHeight:1.3 }}>
            {sensitive ? privateTitle(item) : item.title}
          </h2>
          <div style={{ fontSize:12, color:C.text3 }}>Đăng ngày {item.date}</div>
        </div>
      </div>

      {/* Thông báo bảo mật cho giấy tờ */}
      {sensitive && (
        <div style={{ background:"rgba(124,111,255,0.08)", border:`1.5px solid ${C.violet}30`, borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:22, flexShrink:0 }}>🔒</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14, marginBottom:4, color:C.violet }}>Thông tin được bảo mật</div>
              <div style={{ fontSize:13, color:C.text3, lineHeight:1.6 }}>
                Để bảo vệ thông tin cá nhân trên giấy tờ, họ tên và số giấy tờ chỉ được cung cấp khi bạn liên hệ trực tiếp qua số điện thoại bên dưới.
              </div>
            </div>
          </div>
          {/* Hướng dẫn xác minh */}
          <div style={{ marginTop:12, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:12, color:"#666", fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>💡 Khi liên hệ hãy:</div>
            <div style={{ fontSize:12, color:C.text3, lineHeight:1.8 }}>
              1. Mô tả đặc điểm giấy tờ bạn tìm / nhặt được<br/>
              2. Cho biết địa điểm bạn mất / nhặt<br/>
              3. Người có giấy tờ sẽ xác nhận thông tin để nhận lại
            </div>
          </div>
        </div>
      )}

      {/* Thông tin địa điểm — luôn hiển thị */}
      <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <SectionTitle icon="📍" text="Thông tin địa điểm"/>
        <InfoRow label="Loại đồ vật" value={item.category}/>
        <InfoRow label="Địa điểm" value={item.location}/>
        <InfoRow label="Ngày đăng" value={item.date}/>
      </div>

      {/* Ghi chú — chỉ hiện nếu không phải giấy tờ nhạy cảm */}
      {item.note && !sensitive && (
        <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <SectionTitle icon="📝" text="Ghi chú"/>
          <p style={{ fontSize:14, color:C.text2, lineHeight:1.6, margin:0 }}>{item.note}</p>
        </div>
      )}

      {/* Thông tin trên giấy tờ — ẩn toàn bộ nếu là sensitive */}
      {!sensitive && (item.hoTen||item.soGiayTo) && (
        <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <SectionTitle icon="📋" text="Thông tin trên giấy tờ"/>
          <InfoRow label="Họ và tên" value={item.hoTen}/>
          <InfoRow label="Số giấy tờ" value={item.soGiayTo}/>
          <InfoRow label="Ngày sinh" value={item.ngaySinh}/>
          <InfoRow label="Giới tính" value={item.gioiTinh}/>
          <InfoRow label="Quê quán" value={item.queQuan}/>
          <InfoRow label="Địa chỉ" value={item.diaChiThuongTru}/>
        </div>
      )}

      {item.reward && (
        <div style={{ background:`${C.gold}10`, border:`1px solid ${C.gold}25`, borderRadius:10, padding:"12px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>🏆</span>
          <span style={{ color:C.gold, fontWeight:700, fontSize:15 }}>Tiền thưởng: {item.reward}</span>
        </div>
      )}

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
        <div style={{ fontSize:12, color:C.text3, marginBottom:8 }}>
          {sensitive ? "📞 Liên hệ để xác minh và nhận lại giấy tờ:" : "📞 Liên hệ để trả / nhận đồ:"}
        </div>
        <a href={`tel:${item.contact}`} style={{ display:"block", background:`linear-gradient(135deg,${color},${item.type==="found"?C.tealDark:C.accentDark})`, borderRadius:12, padding:"14px", color:"#fff", fontWeight:800, fontSize:17, textDecoration:"none", textAlign:"center" }}>
          {item.contact}
        </a>
        {sensitive && (
          <div style={{ textAlign:"center", fontSize:12, color:"#444", marginTop:8 }}>
            🔒 Thông tin giấy tờ chỉ xác nhận qua điện thoại
          </div>
        )}
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
          <h2 style={{ fontWeight:900, fontSize:19, margin:"8px 0 4px", lineHeight:1.3 }}>{person.hoTen}</h2>
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

      <button onClick={()=>{onClose();onFaceSearch();}} style={{ ...S.btn(`linear-gradient(135deg,${C.violet},${C.violetDark})`), marginBottom:10 }}>
        🔎 Tôi có ảnh — Đối chiếu ngay
      </button>
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
        <div style={{ fontSize:12, color:C.text3, marginBottom:8 }}>📞 Liên hệ ngay nếu có thông tin:</div>
        <a href={`tel:${person.contact}`} style={{ display:"block", background:`linear-gradient(135deg,${uc},${person.urgency==="high"?C.roseDark:"#E6A817"})`, borderRadius:12, padding:"14px", color:"#fff", fontWeight:800, fontSize:17, textDecoration:"none", textAlign:"center" }}>
          {person.contact}
        </a>
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

      {/* Tiêu đề: ẩn tên nếu là giấy tờ nhạy cảm */}
      <div style={{ fontWeight:700, fontSize:14, marginBottom:6, lineHeight:1.4, paddingRight:70 }}>
        {sensitive ? privateTitle(item) : item.title}
      </div>

      {/* Chỉ hiện tên/số nếu KHÔNG phải giấy tờ nhạy cảm */}
      {!sensitive && item.hoTen && (
        <div style={{ fontSize:11, color:C.violet, fontWeight:600, marginBottom:6 }}>
          👤 {item.hoTen} {item.soGiayTo && <span style={{ color:"#444" }}>· {item.soGiayTo}</span>}
        </div>
      )}

      {/* Luôn hiện địa điểm */}
      <div style={{ fontSize:11, color:"#444" }}>📍 {item.location}</div>
      <div style={{ fontSize:11, color:"#333", marginTop:2 }}>📅 {item.date}</div>

      {/* Icon bảo mật cho giấy tờ */}
      {sensitive && (
        <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:11 }}>🔒</span>
          <span style={{ fontSize:11, color:"#555" }}>Bấm để liên hệ xác minh</span>
        </div>
      )}

      {item.reward && (
        <div style={{ marginTop:8, background:`${C.gold}12`, borderRadius:8, padding:"4px 10px", display:"inline-block" }}>
          <span style={{ fontSize:12, color:C.gold, fontWeight:700 }}>🏆 {item.reward}</span>
        </div>
      )}
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

// ─── Empty State ──────────────────────────────────────────────────────────────
function Empty({ icon, text }) {
  return <div style={{ textAlign:"center", padding:"60px 0", color:"#2A2A2A" }}>
    <div style={{ fontSize:48, marginBottom:12, filter:"grayscale(1)" }}>{icon}</div>
    <div style={{ fontSize:16, fontWeight:700, color:"#444" }}>{text}</div>
  </div>;
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [step, setStep] = useState("phone"); // phone | otp | done
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const DEMO_OTP = "123456";

  const sendOtp = () => {
    if (phone.replace(/\s/g,"").length < 9) { setErr("Số điện thoại không hợp lệ"); return; }
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1500);
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < 5) otpRefs[i+1].current?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs[i-1].current?.focus();
  };

  const verifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6) { setErr("Nhập đủ 6 số OTP"); return; }
    setErr(""); setLoading(true);
    setTimeout(() => {
      if (code === DEMO_OTP) {
        setLoading(false); setStep("done");
        setTimeout(() => { onLogin({ phone, name: "Người dùng" }); onClose(); }, 1200);
      } else { setLoading(false); setErr("Mã OTP không đúng. Thử: 123456"); }
    }, 1200);
  };

  return (
    <Modal onClose={onClose} style={{ maxWidth:400 }}>
      {step==="done" ? (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <div style={{ fontSize:56, marginBottom:14 }}>🎉</div>
          <div style={{ fontWeight:900, fontSize:20, marginBottom:6 }}>Đăng nhập thành công!</div>
          <div style={{ color:C.text3, fontSize:14 }}>Chào mừng bạn đến với TìmĐồ.vn</div>
        </div>
      ) : <>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 12px" }}>🔍</div>
          <div style={{ fontWeight:900, fontSize:20 }}>Đăng nhập TìmĐồ<span style={{ color:C.accent }}>.vn</span></div>
          <div style={{ fontSize:13, color:C.text3, marginTop:4 }}>
            {step==="phone" ? "Nhập số điện thoại để nhận mã OTP" : `Nhập mã OTP gửi đến ${phone}`}
          </div>
        </div>

        {step==="phone" && <>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, color:C.text3, marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Số điện thoại</label>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ background:C.bg3, border:`1.5px solid ${C.border2}`, borderRadius:10, padding:"11px 13px", fontSize:14, color:C.text3, whiteSpace:"nowrap" }}>🇻🇳 +84</div>
              <input value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendOtp()} placeholder="090 123 4567" style={{ ...S.input, flex:1 }} maxLength={12}/>
            </div>
          </div>
          {err && <div style={{ color:"#FF7070", fontSize:13, marginBottom:10 }}>⚠️ {err}</div>}
          <button onClick={sendOtp} disabled={loading} style={S.btn(loading?"#222":`linear-gradient(135deg,${C.accent},${C.accentDark})`, loading?"#555":"#fff")}>
            {loading ? "Đang gửi OTP…" : "Gửi mã OTP →"}
          </button>
          <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:C.text3 }}>
            Bằng cách đăng nhập, bạn đồng ý với <span style={{ color:C.accent, cursor:"pointer" }}>Điều khoản sử dụng</span>
          </div>
        </>}

        {step==="otp" && <>
          {/* OTP boxes */}
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:20 }}>
            {otp.map((v,i)=>(
              <input key={i} ref={otpRefs[i]} value={v} onChange={e=>handleOtpChange(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)}
                maxLength={1} inputMode="numeric"
                style={{ width:46, height:54, textAlign:"center", fontSize:22, fontWeight:800, background:C.bg3, border:`2px solid ${v?C.accent:C.border2}`, borderRadius:12, color:C.text, outline:"none", transition:"border-color 0.15s" }}/>
            ))}
          </div>
          {err && <div style={{ color:"#FF7070", fontSize:13, marginBottom:10, textAlign:"center" }}>⚠️ {err}</div>}
          <button onClick={verifyOtp} disabled={loading} style={S.btn(loading?"#222":`linear-gradient(135deg,${C.accent},${C.accentDark})`, loading?"#555":"#fff")}>
            {loading ? "Đang xác minh…" : "Xác nhận"}
          </button>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
            <button onClick={()=>{setStep("phone");setOtp(["","","","","",""]);setErr("");}} style={{ background:"transparent", border:"none", color:C.text3, fontSize:13, cursor:"pointer" }}>← Đổi số</button>
            <button onClick={sendOtp} style={{ background:"transparent", border:"none", color:C.accent, fontSize:13, cursor:"pointer", fontWeight:600 }}>Gửi lại OTP</button>
          </div>
          <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:"#444", background:C.bg, borderRadius:8, padding:"6px 10px" }}>
            💡 Demo: dùng mã <strong style={{ color:C.gold }}>123456</strong>
          </div>
        </>}
      </>}
    </Modal>
  );
}

// ─── NOTIFICATIONS PANEL ──────────────────────────────────────────────────────
const DEMO_NOTIFS = [
  { id:1, type:"match", read:false, time:"5 phút trước", icon:"🎯", title:"Có tin khớp với đồ bạn đang tìm!", body:"Một người vừa đăng tin nhặt được Ví/Túi xách tại Đống Đa, Hà Nội — trùng khu vực bạn mất.", action:"Xem ngay" },
  { id:2, type:"urgent", read:false, time:"12 phút trước", icon:"🚨", title:"Trường hợp khẩn cấp gần bạn", body:"Em Phạm Quốc Bảo (8 tuổi) đang được tìm kiếm tại Công viên 23/9, Quận 1.", action:"Xem hồ sơ" },
  { id:3, type:"system", read:true, time:"1 giờ trước", icon:"✅", title:"Đăng ký nhận thông báo thành công", body:"Bạn sẽ nhận SMS khi có tin khớp với từ khóa đã đăng ký.", action:null },
  { id:4, type:"match", read:true, time:"3 giờ trước", icon:"🔑", title:"Tin nhặt được khớp khu vực của bạn", body:"Chùm chìa khóa Honda nhặt được tại Bình Thạnh — bạn có đăng tin mất chìa khóa?", action:"Kiểm tra" },
  { id:5, type:"system", read:true, time:"Hôm qua", icon:"📱", title:"Đăng ký nhận thông báo SMS/Zalo", body:"Bật thông báo để nhận SMS khi có tin mới khớp với đồ vật của bạn.", action:"Cài đặt" },
];

function NotifPanel({ onClose, user }) {
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);
  const [tab, setTab] = useState("all"); // all | unread
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subPhone, setSubPhone] = useState(user?.phone||"");
  const [subKeyword, setSubKeyword] = useState("");
  const [subChannel, setSubChannel] = useState("sms");
  const [subDone, setSubDone] = useState(false);

  const unreadCount = notifs.filter(n=>!n.read).length;
  const shown = tab==="unread" ? notifs.filter(n=>!n.read) : notifs;
  const markAll = () => setNotifs(prev=>prev.map(n=>({...n,read:true})));
  const markOne = id => setNotifs(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));

  const typeColor = t => t==="match"?C.teal:t==="urgent"?C.rose:C.violet;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.5)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", top:70, right:16, width:380, maxHeight:"80vh", background:C.bg1, border:`1.5px solid ${C.border}`, borderRadius:20, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>

        {/* Header */}
        <div style={{ padding:"16px 18px 0", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontWeight:800, fontSize:16 }}>🔔 Thông báo {unreadCount>0&&<span style={{ background:C.rose, color:"#fff", fontSize:11, fontWeight:700, padding:"2px 7px", borderRadius:20, marginLeft:6 }}>{unreadCount}</span>}</div>
            <div style={{ display:"flex", gap:8 }}>
              {unreadCount>0 && <button onClick={markAll} style={{ background:"transparent", border:"none", color:C.accent, fontSize:12, cursor:"pointer", fontWeight:600 }}>Đọc tất cả</button>}
              <button onClick={onClose} style={{ background:"#222", border:"none", borderRadius:6, width:26, height:26, color:"#888", cursor:"pointer", fontSize:16 }}>×</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:4, marginBottom:0 }}>
            {[["all","Tất cả"],["unread","Chưa đọc"]].map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v)} style={{ padding:"6px 14px", borderRadius:"8px 8px 0 0", border:"none", background:tab===v?C.bg2:"transparent", color:tab===v?"#fff":C.text3, fontWeight:600, fontSize:12, cursor:"pointer" }}>{l} {v==="unread"&&unreadCount>0&&`(${unreadCount})`}</button>
            ))}
          </div>
        </div>

        {/* Notif list */}
        <div style={{ overflowY:"auto", flex:1 }}>
          {shown.length===0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:C.text3 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🔕</div>
              <div style={{ fontSize:14 }}>Không có thông báo mới</div>
            </div>
          ) : shown.map(n=>(
            <div key={n.id} onClick={()=>markOne(n.id)} style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, background:n.read?"transparent":`${typeColor(n.type)}08`, cursor:"pointer", transition:"background 0.15s" }}>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${typeColor(n.type)}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{n.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <div style={{ fontWeight:n.read?600:800, fontSize:13, lineHeight:1.4, color:n.read?C.text2:C.text }}>{n.title}</div>
                    {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:typeColor(n.type), flexShrink:0, marginTop:4 }}/>}
                  </div>
                  <div style={{ fontSize:12, color:C.text3, lineHeight:1.5, marginTop:3 }}>{n.body}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
                    <span style={{ fontSize:11, color:"#444" }}>{n.time}</span>
                    {n.action && <span style={{ fontSize:11, color:typeColor(n.type), fontWeight:700, cursor:"pointer" }}>{n.action} →</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe section */}
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 18px" }}>
          {!showSubscribe ? (
            <button onClick={()=>setShowSubscribe(true)} style={{ ...S.btn(`linear-gradient(135deg,${C.violet},${C.violetDark})`), padding:"10px", fontSize:13 }}>
              📲 Đăng ký nhận thông báo SMS / Zalo
            </button>
          ) : subDone ? (
            <div style={{ textAlign:"center", padding:"10px 0", color:C.teal, fontWeight:700, fontSize:14 }}>✅ Đăng ký thành công!</div>
          ) : (
            <div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>📲 Cài đặt thông báo</div>
              <div style={{ marginBottom:8 }}>
                <label style={{ fontSize:11, color:C.text3, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>Kênh nhận thông báo</label>
                <div style={{ display:"flex", gap:6 }}>
                  {[["sms","📱 SMS"],["zalo","💬 Zalo"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setSubChannel(v)} style={{ flex:1, padding:"8px", borderRadius:8, border:`1.5px solid ${subChannel===v?C.violet:C.border2}`, background:subChannel===v?`${C.violet}18`:"transparent", color:subChannel===v?C.violet:C.text3, fontWeight:600, fontSize:13, cursor:"pointer" }}>{l}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:8 }}>
                <label style={{ fontSize:11, color:C.text3, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>Số điện thoại</label>
                <input value={subPhone} onChange={e=>setSubPhone(e.target.value)} placeholder="090 123 4567" style={{ ...S.input, fontSize:13 }}/>
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:C.text3, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>Từ khóa theo dõi</label>
                <input value={subKeyword} onChange={e=>setSubKeyword(e.target.value)} placeholder="VD: ví, CCCD, Quận 1…" style={{ ...S.input, fontSize:13 }}/>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setShowSubscribe(false)} style={{ ...S.btn("#222","#aaa"), flex:1, padding:"9px", fontSize:13 }}>Huỷ</button>
                <button onClick={()=>setSubDone(true)} style={{ ...S.btn(`linear-gradient(135deg,${C.violet},${C.violetDark})`), flex:2, padding:"9px", fontSize:13 }}>Đăng ký</button>
              </div>
              <div style={{ fontSize:11, color:"#444", marginTop:8, textAlign:"center" }}>
                💡 Thực tế cần tích hợp ESMS / Zalo OA API
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAP MODAL ────────────────────────────────────────────────────────────────
// Dùng OpenStreetMap (Leaflet) qua iframe — miễn phí, không cần API key
const MAP_ITEMS = [
  { id:1,  lat:10.7769, lng:106.7009, title:"CCCD — Đang tìm", location:"Quận 1, TP.HCM",      type:"lost",  cat:"CMND/CCCD" },
  { id:2,  lat:21.0285, lng:105.8542, title:"Bằng lái xe B2",  location:"Hoàn Kiếm, Hà Nội",   type:"found", cat:"Bằng lái xe" },
  { id:3,  lat:21.0245, lng:105.8412, title:"Ví da đen",       location:"Đống Đa, Hà Nội",     type:"lost",  cat:"Ví/Túi xách" },
  { id:4,  lat:10.8100, lng:106.7100, title:"Chìa khóa Honda", location:"Bình Thạnh, TP.HCM",  type:"found", cat:"Chìa khóa" },
  { id:5,  lat:10.7553, lng:106.6797, title:"Ví Coach nâu",    location:"Quận 7, TP.HCM",      type:"lost",  cat:"Ví/Túi xách" },
  { id:101,lat:10.7731, lng:106.6980, title:"Bà Nguyễn Thị Lan (72t)", location:"Chợ Bến Thành, Q.1", type:"missing", cat:"person" },
  { id:102,lat:10.7710, lng:106.6920, title:"Em Phạm Quốc Bảo (8t)",   location:"Công viên 23/9",     type:"missing", cat:"person" },
  { id:103,lat:10.7540, lng:106.6600, title:"Ông Trần Minh Đức (68t)",  location:"BV Chợ Rẫy",        type:"missing", cat:"person" },
];

function MapModal({ onClose, items, missing }) {
  const [filter, setFilter] = useState("all"); // all | items | missing
  const [selectedPin, setSelectedPin] = useState(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickedLoc, setPickedLoc] = useState(null);
  const mapRef = useRef(null);

  const allPins = [
    ...MAP_ITEMS.filter(p => p.cat!=="person"),
    ...MAP_ITEMS.filter(p => p.cat==="person"),
  ].filter(p => filter==="all" || (filter==="items"&&p.cat!=="person") || (filter==="missing"&&p.cat==="person"));

  // Build iframe src for OpenStreetMap
  const centerLat = 16.0; const centerLng = 106.0; const zoom = 6;
  const markers = allPins.map(p => {
    const color = p.type==="lost"?"red":p.type==="found"?"green":"blue";
    return `${p.lat},${p.lng}`;
  }).join("|");

  // Build a simple SVG map visualization (since we can't load external leaflet easily)
  const PIN_COLORS = { lost:"#FF6B35", found:"#2EC4B6", missing:"#FF4F7B", found_person:"#7C6FFF" };

  // Vietnam bounding box: lat 8.5-23.5, lng 102-110
  const toX = lng => ((lng - 102) / (110 - 102)) * 100;
  const toY = lat => ((23.5 - lat) / (23.5 - 8.5)) * 100;

  return (
    <Modal onClose={onClose} style={{ maxWidth:680, padding:0, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:18 }}>🗺️ Bản đồ tin đăng</div>
          <button onClick={onClose} style={{ background:"#222", border:"none", borderRadius:8, width:30, height:30, color:"#888", cursor:"pointer", fontSize:18 }}>×</button>
        </div>
        {/* Filter tabs */}
        <div style={{ display:"flex", gap:6 }}>
          {[["all","🗺️ Tất cả"],["items","🪪 Đồ vật"],["missing","👤 Người thân"]].map(([v,l])=>(
            <button key={v} onClick={()=>{ setFilter(v); setSelectedPin(null); }} style={{ padding:"6px 14px", borderRadius:8, border:`1.5px solid ${filter===v?C.accent:C.border}`, background:filter===v?`${C.accent}12`:"transparent", color:filter===v?C.accent:C.text3, fontWeight:600, fontSize:12, cursor:"pointer" }}>{l}</button>
          ))}
          <button onClick={()=>setPickMode(!pickMode)} style={{ marginLeft:"auto", padding:"6px 14px", borderRadius:8, border:`1.5px solid ${pickMode?C.violet:C.border}`, background:pickMode?`${C.violet}18`:"transparent", color:pickMode?C.violet:C.text3, fontWeight:600, fontSize:12, cursor:"pointer" }}>
            {pickMode?"✅ Đang chọn vị trí":"📍 Chọn vị trí khi đăng tin"}
          </button>
        </div>
      </div>

      {/* Map SVG */}
      <div style={{ position:"relative", background:"#0D1117", cursor:pickMode?"crosshair":"default" }}
        onClick={e=>{
          if (!pickMode) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX-rect.left)/rect.width)*100;
          const py = ((e.clientY-rect.top)/rect.height)*100;
          const lng = 102 + (px/100)*(110-102);
          const lat = 23.5 - (py/100)*(23.5-8.5);
          setPickedLoc({ lat:lat.toFixed(4), lng:lng.toFixed(4) });
        }}>
        <svg viewBox="0 0 100 100" style={{ width:"100%", height:400, display:"block" }} preserveAspectRatio="none">
          {/* Background */}
          <rect width="100" height="100" fill="#0D1117"/>
          {/* Vietnam shape (simplified) */}
          <path d="M 52 5 L 58 8 L 64 12 L 68 18 L 70 25 L 66 32 L 72 38 L 74 44 L 70 50 L 65 55 L 68 62 L 66 70 L 60 78 L 54 85 L 50 90 L 46 85 L 44 78 L 46 70 L 42 62 L 40 55 L 38 48 L 42 42 L 38 36 L 36 30 L 40 22 L 44 15 L 48 8 Z" fill="#1a2332" stroke="#2A3F5F" strokeWidth="0.5"/>
          {/* Grid lines */}
          {[20,40,60,80].map(v=><>
            <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} stroke="#1E1E1E" strokeWidth="0.3"/>
            <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" stroke="#1E1E1E" strokeWidth="0.3"/>
          </>)}
          {/* City labels */}
          {[{name:"Hà Nội",lat:21.03,lng:105.85},{name:"TP.HCM",lat:10.78,lng:106.70},{name:"Đà Nẵng",lat:16.05,lng:108.22},{name:"Cần Thơ",lat:10.03,lng:105.79}].map(c=>(
            <text key={c.name} x={toX(c.lng)} y={toY(c.lat)+5} fontSize="2" fill="#3A4A6A" textAnchor="middle">{c.name}</text>
          ))}
          {/* Pins */}
          {allPins.map(p=>{
            const x = toX(p.lng); const y = toY(p.lat);
            const color = PIN_COLORS[p.type]||C.accent;
            const isSelected = selectedPin?.id===p.id;
            return (
              <g key={p.id} onClick={e=>{e.stopPropagation();setSelectedPin(p);}} style={{ cursor:"pointer" }}>
                <circle cx={x} cy={y} r={isSelected?3.5:2.5} fill={color} opacity={0.9}/>
                <circle cx={x} cy={y} r={isSelected?5:4} fill={color} opacity={0.2}/>
                {isSelected && <circle cx={x} cy={y} r={7} fill="none" stroke={color} strokeWidth="0.5" opacity={0.5}/>}
              </g>
            );
          })}
          {/* Picked location */}
          {pickedLoc && (
            <g>
              <circle cx={toX(parseFloat(pickedLoc.lng))} cy={toY(parseFloat(pickedLoc.lat))} r="3" fill={C.violet} opacity={0.9}/>
              <circle cx={toX(parseFloat(pickedLoc.lng))} cy={toY(parseFloat(pickedLoc.lat))} r="6" fill={C.violet} opacity={0.2}/>
              <text x={toX(parseFloat(pickedLoc.lng))} y={toY(parseFloat(pickedLoc.lat))-5} fontSize="2.5" fill={C.violet} textAnchor="middle">📍 Vị trí chọn</text>
            </g>
          )}
        </svg>

        {/* Legend */}
        <div style={{ position:"absolute", top:12, left:12, background:"rgba(0,0,0,0.75)", borderRadius:10, padding:"8px 12px", display:"flex", flexDirection:"column", gap:5 }}>
          {[["🔴","Đang tìm đồ",C.accent],["🟢","Đã nhặt được",C.teal],["🔵","Người mất tích",C.rose]].map(([icon,label,color])=>(
            <div key={label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#ccc" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0 }}/>
              {label}
            </div>
          ))}
        </div>

        {/* Pick mode banner */}
        {pickMode && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:`${C.violet}E0`, padding:"10px 16px", textAlign:"center", fontSize:13, color:"#fff", fontWeight:600 }}>
            📍 Bấm vào bản đồ để chọn vị trí đăng tin
          </div>
        )}
      </div>

      {/* Selected pin info */}
      {selectedPin && (
        <div style={{ padding:"14px 22px", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:`${PIN_COLORS[selectedPin.type]}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
            {selectedPin.cat==="person"?"👤":"📦"}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{selectedPin.title}</div>
            <div style={{ fontSize:12, color:C.text3 }}>📍 {selectedPin.location}</div>
          </div>
          <button style={{ ...S.btn(`linear-gradient(135deg,${PIN_COLORS[selectedPin.type]},${PIN_COLORS[selectedPin.type]}AA)`), width:"auto", padding:"8px 16px", fontSize:13 }}>
            Xem chi tiết
          </button>
        </div>
      )}

      {/* Picked location result */}
      {pickedLoc && pickMode && (
        <div style={{ padding:"12px 22px", borderTop:`1px solid ${C.border}`, background:`${C.violet}08`, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>📍</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>Vị trí đã chọn</div>
            <div style={{ fontSize:12, color:C.text3 }}>Lat: {pickedLoc.lat} · Lng: {pickedLoc.lng}</div>
          </div>
          <button onClick={()=>{setPickMode(false); setPickedLoc(null);}} style={{ ...S.btn(`linear-gradient(135deg,${C.violet},${C.violetDark})`), width:"auto", padding:"8px 14px", fontSize:12 }}>
            Dùng vị trí này ✓
          </button>
        </div>
      )}

      {/* Pin count */}
      <div style={{ padding:"10px 22px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:12, color:C.text3 }}>Đang hiển thị <strong style={{ color:"#ccc" }}>{allPins.length}</strong> vị trí trên bản đồ</div>
        <div style={{ display:"flex", gap:12 }}>
          {[["🔴",allPins.filter(p=>p.type==="lost").length,"Đang tìm"],[" 🟢",allPins.filter(p=>p.type==="found").length,"Đã nhặt"],["🔵",allPins.filter(p=>p.type==="missing").length,"Mất tích"]].map(([icon,n,l])=>(
            <div key={l} style={{ fontSize:11, color:C.text3 }}>{icon} {n} {l}</div>
          ))}
        </div>
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
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [detailItem, setDetailItem] = useState(null);
  const [detailMissing, setDetailMissing] = useState(null);
  const [postItem, setPostItem] = useState(false);
  const [postMissing, setPostMissing] = useState(false);
  const [faceSearch, setFaceSearch] = useState(false);
  const [missingSubTab, setMissingSubTab] = useState("all");
  // ── NEW STATE ──
  const [user, setUser] = useState(null);          // null = chưa đăng nhập
  const [showLogin, setShowLogin] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [notifCount] = useState(2);                // unread count demo

  // u2500u2500 Load du1eef liu1ec7u thu1eadt tu1eeb Supabase u2500u2500
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: itemsData } = await supabase.from("items").select("*").order("created_at", { ascending: false });
        const { data: missingData } = await supabase.from("missing_persons").select("*").order("created_at", { ascending: false });
        if (itemsData && itemsData.length > 0) {
          setItems(itemsData.map(i => ({ ...i, hoTen: i.ho_ten, soGiayTo: i.so_giay_to, ngaySinh: i.ngay_sinh })));
        }
        if (missingData && missingData.length > 0) {
          setMissing(missingData.map(m => ({ ...m, hoTen: m.ho_ten, gioiTinh: m.gioi_tinh, danhTich: m.danh_tich, trangPhuc: m.trang_phuc, lanCuoiThay: m.lan_cuoi_thay, thoiGian: m.thoi_gian })));
        }
      } catch (e) { console.log("Du00f9ng du1eef liu1ec7u mu1eabu"); }
    };
    loadData();
  }, []);

  const urgentCount = missing.filter(m=>m.urgency==="high"&&m.type==="missing").length;

  const filteredItems = items.filter(i => {
    const matchSub = subTab==="all"||i.type===subTab;
    const matchCat = cat==="Tất cả"||i.category===cat;
    const q = search.toLowerCase();
    // Giấy tờ nhạy cảm: chỉ tìm theo địa điểm và loại — không lộ tên/số
    const searchFields = isSensitive(i)
      ? [i.location, i.category, i.date]
      : [i.title, i.location, i.hoTen, i.soGiayTo, i.note];
    return matchSub && matchCat && (!q || searchFields.some(f=>f?.toLowerCase().includes(q)));
  });

  const filteredMissing = missing.filter(m => {
    const matchSub = missingSubTab==="all"||m.type===missingSubTab;
    const q = search.toLowerCase();
    return matchSub && (!q||[m.hoTen,m.danhTich,m.lanCuoiThay,m.trangPhuc].some(f=>f?.toLowerCase().includes(q)));
  });

  const addItem = async (item) => {
    try {
      await supabase.from("items").insert([{ type:item.type, category:item.category, title:item.title, ho_ten:item.hoTen||"", so_giay_to:item.soGiayTo||"", ngay_sinh:item.ngaySinh||"", location:item.location, contact:item.contact, reward:item.reward||"", note:item.note||"", img:item.img, date:item.date }]);
    } catch (e) {}
    setItems(prev=>[item, ...prev]);
  };
  const addMissing = async (m) => {
    try {
      await supabase.from("missing_persons").insert([{ type:m.type, ho_ten:m.hoTen||"", tuoi:m.tuoi||"", gioi_tinh:m.gioiTinh||"", danh_tich:m.danhTich||"", trang_phuc:m.trangPhuc||"", lan_cuoi_thay:m.lanCuoiThay||"", thoi_gian:m.thoiGian||"", contact:m.contact, reward:m.reward||"", urgency:m.urgency||"medium", avatar:m.avatar||"👤", date:m.date }]);
    } catch (e) {}
    setMissing(prev=>[m, ...prev]);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#111; } ::-webkit-scrollbar-thumb { background:#2A2A2A; border-radius:3px; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background:`${C.bg1}F8`, backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"0 22px", position:"sticky", top:0, zIndex:200 }}>
        <div style={{ maxWidth:1040, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:62 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🔍</div>
            <div>
              <div style={{ fontWeight:900, fontSize:19, letterSpacing:-0.5, lineHeight:1 }}>TìmĐồ<span style={{ color:C.accent }}>.vn</span></div>
              <div style={{ fontSize:9, color:C.text3, letterSpacing:1.5, textTransform:"uppercase" }}>Đồ vật · Người thân · AI</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {/* Map button */}
            <button onClick={()=>setShowMap(true)} style={{ background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text3, fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
              🗺️ <span style={{ display:"none" }}>Bản đồ</span>
            </button>

            {/* Notification bell */}
            {user && (
              <button onClick={()=>setShowNotif(v=>!v)} style={{ position:"relative", background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text3, cursor:"pointer", fontSize:18 }}>
                🔔
                {notifCount>0 && <span style={{ position:"absolute", top:4, right:4, background:C.rose, color:"#fff", fontSize:9, fontWeight:800, width:15, height:15, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", animation:"blink 2s ease infinite" }}>{notifCount}</span>}
              </button>
            )}

            {/* Face search */}
            {mainTab==="missing" && <button onClick={()=>setFaceSearch(true)} style={{ background:`linear-gradient(135deg,${C.violet},${C.violetDark})`, border:"none", borderRadius:10, padding:"9px 14px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>🔎 Đối chiếu ảnh</button>}

            {/* Post button */}
            <button onClick={()=>{ if(!user){setShowLogin(true);return;} mainTab==="items"?setPostItem(true):setPostMissing(true); }} style={{ background:`linear-gradient(135deg,${mainTab==="missing"?C.rose:C.accent},${mainTab==="missing"?C.roseDark:C.accentDark})`, border:"none", borderRadius:10, padding:"9px 16px", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>
              + Đăng tin
            </button>

            {/* Login / Avatar */}
            {user ? (
              <div onClick={()=>setUser(null)} title="Bấm để đăng xuất" style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${C.violet},${C.violetDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:"pointer", flexShrink:0 }}>
                👤
              </div>
            ) : (
              <button onClick={()=>setShowLogin(true)} style={{ background:"#1A1A1A", border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 14px", color:C.text2, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN TAB BAR ── */}
      <div style={{ background:C.bg1, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1040, margin:"0 auto", display:"flex" }}>
          {[["items","🪪","Đồ vật thất lạc"],["missing","👤","Tìm người thân"]].map(([v,icon,l])=>(
            <button key={v} onClick={()=>{setMainTab(v);setSearch("");}} style={{ padding:"14px 20px", border:"none", background:"transparent", color:mainTab===v?"#fff":C.text3, fontWeight:700, fontSize:14, cursor:"pointer", borderBottom:`2.5px solid ${mainTab===v?(v==="missing"?C.rose:C.accent):"transparent"}`, transition:"all 0.2s", display:"flex", alignItems:"center", gap:6, position:"relative" }}>
              <span>{icon}</span><span>{l}</span>
              {v==="missing"&&urgentCount>0 && <span style={{ background:C.rose, color:"#fff", fontSize:10, fontWeight:800, width:18, height:18, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", animation:"blink 1.5s ease infinite" }}>{urgentCount}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{ background:`linear-gradient(180deg,#181818 0%,${C.bg} 100%)`, padding:"40px 22px 28px", textAlign:"center", borderBottom:`1px solid #161616` }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          {mainTab==="missing" ? <>
            <div style={{ fontSize:11, color:C.rose, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Kết nối · Chia sẻ · Tìm thấy</div>
            <h1 style={{ fontSize:34, fontWeight:900, margin:"0 0 10px", lineHeight:1.1, letterSpacing:-1 }}>Tìm người thân<br/><span style={{ color:C.rose }}>thất lạc</span></h1>
            <p style={{ color:C.text3, fontSize:14, margin:"0 0 20px", lineHeight:1.65 }}>Đăng tin hoặc <strong style={{ color:C.violet }}>tải ảnh để AI đối chiếu</strong> với hồ sơ người mất tích trong cơ sở dữ liệu</p>
          </> : <>
            <div style={{ fontSize:11, color:C.accent, fontWeight:700, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Cộng đồng hỗ trợ lẫn nhau</div>
            <h1 style={{ fontSize:34, fontWeight:900, margin:"0 0 10px", lineHeight:1.1, letterSpacing:-1 }}>Mất đồ? Nhặt được?<br/><span style={{ color:C.accent }}>Kết nối ngay!</span></h1>
            <p style={{ color:C.text3, fontSize:14, margin:"0 0 20px", lineHeight:1.65 }}>Tải ảnh giấy tờ — <strong style={{ color:C.violet }}>AI tự nhận diện & điền thông tin</strong> để dễ tìm kiếm hơn</p>
          </>}

          {/* Search */}
          <div style={{ position:"relative", maxWidth:440, margin:"0 auto 20px" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={mainTab==="missing"?"Tìm theo tên, đặc điểm, địa điểm…":"Tìm theo tên, số CCCD, địa điểm…"}
              style={{ ...S.input, padding:"13px 14px 13px 42px", borderRadius:14, fontSize:15, border:`1.5px solid ${C.border}` }}/>
            {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:C.text3, cursor:"pointer", fontSize:18 }}>×</button>}
          </div>

          {/* Stats */}
          <div style={{ display:"flex", justifyContent:"center", gap:32 }}>
            {(mainTab==="missing"
              ? [[C.rose,urgentCount,"Khẩn cấp"],[C.accent,missing.filter(m=>m.type==="missing").length,"Đang tìm"],[C.teal,missing.filter(m=>m.type==="found_person").length,"Đã gặp"]]
              : [[C.accent,items.filter(i=>i.type==="lost").length,"Đang tìm"],[C.teal,items.filter(i=>i.type==="found").length,"Chờ nhận"],["#888","312","Đã trả lại"]]
            ).map(([color,n,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:26, fontWeight:900, color, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:10, color:C.text3, letterSpacing:1, textTransform:"uppercase", marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI BANNER ── */}
      {mainTab==="missing" ? (
        <div style={{ background:`linear-gradient(90deg,${C.rose}12,${C.roseDark}05)`, borderBottom:`1px solid ${C.rose}20`, padding:"10px 22px", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <span style={{ fontSize:13, color:"#FF9AB9" }}>🔎 <strong>AI Đối Chiếu Ảnh</strong> — Tải ảnh người lạc, AI so sánh với toàn bộ hồ sơ & gợi ý khớp</span>
          <button onClick={()=>setFaceSearch(true)} style={{ background:`${C.rose}25`, border:`1px solid ${C.rose}40`, borderRadius:8, padding:"5px 12px", color:C.rose, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Thử ngay →</button>
        </div>
      ) : (
        <div style={{ background:`linear-gradient(90deg,${C.violet}12,${C.violetDark}05)`, borderBottom:`1px solid ${C.violet}20`, padding:"10px 22px", textAlign:"center" }}>
          <span style={{ fontSize:13, color:"#9D99FF" }}>🤖 <strong>AI Vision</strong> — Chụp ảnh CCCD / Bằng lái / Hộ chiếu, hệ thống tự đọc họ tên & số giấy tờ</span>
        </div>
      )}

      {/* ── FILTERS ── */}
      <div style={{ background:C.bg1, borderBottom:`1px solid ${C.border}`, padding:"10px 22px", overflowX:"auto" }}>
        <div style={{ maxWidth:1040, margin:"0 auto", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {mainTab==="items" ? <>
            <div style={{ display:"flex", gap:3, background:C.bg, borderRadius:10, padding:3 }}>
              {[["all","Tất cả"],["lost","🔴 Đang tìm"],["found","🟢 Đã nhặt"]].map(([v,l])=>(
                <button key={v} onClick={()=>setSubTab(v)} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:subTab===v?(v==="lost"?C.accent:v==="found"?C.teal:"#333"):"transparent", color:subTab===v?"#fff":C.text3, fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>{l}</button>
              ))}
            </div>
            <div style={{ width:1, height:24, background:C.border, flexShrink:0 }}/>
            {["Tất cả",...ITEM_CAT].map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{ padding:"6px 12px", borderRadius:8, border:`1.5px solid ${cat===c?C.accent:C.border}`, background:cat===c?`${C.accent}12`:"transparent", color:cat===c?C.accent:C.text3, fontWeight:600, fontSize:11, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>{c}</button>
            ))}
          </> : <>
            <div style={{ display:"flex", gap:3, background:C.bg, borderRadius:10, padding:3 }}>
              {[["all","Tất cả"],["missing","🔴 Đang tìm"],["found_person","🟢 Đã gặp"]].map(([v,l])=>(
                <button key={v} onClick={()=>setMissingSubTab(v)} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:missingSubTab===v?(v==="missing"?C.rose:v==="found_person"?C.teal:"#333"):"transparent", color:missingSubTab===v?"#fff":C.text3, fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>{l}</button>
              ))}
            </div>
          </>}
        </div>
      </div>

      {/* ── URGENT BANNER ── */}
      {mainTab==="missing" && urgentCount>0 && missingSubTab!=="found_person" && (
        <div style={{ background:`${C.rose}08`, borderBottom:`1px solid ${C.rose}18`, padding:"10px 22px" }}>
          <div style={{ maxWidth:1040, margin:"0 auto", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ animation:"blink 1s ease infinite", fontSize:18 }}>🚨</span>
            <span style={{ fontSize:13, color:C.rose, fontWeight:600 }}>{urgentCount} trường hợp khẩn cấp cần sự giúp đỡ ngay lập tức</span>
            <button onClick={()=>setFaceSearch(true)} style={{ marginLeft:"auto", background:`${C.rose}18`, border:`1px solid ${C.rose}35`, borderRadius:8, padding:"6px 13px", color:C.rose, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Tôi có thể giúp →</button>
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main style={{ maxWidth:1040, margin:"0 auto", padding:"24px 22px 60px" }}>
        {mainTab==="items" ? <>
          <div style={{ marginBottom:14, color:"#3A3A3A", fontSize:12 }}>
            Tìm thấy <strong style={{ color:"#aaa" }}>{filteredItems.length}</strong> kết quả{search&&<span style={{ color:C.text3 }}> cho "<span style={{ color:"#ccc" }}>{search}</span>"</span>}
          </div>
          {filteredItems.length===0 ? <Empty icon="🔍" text="Không tìm thấy kết quả phù hợp"/> :
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
              {filteredItems.map(item=><ItemCard key={item.id} item={item} onClick={()=>setDetailItem(item)}/>)}
            </div>}
        </> : <>
          <div style={{ marginBottom:14, color:"#3A3A3A", fontSize:12 }}>
            <strong style={{ color:"#aaa" }}>{filteredMissing.length}</strong> hồ sơ{search&&<span style={{ color:C.text3 }}> khớp với "<span style={{ color:"#ccc" }}>{search}</span>"</span>}
          </div>
          {filteredMissing.length===0 ? <Empty icon="👤" text="Không tìm thấy hồ sơ phù hợp"/> :
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
              {filteredMissing.map(p=><MissingCard key={p.id} person={p} onClick={()=>setDetailMissing(p)}/>)}
            </div>}

          {/* Bottom CTA */}
          <div style={{ marginTop:32, background:`linear-gradient(135deg,${C.rose}0A,${C.roseDark}05)`, border:`1px solid ${C.rose}22`, borderRadius:16, padding:"22px 26px", display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontWeight:800, fontSize:16, marginBottom:5 }}>Bạn gặp người có vẻ bị lạc?</div>
              <div style={{ fontSize:13, color:C.text3, lineHeight:1.5 }}>Chụp ảnh và để AI tự động đối chiếu với hồ sơ người đang tìm kiếm. Chỉ mất vài giây.</div>
            </div>
            <button onClick={()=>setFaceSearch(true)} style={{ ...S.btn(`linear-gradient(135deg,${C.rose},${C.roseDark})`), width:"auto", padding:"13px 22px", whiteSpace:"nowrap" }}>
              🔎 Đối chiếu ảnh ngay
            </button>
          </div>
        </>}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background:C.bg1, borderTop:`1px solid ${C.border}`, padding:"24px 22px" }}>
        <div style={{ maxWidth:1040, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:20, marginBottom:20 }}>
            <div>
              <div style={{ fontWeight:900, fontSize:18, marginBottom:6 }}>TìmĐồ<span style={{ color:C.accent }}>.vn</span></div>
              <div style={{ fontSize:13, color:C.text3, maxWidth:280, lineHeight:1.6 }}>Nền tảng cộng đồng giúp tìm lại đồ vật thất lạc và kết nối người thân với nhau.</div>
            </div>
            <div style={{ display:"flex", gap:40, flexWrap:"wrap" }}>
              {[["Tính năng",["🔍 Tìm đồ vật","👤 Tìm người thân","🤖 AI Nhận diện","🔎 Đối chiếu ảnh"]],["Hỗ trợ",["📞 Hotline: 1800 9999","📧 help@timdovn","🌐 FAQ","💬 Chat hỗ trợ"]]].map(([title,links])=>(
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

      {/* ── MODALS ── */}
      {detailItem && <ItemDetail item={detailItem} onClose={()=>setDetailItem(null)}/>}
      {detailMissing && <MissingDetail person={detailMissing} onClose={()=>setDetailMissing(null)} onFaceSearch={()=>{setDetailMissing(null);setFaceSearch(true);}}/>}
      {postItem && <PostItemModal onClose={()=>setPostItem(false)} onAdd={addItem}/>}
      {postMissing && <PostMissingModal onClose={()=>setPostMissing(false)} onAdd={addMissing}/>}
      {faceSearch && <FaceMatchModal onClose={()=>setFaceSearch(false)} missing={missing.filter(m=>m.type==="missing")}/>}
      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onLogin={u=>{setUser(u);setShowLogin(false);}}/>}
      {showNotif && <NotifPanel onClose={()=>setShowNotif(false)} user={user}/>}
      {showMap && <MapModal onClose={()=>setShowMap(false)} items={items} missing={missing}/>}
    </div>
  );
}