import jsPDF from 'jspdf';
import { GeneratedPaper } from '@/types';

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  challenging: 'Challenging',
};

export function exportPaperToPDF(paper: GeneratedPaper): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 20;

  const addPageIfNeeded = (height: number) => {
    if (y + height > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(paper.schoolName, W / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(12);
  doc.text(`Subject: ${paper.subject}`, W / 2, y, { align: 'center' });
  y += 6;
  doc.text(`Class: ${paper.className}`, W / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Time Allowed: ${paper.timeAllowed}`, margin, y);
  doc.text(`Maximum Marks: ${paper.maxMarks}`, W - margin, y, { align: 'right' });
  y += 5;

  doc.line(margin, y, W - margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.text('All questions are compulsory unless stated otherwise.', margin, y);
  y += 8;

  // Student info
  doc.setFont('helvetica', 'normal');
  doc.text('Name: ___________________________', margin, y);
  doc.text('Roll Number: ___________', W / 2 + 5, y);
  y += 6;
  doc.text('Class: _____ Section: _____', margin, y);
  y += 10;

  // Sections
  for (const section of paper.sections) {
    addPageIfNeeded(15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(section.instruction, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    let qNum = 1;
    for (const q of section.questions) {
      const diffLabel = DIFFICULTY_LABELS[q.difficulty] || q.difficulty;
      const qLine = `${qNum}. [${diffLabel}] ${q.text} [${q.marks} Marks]`;
      const lines = doc.splitTextToSize(qLine, contentW);
      addPageIfNeeded(lines.length * 5 + 4);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, margin, y);
      y += lines.length * 5;

      if (q.options?.length) {
        for (const opt of q.options) {
          const optLines = doc.splitTextToSize(opt, contentW - 10);
          addPageIfNeeded(optLines.length * 4 + 2);
          doc.text(optLines, margin + 8, y);
          y += optLines.length * 4;
        }
      }
      y += 4;
      qNum++;
    }
    y += 4;
  }

  // Answer Key
  doc.addPage();
  y = 20;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Answer Key', W / 2, y, { align: 'center' });
  y += 10;
  doc.line(margin, y, W - margin, y);
  y += 7;

  let qNum = 1;
  for (const section of paper.sections) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, y);
    y += 6;
    for (const q of section.questions) {
      doc.setFont('helvetica', 'normal');
      const ansLines = doc.splitTextToSize(`${qNum}. ${q.answer}`, contentW - 5);
      addPageIfNeeded(ansLines.length * 5 + 3);
      doc.setFontSize(9);
      doc.text(ansLines, margin + 4, y);
      y += ansLines.length * 5 + 2;
      qNum++;
    }
    y += 4;
  }

  const title = paper.subject || 'question-paper';
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
