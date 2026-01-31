'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileText, Loader2 } from 'lucide-react';

interface ExportReportButtonProps {
  resumeFilename: string;
  atsScore: number;
  grade: string;
  analysis: {
    breakdown?: {
      contact?: { score: number; issues: string[] };
      keywords?: { score: number; issues: string[] };
      sections?: { score: number; issues: string[] };
      formatting?: { score: number; issues: string[] };
      atsCompatibility?: { score: number; issues: string[] };
    };
    suggestions?: string[];
    strengths?: string[];
    keywords?: string[];
  };
}

export function ExportReportButton({
  resumeFilename,
  atsScore,
  grade,
  analysis,
}: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;
      
      // Helper function for text wrapping
      const addWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number = 7) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, x, y);
          y += lineHeight;
        });
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ATS Analysis Report', margin, y);
      y += 15;
      
      // Resume filename
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Resume: ${resumeFilename}`, margin, y);
      y += 8;
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
      y += 15;
      
      // Score section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Overall Score', margin, y);
      y += 10;
      
      // Score circle (simplified as text)
      doc.setFontSize(48);
      const scoreColor = atsScore >= 80 ? [34, 197, 94] : atsScore >= 60 ? [234, 179, 8] : [239, 68, 68];
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(`${atsScore}%`, margin, y);
      doc.setFontSize(14);
      doc.text(grade, margin + 50, y - 10);
      y += 20;
      
      doc.setTextColor(0, 0, 0);
      
      // Score Breakdown
      if (analysis.breakdown) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Score Breakdown', margin, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const categories = [
          { name: 'Contact Information', data: analysis.breakdown.contact },
          { name: 'Keywords', data: analysis.breakdown.keywords },
          { name: 'Section Completeness', data: analysis.breakdown.sections },
          { name: 'Formatting', data: analysis.breakdown.formatting },
          { name: 'ATS Compatibility', data: analysis.breakdown.atsCompatibility },
        ];
        
        categories.forEach(({ name, data }) => {
          if (data) {
            doc.setFont('helvetica', 'bold');
            doc.text(`${name}: ${data.score}/20`, margin, y);
            y += 7;
            
            if (data.issues && data.issues.length > 0) {
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(100, 100, 100);
              data.issues.forEach(issue => {
                addWrappedText(`• ${issue}`, margin + 5, pageWidth - margin - 25);
              });
              doc.setTextColor(0, 0, 0);
            }
            y += 5;
          }
        });
      }
      
      // Strengths
      if (analysis.strengths && analysis.strengths.length > 0) {
        y += 5;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Strengths', margin, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        analysis.strengths.forEach(strength => {
          addWrappedText(`✓ ${strength}`, margin, pageWidth - margin - 20);
        });
      }
      
      // Suggestions
      if (analysis.suggestions && analysis.suggestions.length > 0) {
        y += 5;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Improvement Suggestions', margin, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        analysis.suggestions.forEach((suggestion, i) => {
          addWrappedText(`${i + 1}. ${suggestion}`, margin, pageWidth - margin - 20);
          y += 3;
        });
      }
      
      // Keywords
      if (analysis.keywords && analysis.keywords.length > 0) {
        y += 5;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Detected Keywords', margin, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const keywordsText = analysis.keywords.join(', ');
        addWrappedText(keywordsText, margin, pageWidth - margin - 20);
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated by ATSFlow | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          285,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      const filename = `ATS_Report_${resumeFilename.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Export PDF Report
        </>
      )}
    </Button>
  );
}
