// =====================================================================
// Nhận diện khuôn mặt chạy TRỰC TIẾP TRONG TRÌNH DUYỆT (thư viện @vladmandic/face-api).
// - Ảnh KHÔNG được gửi đi đâu để nhận diện. Chỉ "vector khuôn mặt" (128 số) được gửi lên server.
// - Mô hình (~12MB) nằm ở thư mục public/models và chỉ được tải khi người dùng chọn ảnh lần đầu.
// - Hai vector càng gần nhau (khoảng cách Euclid nhỏ) thì hai khuôn mặt càng giống nhau.
//   Việc so sánh được thực hiện trong database (hàm post_missing / search_face).
// =====================================================================

const MODEL_URL = "/models";
let loading = null;

/** Tải thư viện + mô hình (chỉ tải một lần, các lần sau dùng lại). */
export function loadFaceModels() {
  if (!loading) {
    loading = (async () => {
      const faceapi = await import("@vladmandic/face-api");
      // Chọn "động cơ" tính toán: ưu tiên GPU (webgl), nếu không được thì dùng CPU.
      // (Không dùng wasm vì cần thêm tệp .wasm riêng.)
      let ready = false;
      for (const be of ["webgl", "cpu"]) {
        try {
          if (await faceapi.tf.setBackend(be)) { await faceapi.tf.ready(); ready = true; break; }
        } catch { /* thử động cơ tiếp theo */ }
      }
      if (!ready) throw new Error("Trình duyệt không hỗ trợ nhận diện khuôn mặt");
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      return faceapi;
    })().catch((e) => { loading = null; throw e; });
  }
  return loading;
}

/** Đọc ảnh từ data URL / URL thành phần tử <img> đã giải mã. */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không đọc được ảnh"));
    img.src = src;
  });
}

/** Vẽ ảnh vào canvas, thu nhỏ để cạnh dài nhất <= maxSide (nhanh hơn, ít tốn bộ nhớ). */
export function toCanvas(img, maxSide) {
  const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height;
  const k = Math.min(1, maxSide / Math.max(w0, h0));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w0 * k));
  canvas.height = Math.max(1, Math.round(h0 * k));
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Tìm khuôn mặt trong ảnh và tính vector 128 số.
 * Trả về { ok:true, descriptor:number[128], faces, tooSmall } hoặc { ok:false, reason:"no_face" }.
 * Nếu ảnh có nhiều khuôn mặt, chọn khuôn mặt lớn nhất.
 */
export async function computeFace(src) {
  const faceapi = await loadFaceModels();
  const img = await loadImage(src);
  const canvas = toCanvas(img, 1024);
  const results = await faceapi
    .detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5, maxResults: 10 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  if (!results.length) return { ok: false, reason: "no_face" };
  const best = results.reduce((a, b) => (b.detection.box.area > a.detection.box.area ? b : a));
  const descriptor = Array.from(best.descriptor).map((x) => Math.round(x * 1e5) / 1e5);
  return {
    ok: true,
    descriptor,
    faces: results.length,
    tooSmall: best.detection.box.width < 70,   // khuôn mặt nhỏ hơn 70 điểm ảnh -> kém chính xác
    score: best.detection.score,
  };
}

/** Nén ảnh về JPEG (cạnh dài <= maxSide) để tải lên kho ảnh. Trả về Blob. */
export async function compressToJpegBlob(src, maxSide = 800, quality = 0.82) {
  const img = await loadImage(src);
  const canvas = toCanvas(img, maxSide);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không nén được ảnh"))), "image/jpeg", quality);
  });
}

/** Nén ảnh về JPEG dạng data URL (dùng khi cần gửi ảnh nhỏ cho AI mô tả). */
export async function compressToDataUrl(src, maxSide = 800, quality = 0.82) {
  const img = await loadImage(src);
  return toCanvas(img, maxSide).toDataURL("image/jpeg", quality);
}

/** Khoảng cách Euclid giữa hai vector (dùng để kiểm thử/so sánh trên trình duyệt). */
export function faceDistance(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}
