/*
  questions.js for 60‑question quiz
  --------------------------------
  This file exports an array of 60 question objects. Each object
  contains:
    - category: the question category (e.g., คณิตศาสตร์, ภาษาไทย)
    - question: the text of the question
    - options: an array of possible answers
    - answer: the index (0‑based) of the correct answer within options
  Questions are grouped by category and increase gradually in
  difficulty.
*/

const questions = [
  // หมวดภาษาอังกฤษ (English Language) – only 5 easiest questions retained
  { category: 'ภาษาอังกฤษ', question: 'What is the plural form of "child"?', options: ['childs', 'children', 'childes', 'childrens'], answer: 1 },
  { category: 'ภาษาอังกฤษ', question: 'Choose the correct form: "She ___ to school every day."', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
  { category: 'ภาษาอังกฤษ', question: 'What does the word "digital" mean?', options: ['Relating to numbers and computers', 'Relating to nature', 'Relating to cooking', 'Relating to sports'], answer: 0 },
  { category: 'ภาษาอังกฤษ', question: 'Fill in the blank: "I have ___ friends in my class."', options: ['much', 'many', 'little', 'less'], answer: 1 },
  { category: 'ภาษาอังกฤษ', question: 'Which sentence is grammatically correct?', options: ['He don\'t like coffee.', 'They is playing football.', 'She has finished her homework.', 'We goes to market.'], answer: 2 },

  // หมวดภาษาไทย (Thai Language) – 10 questions
  { category: 'ภาษาไทย', question: 'คำใดต่อไปนี้เป็นคำนาม?', options: ['วิ่ง', 'บ้าน', 'เร็ว', 'เขียน'], answer: 1 },
  { category: 'ภาษาไทย', question: 'อักษรภาษาไทยมีจำนวนกี่ตัว?', options: ['42', '44', '46', '48'], answer: 1 },
  { category: 'ภาษาไทย', question: 'คำว่า "กิน" เป็นคำชนิดใด?', options: ['คำนาม', 'คำกริยา', 'คำวิเศษณ์', 'คำสรรพนาม'], answer: 1 },
  { category: 'ภาษาไทย', question: 'คำที่มีความหมายตรงข้ามกับ "สูง" คืออะไร?', options: ['ต่ำ', 'ลึก', 'หนา', 'กว้าง'], answer: 0 },
  { category: 'ภาษาไทย', question: 'ข้อใดต่อไปนี้เป็นประโยคสมบูรณ์?', options: ['นก บิน', 'พ่อ แม่ ลูก', 'เขาไปโรงเรียน', 'หนังสือสวย'], answer: 2 },
  { category: 'ภาษาไทย', question: 'คำใดต่อไปนี้เป็นคำกริยา?', options: ['ร้อง', 'ช้า', 'บ้าน', 'สวย'], answer: 0 },
  { category: 'ภาษาไทย', question: 'สระภาษาไทยมีทั้งหมดกี่รูป?', options: ['18', '21', '26', '32'], answer: 1 },
  { category: 'ภาษาไทย', question: 'คำว่า "สวยงาม" เป็นคำชนิดใด?', options: ['คำนาม', 'คำวิเศษณ์', 'คำสรรพนาม', 'คำกริยา'], answer: 1 },
  { category: 'ภาษาไทย', question: 'คำว่า "สุข" มีความหมายคล้ายกับคำใด?', options: ['ดี', 'เศร้า', 'พอใจ', 'เครียด'], answer: 2 },
  { category: 'ภาษาไทย', question: 'คำใดอยู่ในมาตราแม่กน?', options: ['ดิน', 'ดาว', 'ค่าย', 'ต้น'], answer: 0 },

  // หมวดภาษาอังกฤษเพิ่มเติมถูกตัดออกเพื่อให้เหลือเพียง 5 ข้อแรก

  // หมวดความรู้ทั่วไป/ดิจิทัล (General Knowledge / Digital Basics)
  { category: 'ความรู้ทั่วไป', question: 'อินเทอร์เน็ตคืออะไร?', options: ['ระบบเครือข่ายระหว่างคอมพิวเตอร์ทั่วโลก', 'เครื่องมือเครื่องใช้ในครัว', 'รายการอาหาร', 'กีฬาประเภทหนึ่ง'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'สมาร์ทโฟนใช้ระบบปฏิบัติการอะไร?', options: ['Windows XP', 'Android', 'MS-DOS', 'UNIX'], answer: 1 },
  { category: 'ความรู้ทั่วไป', question: 'ข้อใดคือหน่วยประมวลผลกลางของคอมพิวเตอร์?', options: ['CPU', 'RAM', 'SSD', 'GPU'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'ใครคือผู้ก่อตั้งบริษัทไมโครซอฟท์?', options: ['สตีฟ จ็อบส์', 'บิลล์ เกตส์', 'มาร์ค ซักเคอร์เบิร์ก', 'แลร์รี่ เพจ'], answer: 1 },
  { category: 'ความรู้ทั่วไป', question: 'ในภาษาโปรแกรม JavaScript เครื่องหมายใดใช้สำหรับการบวกเลข?', options: ['+', '-', '*', '/'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'CPU ย่อมาจากอะไร?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Performance Unit', 'Central Peripheral Unit'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'RAM ทำหน้าที่อะไร?', options: ['เก็บข้อมูลถาวร', 'เก็บข้อมูลชั่วคราว', 'ประมวลผลภาพ', 'เก็บไฟล์เสียง'], answer: 1 },
  { category: 'ความรู้ทั่วไป', question: 'ข้อใดคือระบบปฏิบัติการของคอมพิวเตอร์?', options: ['iOS', 'Android', 'Windows', 'Photoshop'], answer: 2 },
  { category: 'ความรู้ทั่วไป', question: 'อินเทอร์เน็ตใช้โปรโตคอลอะไรในการสื่อสารข้อมูล?', options: ['HTTP', 'FTP', 'TCP/IP', 'SMTP'], answer: 2 },
  { category: 'ความรู้ทั่วไป', question: 'ข้อใดคือเครื่องมือค้นหาบนอินเทอร์เน็ต?', options: ['Google', 'Facebook', 'Twitter', 'Instagram'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'ภาษา HTML ใช้ทำอะไร?', options: ['เขียนเว็บไซต์', 'เขียนโปรแกรมเครื่องมือ', 'ใช้สำหรับคำนวน', 'ใช้ตกแต่งภาพ'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'หน่วยวัดความเร็วของอินเทอร์เน็ตคืออะไร?', options: ['วินาที', 'เมตร', 'เมกะบิตต่อวินาที (Mbps)', 'กิโลกรัม'], answer: 2 },
  { category: 'ความรู้ทั่วไป', question: 'บริษัทใดผลิต iPhone?', options: ['Samsung', 'Apple', 'Huawei', 'Xiaomi'], answer: 1 },
  { category: 'ความรู้ทั่วไป', question: 'ระบบ Cloud computing หมายถึงอะไร?', options: ['การเก็บข้อมูลไว้ในอุปกรณ์ของเรา', 'การเก็บข้อมูลบนเซิร์ฟเวอร์ออนไลน์', 'การเก็บข้อมูลในไดรฟ์ USB', 'การเก็บข้อมูลในสมุดจด'], answer: 1 },
  { category: 'ความรู้ทั่วไป', question: 'คำว่า "AI" ย่อมาจากอะไร?', options: ['Artificial Intelligence', 'Automated Internet', 'Automatic Input', 'Advanced Interface'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'คอมพิวเตอร์ส่วนบุคคลเครื่องแรกของ Apple มีชื่อว่าอะไร?', options: ['Macintosh', 'iMac', 'Apple I', 'Newton'], answer: 2 },
  { category: 'ความรู้ทั่วไป', question: 'ข้อใดคือส่วนประกอบหลักของคอมพิวเตอร์?', options: ['CPU', 'RAM', 'SSD', 'ทั้งหมดข้างต้น'], answer: 3 },
  { category: 'ความรู้ทั่วไป', question: 'E‑commerce หมายถึงอะไร?', options: ['การเรียนออนไลน์', 'การค้าขายผ่านระบบอิเล็กทรอนิกส์', 'การเล่นเกมออนไลน์', 'การค้นหาข้อมูล'], answer: 1 },
  { category: 'ความรู้ทั่วไป', question: 'อุปกรณ์ใดใช้สำหรับป้อนข้อมูลเข้าสู่คอมพิวเตอร์?', options: ['Monitor', 'Keyboard', 'Speaker', 'Printer'], answer: 1 },
  { category: 'ความรู้ทั่วไป', question: 'ข้อใดคือ Social media platform?', options: ['Wikipedia', 'Google Maps', 'Instagram', 'Windows'], answer: 2 },

  // คำถามหมวดดิจิทัลเพิ่มเติม (Digital Knowledge)
  { category: 'ความรู้ทั่วไป', question: 'What is \"URL\" short for?', options: ['Uniform Resource Locator', 'Unique Resource Locator', 'Universal Resource Locator', 'Unified Resource Locator'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'Which company created the Android OS?', options: ['Apple', 'Google', 'Microsoft', 'IBM'], answer: 1 },
  { category: 'ความรู้ทั่วไป', question: 'What does \"HTTP\" stand for?', options: ['HyperText Transfer Protocol', 'HighTech Transfer Protocol', 'HyperTerminal Transfer Protocol', 'Hyperlink Transfer Process'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'Which of these is a web browser?', options: ['Chrome', 'Android', 'Linux', 'Google Drive'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'What is the function of a firewall?', options: ['To block unauthorized access to networks', 'To accelerate CPU', 'To store data', 'To cool down CPU'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'Which of the following is an email protocol?', options: ['SMTP', 'HTML', 'PHP', 'FTP'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'Blockchain technology is associated with:', options: ['Cryptocurrencies', 'Social media', 'Operating systems', 'Word processors'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'The largest social media network by number of users (as of early 2024) is:', options: ['Facebook', 'Twitter', 'TikTok', 'LinkedIn'], answer: 0 },
  { category: 'ความรู้ทั่วไป', question: 'Which company developed the search engine known as Bing?', options: ['Google', 'Apple', 'Microsoft', 'Yahoo'], answer: 2 },
  { category: 'ความรู้ทั่วไป', question: 'What does the acronym \"IoT\" stand for?', options: ['Internet of Travel', 'Internet of Things', 'Input of Technology', 'Interface of Things'], answer: 1 },

  // หมวดไอที (IT) – เพิ่มรูปประกอบสำหรับทุกข้อในหมวดนี้
  { category: 'ไอที', question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Structured Question Language', 'Standard Query List'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'Which of these is a programming language?', options: ['HTML', 'CSS', 'JavaScript', 'XML'], answer: 2, image: 'img/banner.png' },
  { category: 'ไอที', question: 'What does API stand for?', options: ['Application Programming Interface', 'Automated Program Integration', 'Advanced Programming Interaction', 'Application Performance Interface'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'Which one is an open-source operating system?', options: ['Windows', 'macOS', 'Linux', 'iOS'], answer: 2, image: 'img/banner.png' },
  { category: 'ไอที', question: 'In networking, what does LAN stand for?', options: ['Local Area Network', 'Large Application Network', 'Long Access Network', 'Low Access Node'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'Which database management system is relational?', options: ['MySQL', 'MongoDB', 'Cassandra', 'Redis'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'What is the purpose of version control systems like Git?', options: ['To manage code versions', 'To design hardware', 'To edit videos', 'To compile software'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'Which of these is a cloud computing platform?', options: ['AWS', 'Microsoft Office', 'Adobe Photoshop', 'Firefox'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'What is encryption used for in IT?', options: ['To protect data by converting it into a code', 'To accelerate processors', 'To store backup', 'To design graphics'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'Which of these is a back-end programming language?', options: ['HTML', 'CSS', 'JavaScript', 'Python'], answer: 3, image: 'img/banner.png' },
  { category: 'ไอที', question: 'What does the term "Big Data" refer to?', options: ['Large datasets that cannot be easily processed by traditional tools', 'Small datasets stored in a database', 'Fast networks', 'Modern microchips'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'Which protocol secures communications over the internet?', options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'], answer: 1, image: 'img/banner.png' },
  { category: 'ไอที', question: 'What is "Machine Learning"?', options: ['A subfield of AI that enables systems to learn from data', 'A new type of web browser', 'A programming language', 'A type of CPU'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'What is RAID used for?', options: ['To combine multiple hard drives for redundancy/performance', 'To remove viruses', 'To compress files', 'To connect to the internet'], answer: 0, image: 'img/banner.png' },
  { category: 'ไอที', question: 'Docker is a tool used for:', options: ['Containerization of applications', 'Database design', 'Network encryption', 'CPU benchmarking'], answer: 0, image: 'img/banner.png' }
];