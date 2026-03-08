import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import PageTransition from '../components/common/PageTransition.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function FAQ({ snowfallEnabled, setSnowfallEnabled }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed] = useState(false);
  const MARGIN = sidebarCollapsed ? 80 : 260;
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is ClipCrafters?',
      answer: 'ClipCrafters is an AI-powered video creation platform that helps you transform documents and text into professional videos with automated script generation, voiceover, and visual synthesis.'
    },
    {
      question: 'How does the RAG-based script generation work?',
      answer: 'Our RAG (Retrieval-Augmented Generation) system analyzes your documents, extracts key information, and generates structured video scripts using advanced AI models. It ensures accuracy by grounding the content in your source material.'
    },
    {
      question: 'What file formats do you support?',
      answer: 'We support PDF, DOCX, PPTX, and TXT files. You can upload documents up to 50MB in size.'
    },
    {
      question: 'Can I edit the generated videos?',
      answer: 'Yes! Our platform provides a comprehensive video editor where you can modify scenes, adjust timing, change visuals, and customize the voiceover.'
    },
    {
      question: 'What video quality do you offer?',
      answer: 'We generate videos in up to 4K resolution with professional-quality AI voiceover and visuals.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a free tier that allows you to create up to 3 videos per month with basic features.'
    },
    {
      question: 'How long does it take to generate a video?',
      answer: 'Video generation typically takes 5-15 minutes depending on the length and complexity of your content.'
    },
    {
      question: 'Can I use my own voiceover?',
      answer: 'Yes, you can upload your own audio files or use our AI-generated voiceover with multiple voice options.'
    },
    {
      question: 'Do you offer team collaboration features?',
      answer: 'Team collaboration features are available on our Pro and Enterprise plans, allowing multiple users to work on projects together.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We take security seriously. All data is encrypted in transit and at rest, and we never share your content with third parties.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Sidebar 
        isMobileOpen={mobileOpen} 
        onMobileClose={() => setMobileOpen(false)}
        snowfallEnabled={snowfallEnabled}
        setSnowfallEnabled={setSnowfallEnabled}
      />
      <PageTransition>
        <main style={{ marginLeft: MARGIN, minWidth: 0 }}>
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
              style={{ marginBottom: '80px' }}
            >
              <h1 
                className="gradient-text-animated"
                style={{ 
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
                  fontFamily: 'var(--font-display)',
                  marginBottom: '24px',
                  fontWeight: 900
                }}
              >
                Frequently Asked Questions
              </h1>
              <p style={{ 
                fontSize: '1.2rem', 
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.7
              }}>
                Find answers to common questions about ClipCrafters
              </p>
            </motion.div>

            {/* FAQ Accordion */}
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="glass-card hover-border-animate"
                  style={{ 
                    marginBottom: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleFAQ(index)}
                  data-cursor="pointer"
                >
                  <div style={{ 
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.1rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      margin: 0
                    }}>
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ flexShrink: 0 }}
                    >
                      <ChevronDown size={24} color="var(--primary)" />
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ 
                          padding: '0 24px 24px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.7,
                          fontSize: '0.95rem'
                        }}>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="glass-card"
              style={{ 
                padding: '48px', 
                textAlign: 'center',
                marginTop: '80px',
                maxWidth: '700px',
                margin: '80px auto 0'
              }}
            >
              <h2 style={{ 
                fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', 
                fontFamily: 'var(--font-display)',
                marginBottom: '16px',
                color: 'var(--text-primary)',
                fontWeight: 900
              }}>
                Still Have Questions?
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                marginBottom: '32px',
                color: 'var(--text-secondary)'
              }}>
                Our support team is here to help
              </p>
              <button 
                className="btn-primary"
                style={{ 
                  fontSize: '1.05rem',
                  padding: '14px 32px'
                }}
                data-cursor="pointer"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Support
              </button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </PageTransition>
      <style>{`@media (max-width: 1023px) { main[style] { margin-left: 0 !important; } }`}</style>
    </>
  );
}
