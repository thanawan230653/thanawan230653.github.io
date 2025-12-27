// fileData.js
// เก็บข้อมูลรหัสผ่าน + ไฟล์ไว้ไฟล์นี้

// รูปแบบ: password<จัดทำโดย<วันที่อัพ<ลิ้ง
const fileData = `
2845<PAT Server Team<2025-12-01<https://example.com/file1.zip
7777<PAT DataCenter<2025-12-05<https://example.com/file2.zip
3333<Pigcee Lab<2025-12-10<https://drive.google.com/file/d/1jU9uIX-hIOV2jdcgFDgBLmHxo7DSvBIR/view?usp=sharing
`.trim();

// แปลง string เป็น array ของ object
const files = fileData.split("\n").map(line => {
    const [pass, author, date, url] = line.split("<");
    return {
        pass: pass.trim(),
        author: author.trim(),
        date: date.trim(),
        url: url.trim()
    };
});
