// app.js
// ฟังก์ชันทำงานหน้าเว็บ (ใช้ตัวแปร files จาก fileData.js)

function checkPass() {
    const input = document.getElementById("password");
    const loginBox = document.getElementById("loginBox");
    const p = input.value.trim();

    // หา record ที่รหัสผ่านตรง
    const file = files.find(x => x.pass === p);

    if (file) {
        // เติมข้อมูลลงป๊อปอัพ
        document.getElementById("infoPass").innerText   = file.pass;
        document.getElementById("infoAuthor").innerText = file.author;
        document.getElementById("infoDate").innerText   = file.date;
        document.getElementById("infoLink").innerText   = file.url;

        // ตั้งลิ้งให้ปุ่มดาวน์โหลด
        document.getElementById("downloadBtn").href = file.url;

        // แสดงป๊อปอัพ
        document.getElementById("popup").style.display = "flex";
        input.value = "";
    } else {
        // animation เขย่า + แจ้งเตือน
        loginBox.classList.remove("error-shake");
        void loginBox.offsetWidth; // รีเซ็ต animation
        loginBox.classList.add("error-shake");
        alert("❌ รหัสผ่านไม่ถูกต้อง");
    }
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}
