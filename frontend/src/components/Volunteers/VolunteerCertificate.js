import React from "react";
import { Download, Award, Star, Trophy } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const VolunteerCertificate = ({ volunteer, rank, onDownload }) => {
  const generateCertificate = () => {
    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Set background color (dark theme)
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Add gold accents
    doc.setFillColor(255, 215, 0);
    doc.rect(0, 0, pageWidth, 8, "F"); // Top border
    doc.rect(0, pageHeight - 8, pageWidth, 8, "F"); // Bottom border
    doc.rect(0, 0, 8, pageHeight, "F"); // Left border
    doc.rect(pageWidth - 8, 0, 8, pageHeight, "F"); // Right border

    // Add diagonal gold stripes in corners
    doc.setFillColor(255, 215, 0);
    for (let i = 0; i < 5; i++) {
      doc.rect(15 + i * 3, 15 + i * 3, 20, 3, "F"); // Top-left
      doc.rect(pageWidth - 35 - i * 3, 15 + i * 3, 20, 3, "F"); // Top-right
      doc.rect(15 + i * 3, pageHeight - 35 - i * 3, 20, 3, "F"); // Bottom-left
      doc.rect(pageWidth - 35 - i * 3, pageHeight - 35 - i * 3, 20, 3, "F"); // Bottom-right
    }

    // Award seal (top-left)
    doc.setFillColor(255, 215, 0);
    doc.circle(35, 35, 25, "F");
    doc.setFillColor(30, 30, 30);
    doc.circle(35, 35, 20, "F");

    // Award text in seal
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FIXPOINT", 35, 30, { align: "center" });
    doc.text("AWARD", 35, 40, { align: "center" });

    // Add stars below award
    for (let i = 0; i < 5; i++) {
      const x = 25 + i * 4;
      const y = 50;
      doc.setFillColor(255, 215, 0);
      doc.circle(x, y, 1.5, "F");
    }

    // Main certificate title
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE", pageWidth / 2, 80, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("OF APPRECIATION", pageWidth / 2, 95, { align: "center" });

    // Presented to text
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PROUDLY PRESENTED TO", pageWidth / 2, 120, { align: "center" });

    // Volunteer name
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(volunteer.fullName, pageWidth / 2, 145, { align: "center" });

    // Underline for name
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 40, 150, pageWidth / 2 + 40, 150);

    // Certificate description
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const description = `For outstanding contributions to the community through the FixPoint platform. 
    This volunteer has demonstrated exceptional dedication and commitment to improving our community.`;

    // Split description into lines
    const splitDescription = doc.splitTextToSize(description, pageWidth - 60);
    doc.text(splitDescription, pageWidth / 2, 180, { align: "center" });

    // Achievement details
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ACHIEVEMENT DETAILS", pageWidth / 2, 210, { align: "center" });

    // Create achievement table
    const achievementData = [
      ["Rank", "Completed Tasks", "Total Tasks", "Success Rate"],
      [
        `#${rank}`,
        `${volunteer.completedTasks}`,
        `${volunteer.totalTasks}`,
        `${volunteer.successRate}%`,
      ],
    ];

    autoTable(doc, {
      startY: 220,
      head: [achievementData[0]],
      body: [achievementData[1]],
      theme: "plain",
      styles: {
        fillColor: [255, 215, 0],
        textColor: [30, 30, 30],
        fontSize: 12,
        fontStyle: "bold",
        halign: "center",
      },
      headStyles: {
        fillColor: [255, 215, 0],
        textColor: [30, 30, 30],
        fontSize: 12,
        fontStyle: "bold",
        halign: "center",
      },
      margin: { left: pageWidth / 2 - 60, right: pageWidth / 2 - 60 },
    });

    // Signature and date lines
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Date line
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(0.5);
    doc.line(30, pageHeight - 60, 80, pageHeight - 60);
    doc.text("Date", 55, pageHeight - 50, { align: "center" });

    // Signature line
    doc.line(pageWidth - 80, pageHeight - 60, pageWidth - 30, pageHeight - 60);
    doc.text("FixPoint Team", pageWidth - 55, pageHeight - 50, {
      align: "center",
    });

    // FixPoint branding
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FixPoint", pageWidth / 2, pageHeight - 30, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Empowering Communities Through Technology",
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );

    // Save the PDF
    const fileName = `FixPoint_Certificate_${volunteer.fullName.replace(
      /\s+/g,
      "_"
    )}.pdf`;
    doc.save(fileName);

    if (onDownload) {
      onDownload(fileName);
    }
  };

  return (
    <button
      className="certificate-download-btn"
      onClick={generateCertificate}
      title="Download Certificate"
    >
      <Download size={16} />
      Download Certificate
    </button>
  );
};

export default VolunteerCertificate;
