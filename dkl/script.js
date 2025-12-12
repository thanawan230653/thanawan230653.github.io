// ข้อมูลไฟล์ที่ถูกป้องกันด้วยรหัสผ่าน
const FILE_DATA = {
    password: "1234", // รหัสผ่าน (ควรเปลี่ยนให้ซับซ้อนขึ้น)
    author: "ทีมงาน A",
    date: "2025-12-12",
    link: "https://example.com/your-secret-file.zip" // ลิ้งค์ดาวน์โหลดจริง
};

// ฟังก์ชันสำหรับตรวจสอบรหัสผ่าน
function checkPassword() {
    const enteredPassword = document.getElementById('filePassword').value;
    const detailsDiv = document.getElementById('fileDetails');
    
    // ตรวจสอบรหัสผ่าน
    if (enteredPassword === FILE_DATA.password) {
        // รหัสผ่านถูกต้อง
        
        // 1. แสดงรายละเอียดในหน้า
        document.getElementById('infoAuthor').textContent = FILE_DATA.author;
        document.getElementById('infoDate').textContent = FILE_DATA.date;
        document.getElementById('infoLink').textContent = FILE_DATA.link;

        // 2. แสดง Pop-up (ใช้ window.alert หรือ custom modal)
        alert(
            "✅ รหัสผ่านถูกต้อง! รายละเอียดไฟล์:\n" +
            "จัดทำโดย: " + FILE_DATA.author + "\n" +
            "วันที่อัพ: " + FILE_DATA.date + "\n" +
            "ลิ้งค์: " + FILE_DATA.link 
        );

        // 3. แสดงส่วนรายละเอียดไฟล์และปุ่มดาวน์โหลด
        detailsDiv.classList.remove('hidden');

        // 4. กำหนด Listener ให้ปุ่มดาวน์โหลด
        document.getElementById('downloadButton').onclick = function() {
            // เปิดหน้าต่างใหม่เพื่อเริ่มดาวน์โหลด
            window.open(FILE_DATA.link, '_blank'); 
        };

    } else {
        // รหัสผ่านไม่ถูกต้อง
        alert("❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        detailsDiv.classList.add('hidden'); // ซ่อนรายละเอียดอีกครั้งถ้าแสดงอยู่
    }
}
