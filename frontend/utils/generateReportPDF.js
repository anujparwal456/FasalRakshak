import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

import { DEVANAGARI_FONT_BASE64 } from "./devanagariFont";
import { LOGO_BASE64 } from "./logoBase64";

export const generateReportPDF = async (data) => {
    // 🔥 UTF-8 Encoding Fix - Ensures clean text without garbage characters
    const sanitizeText = (text) => {
        if (!text) return "";
        return String(text).trim().replace(/[^\x00-\x7F]/g, (char) => {
            // Keep Unicode but encode properly
            return char;
        });
    };

    // 1. Data Sanitization (Use Gemini data if available, with fallbacks)
    const reportData = {
        reportId: data?.reportId || "N/A",
        date: data?.date || new Date().toLocaleDateString(),
        plant: sanitizeText(data?.plant) || "Unknown",
        disease: sanitizeText(data?.disease) || "No disease detected",
        confidence: Math.round(data?.confidence) || 0,
        severity: sanitizeText(data?.severity) || "Medium",
        description: sanitizeText(data?.description) || "Plant disease analysis",
        recommendations: (data?.recommendations || []).map(r => sanitizeText(r)),
        image: data?.image || null
    };

    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    /* ================= ASSETS ================= */
    doc.addFileToVFS("NotoSerifDevanagari.ttf", DEVANAGARI_FONT_BASE64);
    doc.addFont("NotoSerifDevanagari.ttf", "NotoSerifDevanagari", "normal");
    doc.addFont("NotoSerifDevanagari.ttf", "NotoSerifDevanagari", "bold");

    const qrImage = await QRCode.toDataURL(
        process.env.NEXT_PUBLIC_SITE_URL || "https://fasalrakshak.com",
        { margin: 1, width: 200 }
    );

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    const translations = {
        en: {
            font: "helvetica",
            title: "OFFICIAL PLANT DISEASE DETECTION REPORT",
            subtitle: "AI-POWERED CROP HEALTH ANALYSIS - GOVERNMENT OF INDIA INITIATIVE",
            details: "Report Details",
            analysis: "Disease Analysis & Image",
            remedies: "Recommended Actions",
            disclaimer: "Official Disclaimer",
            disclaimerText: "This report is generated using AI analysis. Consult experts before major decisions.",
            qrText: "Scan to verify report online",
            conf: "Confidence Level",
            labels: ["Report ID:", "Date:", "Crop:", "Disease:", "Severity:"],
            tableHead: ["#", "Instruction Details"]
        },
        hi: {
            font: "NotoSerifDevanagari",
            title: "आधिकारिक पादप रोग पहचान रिपोर्ट",
            subtitle: "एआई-संचालित फसल स्वास्थ्य विश्लेषण - भारत सरकार की एक पहल",
            details: "रिपोर्ट का विस्तृत विवरण",
            analysis: "रोग विश्लेषण और फसल की स्थिति",
            remedies: "निवारक उपाय और अनुशंसित कदम",
            disclaimer: "आधिकारिक अस्वीकरण",
            disclaimerText: "यह रिपोर्ट पूर्णतः एआई (कृत्रिम बुद्धिमत्ता) द्वारा तैयार की गई है। कोई भी महत्वपूर्ण निर्णय लेने से पहले कृपया कृषि विशेषज्ञों से परामर्श अवश्य लें।",
            qrText: "सत्यापन हेतु स्कैन करें",
            conf: "सटीकता का स्तर",
            labels: ["रिपोर्ट संख्या:", "दिनांक:", "फसल का प्रकार:", "रोग की पहचान:", "गंभीरता:"],
            tableHead: ["क्रम", "निवारक कदम / अनुशंसित निर्देश"]
        },
    };

    /* ================= HELPERS ================= */
    const drawOfficialDecorations = () => {
        // Page Borders
        doc.setDrawColor(46, 125, 50);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
        doc.setLineWidth(0.1);
        doc.rect(6.5, 6.5, pageWidth - 13, pageHeight - 13);

        // WATERMARK (Fixed visibility at 0.4 opacity)
        doc.setGState(new doc.GState({ opacity: 0.4 }));
        const size = 110;
        doc.addImage(`data:image/png;base64,${LOGO_BASE64}`, "PNG", (pageWidth - size) / 2, (pageHeight - size) / 2, size, size);
        doc.setGState(new doc.GState({ opacity: 2 }));
    };

    const drawConfidenceBar = (x, y, percentage) => {
        const barWidth = 50;
        const barHeight = 5;
        doc.setFillColor(230, 230, 230);
        doc.rect(x, y, barWidth, barHeight, "F");
        const fillWidth = (barWidth * (percentage > 100 ? 100 : percentage)) / 100;
        doc.setFillColor(46, 125, 50);
        doc.rect(x, y, fillWidth, barHeight, "F");
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.text(`${percentage}%`, x + barWidth + 2, y + 4);
    };

    /* ================= GENERATOR ================= */
    const generatePage = (lang) => {
        const t = translations[lang];
        const font = t.font;
        let y = 25;

        drawOfficialDecorations();

        // Top Header
        doc.addImage(`data:image/png;base64,${LOGO_BASE64}`, "PNG", margin, 12, 22, 22);
        doc.setFont(font, "bold");
        doc.setFontSize(14);
        doc.setTextColor(20, 60, 20);
        doc.text(String(t.title), pageWidth / 2 + 10, y, { align: "center" });
        doc.setFontSize(7.5);
        doc.setFont(font, "normal");
        doc.text(String(t.subtitle), pageWidth / 2 + 10, y + 5, { align: "center" });

        y = 42;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);

        // Grid: Details Table
        doc.setFont(font, "bold");
        doc.setFontSize(11);
        doc.text(String(t.details), margin, y + 8);

        autoTable(doc, {
            startY: y + 10,
            margin: { left: margin },
            tableWidth: contentWidth / 1.6,
            theme: "plain",
            styles: { font: font, fontSize: 9 },
            body: [
                [String(t.labels[0]), String(reportData.reportId)],
                [String(t.labels[1]), String(reportData.date)],
                [String(t.labels[2]), String(reportData.plant)],
                [String(t.labels[3]), String(reportData.disease)],
                [String(t.labels[4]), String(reportData.severity)],
            ],
        });

        // Confidence Level & Image Box
        const sideX = margin + (contentWidth / 1.6) + 5;
        doc.setFont(font, "bold");
        doc.setFontSize(9);
        doc.text(String(t.conf), sideX, y + 20);
        drawConfidenceBar(sideX, y + 22, reportData.confidence);

        if (reportData.image) {
            doc.setDrawColor(46, 125, 50);
            doc.rect(sideX, y + 33, 48, 38);
            doc.addImage(reportData.image, "JPEG", sideX + 1, y + 34, 46, 36);
        }

        y = doc.lastAutoTable.finalY + 15;

        // Disease Analysis
        doc.setFont(font, "bold");
        doc.setFontSize(11);
        doc.text(String(t.analysis), margin, y);
        doc.setFont(font, "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(50);
        const splitDesc = doc.splitTextToSize(String(reportData.description), contentWidth);
        doc.text(splitDesc, margin, y + 6);

        y += (splitDesc.length * 5) + 10;

        // PAGE BREAK SAFETY CHECK
        if (y > pageHeight - 110) {
            doc.addPage();
            y = 20;
            drawOfficialDecorations();
        }

        // Recommendations
        doc.setFont(font, "bold");
        doc.text(String(t.remedies), margin, y);

        autoTable(doc, {
            startY: y + 3,
            margin: { left: margin, bottom: 65 }, // High bottom margin prevents overlap
            theme: "striped",
            head: [[t.tableHead[0], t.tableHead[1]]],
            headStyles: { fillColor: [46, 125, 50] },
            styles: { font: font, fontSize: 9 },
            body: reportData.recommendations.map((r, i) => [i + 1, r]),
        });

        /* ===== FIXED AREA: FOOTER & DISCLAIMER (Prevents Overlap) ===== */
        const footerY = pageHeight - 45;

        // THE FIX: Draw a white rectangle to clear the background before drawing the footer
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, footerY - 5, contentWidth, 42, "F");

        doc.setDrawColor(200);
        doc.line(margin, footerY, pageWidth - margin, footerY);

        doc.setFont(font, "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(20, 60, 20);
        doc.text(String(t.disclaimer), margin, footerY + 7);

        doc.setFont(font, "normal");
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text(String(t.disclaimerText), margin, footerY + 12, { maxWidth: contentWidth - 45 });

        // QR Code
        doc.addImage(qrImage, "PNG", pageWidth - margin - 25, footerY + 5, 25, 25);
        doc.setFontSize(7);
        doc.text(String(t.qrText), pageWidth - margin - 12.5, footerY + 33, { align: "center" });

        // metadata
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`Ref: FR-${reportData.reportId} | System AI Report | Page ${doc.internal.getNumberOfPages()}`, margin, pageHeight - 8);
    };

    /* ================= EXECUTION ================= */
    generatePage("en");
    doc.addPage();
    generatePage("hi");

    doc.save(`FasalRakshak_Official_Report_${reportData.reportId}.pdf`);
};