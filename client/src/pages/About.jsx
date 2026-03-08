import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Zap, Heart, Award, Sparkles } from 'lucide-react';
import PageTransition from '../components/common/PageTransition.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function About({ snowfallEnabled, setSnowfallEnabled }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed] = useState(false);
  const MARGIN = sidebarCollapsed ? 80 : 260;
  const features = [
    {
      icon: Users,
      title: 'Our Team',
      description: 'Passionate creators building the future of video editing',
      color: 'var(--primary)'
    },
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Empower creators with AI-powered video tools',
      color: 'var(--accent)'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Cutting-edge technology meets creative freedom',
      color: 'var(--primary-light)'
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'Built by creators, for creators',
      color: 'var(--accent-light)'
    }
  ];

  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for perfection in every pixel'
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Always pushing the boundaries of what\'s possible'
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
                About ClipCrafters
              </h1>
              <p style={{ 
                fontSize: '1.2rem', 
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.7
              }}>
                Revolutionizing video creation with AI-powered tools
              </p>
            </motion.div>

            {/* Features Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px',
              marginBottom: '80px'
            }}>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card hover-3d-lift depth-2 hover-zoom"
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
                    <feature.icon size={32} color="white" />
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem',
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Values Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ marginBottom: '80px' }}
            >
              <h2 
                className="gradient-text"
                style={{ 
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
                  fontFamily: 'var(--font-display)',
                  marginBottom: '48px',
                  textAlign: 'center',
                  fontWeight: 900
                }}
              >
                Our Values
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '32px'
              }}>
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="glass-card hover-border-animate"
                    style={{ padding: '32px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}
                    data-cursor="pointer"
                  >
                    <div 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--primary-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <value.icon size={24} color="var(--primary)" />
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.25rem',
                        marginBottom: '8px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700
                      }}>
                        {value.title}
                      </h3>
                      <p style={{ 
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}>
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-card"
              style={{ 
                padding: '48px', 
                textAlign: 'center',
                background: 'var(--gradient-primary)',
                border: 'none'
              }}
            >
              <h2 style={{ 
                fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', 
                fontFamily: 'var(--font-display)',
                marginBottom: '16px',
                color: 'white',
                fontWeight: 900
              }}>
                Ready to Create Amazing Videos?
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                marginBottom: '32px',
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '500px',
                margin: '0 auto 32px'
              }}>
                Join thousands of creators using ClipCrafters
              </p>
              <button 
                className="btn-ghost"
                style={{ 
                  background: 'white',
                  color: 'var(--primary)',
                  border: 'none',
                  fontSize: '1.05rem',
                  padding: '14px 32px'
                }}
                data-cursor="pointer"
                onClick={() => window.location.href = '/register'}
              >
                Get Started Free
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
