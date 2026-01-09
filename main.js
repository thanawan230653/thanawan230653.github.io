// กำหนด password หลักที่ JS จะใช้ตรวจ
// แก้ค่าตรงนี้ได้ตามที่ต้องการ
const MASTER_PASSWORD = "1234";

const form      = document.getElementById("downloadForm");
const overlay   = document.getElementById("popupOverlay");

const showPassword = document.getElementById("showPassword");
const showAuthor   = document.getElementById("showAuthor");
const showDate     = document.getElementById("showDate");
const showLink     = document.getElementById("showLink");

const downloadBtn  = document.getElementById("downloadBtn");
const cancelBtn    = document.getElementById("cancelBtn");

// เมื่อกด submit ฟอร์ม
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const password = document.getElementById("password").value.trim();
  const author   = document.getElementById("author").value.trim();
  const date     = document.getElementById("date").value;
  const link     = document.getElementById("link").value.trim();

  // 1) เช็ครหัสผ่าน
  if (password !== MASTER_PASSWORD) {
    alert("รหัสผ่านไม่ถูกต้อง");
    return;
  }

  // 2) เตรียมข้อมูลแบ่งช่วง: password < จัดทำโดย < วันที่อัพ < ลิ้ง
  showPassword.textContent = "Password: " + password;
  showAuthor.textContent   = "จัดทำโดย: " + author;
  showDate.textContent     = "วันที่อัพโหลด: " + (date || "-");
  showLink.textContent     = "ลิ้ง: " + link;

  // 3) เซ็ตลิงก์ให้ปุ่มดาวน์โหลด
  downloadBtn.href = link;

  // 4) แสดงป๊อปอัพ
  overlay.classList.add("active");
});

// ปิดป๊อปอัพ (ปุ่มยกเลิก)
cancelBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
});

// คลิกพื้นหลังเทา ๆ ด้านนอก เพื่อปิด
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.remove("active");
  }
});
