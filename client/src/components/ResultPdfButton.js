import React from "react";
import jsPDF from "jspdf";

const ResultPdfButton = ({ result }) => {
  const download = () => {
    const doc = new jsPDF();
    doc.text(`Student: ${result.student_name}`, 20, 20);
    doc.text(`GPA: ${result.gpa} | CGPA: ${result.cgpa}`, 20, 30);
    let y = 45;
    result.records.forEach((r) => {
      doc.text(`${r.course_code} | ${r.marks} | ${r.grade} | ${r.result_status}`, 20, y);
      y += 10;
    });
    doc.save(`${result.student_name}-result.pdf`);
  };

  return (
    <button className="btn" onClick={download}>
      Download PDF
    </button>
  );
};

export default ResultPdfButton;
