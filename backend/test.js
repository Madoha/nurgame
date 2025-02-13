const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Создаем новый PDF-документ
const doc = new PDFDocument({ size: 'A4', margins: { top: 50, left: 50, right: 50, bottom: 50 } });

// Путь к директории для хранения сертификатов
const certificatesDir = path.join(__dirname, '../certificates');

// Проверяем и создаем директорию, если она не существует
if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
}

// Формируем путь для сохранения PDF-сертификата
const certificatePath = path.join(certificatesDir, `certificate_1.pdf`);

// Поток для записи PDF-файла
const writeStream = fs.createWriteStream(certificatePath);

writeStream.on('error', (err) => {
    console.error('Ошибка при записи PDF:', err);
});

// Привязываем поток записи к документу
doc.pipe(writeStream);

/**
 * Центрированное отображение текста в документе
 * @param {PDFDocument} doc - Экземпляр PDF-документа
 * @param {string} text - Текст для отображения
 * @param {number} fontSize - Размер шрифта
 * @param {number} y - Координата Y для размещения текста
 */
function drawCenteredText(doc, text, fontSize, y) {
    doc.fontSize(fontSize).text(text, 0, y, { align: 'center', width: doc.page.width });
}

// Установка фона (если доступен файл изображения)
const backgroundPath = path.join(__dirname, '../certificates/cert-bg.png');
if (fs.existsSync(backgroundPath)) {
    doc.image(backgroundPath, 0, 0, { width: doc.page.width, height: doc.page.height });
}

// Добавление декоративной рамки
const borderPadding = 20;
doc.rect(borderPadding, borderPadding, doc.page.width - 2 * borderPadding, doc.page.height - 2 * borderPadding)
   .strokeColor('#000')
   .lineWidth(2)
   .stroke();

// Расстояние между элементами
const lineSpacing = 40;
let currentY = 200; // Начальная позиция по вертикали

// Добавляем текст в PDF-документ
try {
    drawCenteredText(doc, 'Certificate of Completion', 30, currentY);

    currentY += lineSpacing + 20;
    drawCenteredText(doc, `Congratulations, Ktotoot Kogatata!`, 20, currentY);

    currentY += lineSpacing;
    drawCenteredText(doc, `You have successfully completed the course:`, 18, currentY);

    currentY += lineSpacing;
    drawCenteredText(doc, 'Fight Against Corruption', 18, currentY);

    currentY += lineSpacing;
    drawCenteredText(doc, `Completion Date: ${new Date().toLocaleDateString()}`, 14, currentY);

    currentY += lineSpacing + 50;
    drawCenteredText(doc, 'Authorized Signature', 12, currentY - 5);
    drawCenteredText(doc, 'Nurgame devs', 12, currentY + 15);
    doc.moveTo(doc.page.width / 2 - 100, currentY + 30).lineTo(doc.page.width / 2 + 100, currentY + 30).stroke(); // Линия для подписи

    // Добавляем изображение штампа внизу справа
    const stampPath = path.join(__dirname, '../certificates/pechat.png');
    if (fs.existsSync(stampPath)) {
        const stampWidth = 100;
        const stampHeight = 100;
        const stampX = doc.page.width - stampWidth - 50;
        const stampY = doc.page.height - stampHeight - 150;
        doc.image(stampPath, stampX, stampY, { width: stampWidth, height: stampHeight });
    }

} catch (err) {
    console.error('Ошибка при добавлении текста в PDF:', err);
}

// Завершаем создание PDF-документа
try {
    doc.end();
    console.log('Сертификат успешно создан:', certificatePath);
} catch (err) {
    console.error('Ошибка при завершении PDF-документа:', err);
}
