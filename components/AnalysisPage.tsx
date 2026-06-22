'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader, Upload, ArrowLeft } from 'lucide-react';
import { ScoreRing } from '@/components/ScoreRing';
import { generateReportPDF, type AnalysisResult } from '@/lib/pdf-generator';
import { extractTextFromFile } from '@/lib/pdf-extractor';
import { getImprovementColor, COLORS } from '@/lib/utils';
import Header from '@/components/Header';

interface AnalysisPageProps {
  onBack: () => void;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function AnalysisPage({ onBack }: AnalysisPageProps) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please use a smaller file.`);
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF or TXT file.');
      return;
    }

    setUploadedFileName(file.name);
    setError('');
    setLoading(true);

    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file. Please try a text file or PDF.');
      setUploadedFileName('');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please provide a resume text or upload a file');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data);

      setTimeout(() => {
        document
          .getElementById('results-section')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setResumeText('');
    setJobDescription('');
    setAnalysis(null);
    setError('');
    setUploadedFileName('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadReport = async () => {
    if (analysis) {
      await generateReportPDF(analysis);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 sm:px-6 md:py-12">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>

        {/* Input Section */}
        {!analysis && (
          <motion.div
            className="grid gap-6 md:grid-cols-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Resume Card */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Your Resume</h2>

              {/* File Upload Area */}
              <div
                className="rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 p-8 text-center cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload PDF or TXT file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadedFileName && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-400">
                      {loading ? 'Extracting text...' : `Extracted from: ${uploadedFileName}`}
                    </span>
                  </div>
                  {resumeText && (
                    <p className="text-xs text-muted-foreground">Text extracted successfully. Review and edit below if needed.</p>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  {uploadedFileName ? 'Extracted resume text:' : 'Or paste your resume text:'}
                </p>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={uploadedFileName ? 'Editing extracted text...' : 'Paste your resume here...'}
                  className="min-h-48 w-full rounded-lg border border-border bg-background p-3 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none resize-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Job Description Card */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Job Description</h2>
                <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                  Optional
                </span>
              </div>

              <p className="text-xs text-muted-foreground">Paste the job description for a targeted score:</p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here... (leave empty for general ATS analysis)"
                className="min-h-48 w-full rounded-lg border border-border bg-background p-3 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none resize-none"
              />
              <p className="text-xs text-muted-foreground">Leave empty for a general ATS analysis</p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Analyze Button */}
        {!analysis && (
          <div className="flex justify-center mb-8">
            <motion.button
              onClick={handleAnalyze}
              disabled={loading || !resumeText.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-8 py-3 font-semibold text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Analyze Resume</>
              )}
            </motion.button>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <motion.div
            id="results-section"
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Overall Score Card */}
            <motion.div
              className="rounded-lg border border-border bg-card p-8"
              variants={cardVariants}
            >
              <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                <div className="flex flex-col items-center flex-1">
                  <ScoreRing score={analysis.overallScore} />
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Analyzing as:</p>
                    <h2 className="text-3xl font-bold text-primary mb-4">{analysis.detectedRole}</h2>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadReport}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
                <button
                  onClick={handleAnalyzeAnother}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border hover:bg-card/50 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Analyze Another
                </button>
              </div>
            </motion.div>

            {/* Score Breakdown */}
            <motion.div className="grid gap-3 md:grid-cols-5" variants={cardVariants}>
              {[
                analysis.scoreBreakdown.keywordMatch,
                analysis.scoreBreakdown.formatting,
                analysis.scoreBreakdown.experience,
                analysis.scoreBreakdown.skills,
                analysis.scoreBreakdown.completeness,
              ].map((item, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card p-4 text-center space-y-2">
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color: item.score >= 75
                        ? COLORS.successAlt
                        : item.score >= 50
                          ? COLORS.warningAlt
                          : COLORS.error,
                    }}
                  >
                    {item.score}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Section Scores */}
            <motion.div className="rounded-lg border border-border bg-card p-6" variants={cardVariants}>
              <h3 className="mb-4 font-semibold text-primary">Resume Section Scores</h3>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
                {[
                  { label: 'Summary', score: analysis.sectionScores.summary },
                  { label: 'Experience', score: analysis.sectionScores.experience },
                  { label: 'Skills', score: analysis.sectionScores.skills },
                  { label: 'Education', score: analysis.sectionScores.education },
                  { label: 'Contact', score: analysis.sectionScores.contact },
                ].map(({ label, score }) => (
                  <div key={label} className="rounded-lg bg-muted p-3 text-center space-y-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p
                      className="text-lg font-bold"
                      style={{
                        color:
                          score === null
                            ? COLORS.gray
                            : score >= 75
                              ? COLORS.successAlt
                              : score >= 50
                                ? COLORS.warningAlt
                                : COLORS.error,
                      }}
                    >
                      {score === null ? 'N/A' : score}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Keywords & Issues Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Keywords Found */}
              {analysis.presentKeywords.length > 0 && (
                <motion.div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6" variants={cardVariants}>
                  <h3 className="mb-4 font-semibold text-green-400">
                    Keywords Found ✅ ({analysis.presentKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.presentKeywords.map((keyword, idx) => (
                      <span key={idx} className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Missing Keywords */}
              {analysis.missingKeywords.length > 0 && (
                <motion.div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6" variants={cardVariants}>
                  <h3 className="mb-4 font-semibold text-red-400">
                    Missing Keywords ❌ ({analysis.missingKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((keyword, idx) => (
                      <span key={idx} className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Weak Action Verbs */}
              {analysis.weakActionVerbs.length > 0 && (
                <motion.div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6" variants={cardVariants}>
                  <h3 className="mb-4 font-semibold text-yellow-400">Weak Action Verbs 🔄</h3>
                  <div className="space-y-2">
                    {analysis.weakActionVerbs.map((verb, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{verb.found}</span>
                        <span className="text-yellow-500">→</span>
                        <span className="text-yellow-300">{verb.replace}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ATS Format Issues */}
              {analysis.formatIssues.length > 0 && (
                <motion.div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6" variants={cardVariants}>
                  <h3 className="mb-4 font-semibold text-red-400">ATS Format Issues ⚠️</h3>
                  <ul className="space-y-2">
                    {analysis.formatIssues.map((issue, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-foreground/80">
                        <span className="text-red-400 flex-shrink-0">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Improvements */}
            {analysis.improvements.length > 0 && (
              <motion.div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6" variants={cardVariants}>
                <h3 className="mb-4 font-semibold text-blue-400">Improvements 💡</h3>
                <div className="space-y-3">
                  {analysis.improvements.map((imp, idx) => (
                    <div key={idx} className="text-sm">
                      <div
                        className="font-semibold mb-1"
                        style={{
                          color: getImprovementColor(imp.type as 'critical' | 'warning' | 'suggestion'),
                        }}
                      >
                        [{imp.type.toUpperCase()}] {imp.section}
                      </div>
                      <p className="text-muted-foreground mb-1">{imp.issue}</p>
                      <p className="text-xs text-muted-foreground/70">Fix: {imp.fix}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <motion.div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6" variants={cardVariants}>
                <h3 className="mb-4 font-semibold text-green-400">What You&apos;re Doing Well 💪</h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {analysis.strengths.map((strength, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3"
                    >
                      <span className="text-green-400 flex-shrink-0">✓</span>
                      <p className="text-sm text-foreground/80">{strength}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Readability */}
            <motion.div className="rounded-lg border border-border bg-card p-6" variants={cardVariants}>
              <h3 className="mb-4 font-semibold text-primary">Readability & Language</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Score</p>
                  <p className="text-2xl font-bold text-primary">{analysis.readability.score}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tone</p>
                  <p className="text-sm font-semibold text-foreground">{analysis.readability.tone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg Sentence Length</p>
                  <p className="text-sm font-semibold text-foreground">{analysis.readability.avgSentenceLength}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Jargon Level</p>
                  <p className="text-sm font-semibold text-foreground">{analysis.readability.jargonLevel}</p>
                </div>
              </div>
            </motion.div>

            {/* AI Copywriting & Bullet Point Rewriter Section */}
            {analysis.bulletPointRewrites && analysis.bulletPointRewrites.length > 0 && (
              <motion.div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6" variants={cardVariants}>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  ✍️ Rewriter the Points
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Replace weak or passive phrases in your resume with these high-impact, ATS-optimized sentences:
                </p>

                <div className="space-y-4">
                  {analysis.bulletPointRewrites.map((item, index) => (
                    <div key={index} className="border-l-4 border-amber-500 bg-gray-950 p-4 rounded-r-lg">
                      <div className="mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-red-400">Original Phrase:</span>
                        <p className="text-gray-400 line-through text-sm italic mt-0.5">"{item.originalPhrase}"</p>
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-400">Recommended Rewrite (Click to Copy):</span>
                        <p 
                          className="text-white font-medium bg-gray-900 p-2.5 rounded border border-gray-800 text-sm mt-0.5 cursor-pointer hover:bg-gray-800 transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(item.suggestedRewrite);
                            alert("Copied to clipboard!");
                          }}
                        >
                          "{item.suggestedRewrite}"
                        </p>
                      </div>
                      
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">💡 Why this works: {item.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
