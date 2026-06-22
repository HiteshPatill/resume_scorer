export interface AnalysisResult {
  overallScore: number;
  detectedRole: string;
  summary: string;
  scoreBreakdown: {
    keywordMatch: { score: number; label: string };
    formatting: { score: number; label: string };
    experience: { score: number; label: string };
    skills: { score: number; label: string };
    completeness: { score: number; label: string };
  };
  sectionScores: {
    summary: number | null;
    experience: number | null;
    skills: number | null;
    education: number | null;
    contact: number | null;
  };
  presentKeywords: string[];
  missingKeywords: string[];
  formatIssues: string[];
  improvements: Array<{
    type: 'critical' | 'warning' | 'suggestion';
    section: string;
    issue: string;
    fix: string;
  }>;
  weakActionVerbs: Array<{
    found: string;
    replace: string;
  }>;
  strengths: string[];
  readability: {
    score: number;
    tone: string;
    avgSentenceLength: string;
    jargonLevel: string;
  };
  bulletPointRewrites?: Array<{
    originalPhrase: string;
    suggestedRewrite: string;
    reason: string;
  }>;
}

export async function generateReportPDF(analysis: AnalysisResult) {
  // Dynamic import to avoid SSR issues with DOMMatrix
  const { default: jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set dark theme colors
  const darkBg = '#0A0A0F';
  const cardBg = '#12121A';
  const borderColor = '#1E1E2E';
  const accentIndigo = '#6366F1';
  const accentViolet = '#8B5CF6';
  const textPrimary = '#FFFFFF';
  const textSecondary = '#94A3B8';
  const successGreen = '#22C55E';
  const warningYellow = '#EAB308';
  const errorRed = '#EF4444';

  let yPosition = 15;
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Helper function to add text
  const addText = (
    text: string,
    x: number,
    y: number,
    options?: any
  ) => {
    doc.setTextColor(255, 255, 255);
    doc.text(text, x, y, options);
  };

  // Helper function to add section title
  const addSectionTitle = (title: string) => {
    yPosition += 5;
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, yPosition + 6);
    yPosition += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };

  // Helper function to add a key-value row
  const addRow = (label: string, value: string, valueColor = textPrimary) => {
    doc.setTextColor(148, 163, 184); // Secondary text
    doc.text(label, margin, yPosition);
    doc.setTextColor(...hexToRgb(valueColor));
    doc.text(value, margin + 80, yPosition);
    yPosition += 6;
  };

  // Helper to convert hex to RGB
  function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [255, 255, 255];
  }

  // Header
  doc.setFillColor(30, 30, 46); // Border color background
  doc.rect(0, 0, pageWidth, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text('ResumeScore Report', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 18);

  yPosition = 25;

  // Overall Score Section
  addSectionTitle('Overall Score');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  const scoreColor =
    analysis.overallScore >= 75
      ? successGreen
      : analysis.overallScore >= 50
        ? warningYellow
        : errorRed;
  doc.setTextColor(...hexToRgb(scoreColor));
  doc.text(`${analysis.overallScore}/100`, margin, yPosition);

  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  addRow('Detected Role:', analysis.detectedRole);
  addRow('Summary:', analysis.summary.substring(0, 60) + '...');

  // Score Breakdown
  addSectionTitle('Score Breakdown');
  const breakdowns = [
    { label: analysis.scoreBreakdown?.keywordMatch?.label, score: analysis.scoreBreakdown?.keywordMatch?.score },
    { label: analysis.scoreBreakdown?.formatting?.label, score: analysis.scoreBreakdown?.formatting?.score },
    { label: analysis.scoreBreakdown?.experience?.label, score: analysis.scoreBreakdown?.experience?.score },
    { label: analysis.scoreBreakdown?.skills?.label, score: analysis.scoreBreakdown?.skills?.score },
    { label: analysis.scoreBreakdown?.completeness?.label, score: analysis.scoreBreakdown?.completeness?.score },
  ];

  breakdowns.forEach(({ label, score }) => {
    if (label && typeof score === 'number') {
      const color =
        score >= 75
          ? successGreen
          : score >= 50
            ? warningYellow
            : errorRed;
      addRow(label, `${score}/100`, color);
    }
  });

  // Keywords Found
  if (analysis.presentKeywords && analysis.presentKeywords.length > 0) {
    addSectionTitle(`Keywords Found (${analysis.presentKeywords.length})`);
    doc.setFontSize(9);
    const keywords = analysis.presentKeywords.join(', ');
    const wrapped = doc.splitTextToSize(keywords, contentWidth - 3);
    wrapped.forEach((line: string) => {
      doc.setTextColor(74, 222, 128); // Green
      doc.text(line, margin + 1, yPosition);
      yPosition += 4;
    });
    yPosition += 2;
  }

  // Missing Keywords
  if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
    addSectionTitle(`Missing Keywords (${analysis.missingKeywords.length})`);
    doc.setFontSize(9);
    const keywords = analysis.missingKeywords.join(', ');
    const wrapped = doc.splitTextToSize(keywords, contentWidth - 3);
    wrapped.forEach((line: string) => {
      doc.setTextColor(252, 165, 165); // Red
      doc.text(line, margin + 1, yPosition);
      yPosition += 4;
    });
    yPosition += 2;
  }

  // Check for new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 15;
  }

  // Format Issues
  if (analysis.formatIssues && analysis.formatIssues.length > 0) {
    addSectionTitle('ATS Format Issues');
    doc.setFontSize(9);
    analysis.formatIssues.slice(0, 5).forEach((issue) => {
      if (issue) {
        doc.setTextColor(252, 165, 165); // Red
        const wrapped = doc.splitTextToSize(`• ${issue}`, contentWidth - 5);
        wrapped.forEach((line: string) => {
          doc.text(line, margin + 2, yPosition);
          yPosition += 4;
        });
      }
    });
    yPosition += 2;
  }

  // Improvements
  if (analysis.improvements && analysis.improvements.length > 0) {
    addSectionTitle('Improvements');
    doc.setFontSize(8);
    analysis.improvements.slice(0, 8).forEach((imp) => {
      if (imp && imp.type && imp.section) {
        const typeColor =
          imp.type === 'critical'
            ? errorRed
            : imp.type === 'warning'
              ? warningYellow
              : accentIndigo;
        doc.setTextColor(...hexToRgb(typeColor));
        doc.text(`[${imp.type.toUpperCase()}] ${imp.section}:`, margin + 1, yPosition);
        yPosition += 3;
        if (imp.issue) {
          doc.setTextColor(148, 163, 184);
          const wrapped = doc.splitTextToSize(imp.issue, contentWidth - 5);
          wrapped.slice(0, 2).forEach((line: string) => {
            doc.text(line, margin + 2, yPosition);
            yPosition += 3;
          });
        }
      }
    });
  }

  // Check for new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 15;
  }

  // Weak Action Verbs
  if (analysis.weakActionVerbs && analysis.weakActionVerbs.length > 0) {
    addSectionTitle('Weak Action Verbs to Replace');
    doc.setFontSize(8);
    analysis.weakActionVerbs.slice(0, 6).forEach(({ found, replace }) => {
      if (found && replace) {
        doc.setTextColor(148, 163, 184);
        doc.text(`${found}`, margin, yPosition);
        doc.setTextColor(74, 222, 128);
        doc.text(`→ ${replace}`, margin + 40, yPosition);
        yPosition += 5;
      }
    });
  }

  // Strengths
  if (analysis.strengths && analysis.strengths.length > 0) {
    addSectionTitle('What You Are Doing Well');
    doc.setFontSize(9);
    analysis.strengths.slice(0, 5).forEach((strength) => {
      if (strength) {
        doc.setTextColor(74, 222, 128);
        const wrapped = doc.splitTextToSize(`✓ ${strength}`, contentWidth - 5);
        wrapped.forEach((line: string) => {
          doc.text(line, margin + 2, yPosition);
          yPosition += 4;
        });
      }
    });
  }

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(99, 102, 241);
  doc.text(
    'Generated by ResumeScore - Know exactly where you stand before you apply',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // Save the PDF
  const date = new Date().toISOString().split('T')[0];
  doc.save(`resumescore-report-${date}.pdf`);
}
