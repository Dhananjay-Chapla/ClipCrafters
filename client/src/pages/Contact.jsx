import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../components/common/PageTransition.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function Contact({ snowfallEnabled, setSnowfallEnabled }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed] = useState(false);
  const MARGIN = sidebarCollapsed ? 80 : 260;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@clipcrafters.com',
      link: 'mailto:support@clipcrafters.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 2717 241900',
      link: 'tel:+912717241900'
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'NIRMA University, Sarkhej-Gandhinagar Highway, Ahmedabad, Gujarat 382481, India',
      link: null
    }
  ];

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
                Get In Touch
              </h1>
              <p style={{ 
                fontSize: '1.2rem', 
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.7
              }}>
                Have questions? We'd love to hear from you.
              </p>
            </motion.div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
              marginBottom: '80px'
            }}>
              {/* Contact Info Cards */}
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card hover-3d-lift depth-2"
                  style={{ padding: '32px', textAlign: 'center' }}
                  data-cursor="pointer"
                >
                  <div 
                    className="shadow-neon slow-pulse"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px'
                    }}
                  >
                    <info.icon size={32} color="white" />
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem',
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700
                  }}>
                    {info.title}
                  </h3>
                  {info.link ? (
                    <a 
                      href={info.link}
                      style={{ 
                        color: 'var(--primary-light)',
                        textDecoration: 'none',
                        fontSize: '0.95rem'
                      }}
                      className="hover-glow"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '0.95rem',
                      lineHeight: 1.6
                    }}>
                      {info.value}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="glass-card"
              style={{ padding: '48px', maxWidth: '800px', margin: '0 auto' }}
            >
              <h2 
                className="gradient-text"
                style={{ 
                  fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', 
                  fontFamily: 'var(--font-display)',
                  marginBottom: '32px',
                  textAlign: 'center',
                  fontWeight: 900
                }}
              >
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input 
                    className="input-neu" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    data-cursor="text"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    className="input-neu" 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    data-cursor="text"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input 
                    className="input-neu" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    required
                    data-cursor="text"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea 
                    className="input-neu" 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more..."
                    rows={6}
                    required
                    data-cursor="text"
                  />
                </div>

                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={sending}
                  data-cursor="pointer"
                  style={{ 
                    fontSize: '1.05rem',
                    padding: '14px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {sending ? 'Sending...' : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </main>
        <Footer />
      </PageTransition>
      <style>{`@media (max-width: 1023px) { main[style] { margin-left: 0 !important; } }`}</style>
    </>
  );
}
