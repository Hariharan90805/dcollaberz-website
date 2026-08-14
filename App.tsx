import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WhyDigitalMarketingSection } from './components/WhyDigitalMarketingSection';
import { DigitalMarketing3DShowcase } from './components/DigitalMarketing3DShowcase';
import { GrowthMetricsComparison } from './components/GrowthMetricsComparison';
import { ServicesSection } from './components/ServicesSection';
import { FunnelSection } from './components/FunnelSection';
import { PricingSection } from './components/PricingSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { AiGrowthAdvisor } from './components/AiGrowthAdvisor';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { StrategySessionModal } from './components/StrategySessionModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { FloatingWhatsAppWidget } from './components/FloatingWhatsAppWidget';
import { PricingTier } from './types';
import { PRICING_TIERS, BRAND_INFO } from './data';
import { logVisitorToDb, logNotificationToDb, subscribeToNotifications } from './lib/firebase';

export function App() {
  // Modal states
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  // Real-time notification log
  const [notifications, setNotifications] = useState<any[]>([]);

  // Smooth global scroll progress for premium agency feel
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 1. Subscribe to Firestore Real-Time Notifications Stream & Log Visitor Arrival
  useEffect(() => {
    // Firestore Live Real-Time Snapshot Listener
    const unsubscribe = subscribeToNotifications((dbNotifs) => {
      if (dbNotifs && dbNotifs.length > 0) {
        setNotifications(dbNotifs);
      }
    });

    const notifyVisitorEntry = async () => {
      try {
        const visitorData = {
          city: 'Krishnagiri / Tamil Nadu Region',
          device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
          referrer: document.referrer || 'Direct Visit / Google Search',
          page: window.location.pathname,
        };

        // 1. Persist visitor to Cloud Firestore
        await logVisitorToDb(visitorData);

        // 2. Dispatch to Backend Express Route
        const res = await fetch('/api/notify-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visitorData),
        });
        const data = await res.json();

        // 3. Log event notification to Firestore
        await logNotificationToDb({
          type: 'visitor_entry',
          title: '👀 New Visitor Entered DCOLLABERZ Website',
          details: `Visitor from ${visitorData.city} (${visitorData.device}) arrived via ${visitorData.referrer}. Automated alert dispatched to ${BRAND_INFO.officialEmail} & ${BRAND_INFO.adminEmail}.`,
          recipientEmail: BRAND_INFO.officialEmail,
          payload: visitorData,
        });

        if (data.notification) {
          setNotifications((prev) => [data.notification, ...prev]);
        }
      } catch (err) {
        console.error('Error logging visitor entry:', err);
      }
    };

    notifyVisitorEntry();
    fetchNotifications();

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.logs) {
        setNotifications(data.logs);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleSelectTier = (tier: PricingTier, cycle: 'monthly' | 'quarterly') => {
    setSelectedTier(tier);
    setSelectedBillingCycle(cycle);
    setCheckoutModalOpen(true);
  };

  const handleLeadSuccess = (record: any) => {
    setNotifications((prev) => [record, ...prev]);
  };

  const handlePaymentSuccess = (record: any) => {
    setNotifications((prev) => [record, ...prev]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-400 selection:text-neutral-950 font-sans antialiased overflow-x-hidden relative"
    >
      {/* Global Agency Top Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 origin-left z-50 shadow-sm shadow-amber-400/50"
        style={{ scaleX }}
      />

      {/* Navigation Header */}
      <Navbar
        onOpenStrategyModal={() => setStrategyModalOpen(true)}
        onOpenNotificationCenter={() => setNotificationModalOpen(true)}
        notificationCount={notifications.length}
      />

      {/* Hero Section with 3D Mouse Parallax, Process Pills, and Floating Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <HeroSection
          onOpenStrategyModal={() => setStrategyModalOpen(true)}
          onOpenAiAudit={() => {
            const el = document.getElementById('ai-audit');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectPricing={() => {
            const el = document.getElementById('pricing');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </motion.div>

      {/* Why Digital Marketing Matters Today (Slide 2, 3, 4, 9) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <WhyDigitalMarketingSection />
      </motion.div>

      {/* 3D Scroll-Linked Digital Marketing Ecosystem & Video Showcase */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <DigitalMarketing3DShowcase onOpenStrategyModal={() => setStrategyModalOpen(true)} />
      </motion.div>

      {/* 30-Day Growth Metrics Comparison & Opportunity Funnel (Slide 6, 7, 8) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <GrowthMetricsComparison />
      </motion.div>

      {/* 7 Core Services & 5-Stage Customer Journey Matrix (Slide 4, 10) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <ServicesSection onOpenStrategyModal={() => setStrategyModalOpen(true)} />
      </motion.div>

      {/* 4-Tier Lead Generation Funnel with BI & SQL Dashboard Simulation (Slide 11) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <FunnelSection />
      </motion.div>

      {/* Growth Packages & Instant Online Checkout (Slide 11) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <PricingSection onSelectTier={handleSelectTier} />
      </motion.div>

      {/* AI Marketing Audit & 30-Day Blueprint Generator (Gemini 3.7 Flash) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <AiGrowthAdvisor />
      </motion.div>

      {/* Verified Client Reviews & Results */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <TestimonialsSection />
      </motion.div>

      {/* Footer with Branding & Slide 12 Call to Action */}
      <Footer
        onOpenStrategyModal={() => setStrategyModalOpen(true)}
        onOpenNotificationCenter={() => setNotificationModalOpen(true)}
      />

      {/* Floating WhatsApp Live Connect Widget */}
      <FloatingWhatsAppWidget />

      {/* Checkout Modal with Spring Animations */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        tier={selectedTier}
        billingCycle={selectedBillingCycle}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Strategy Session Booking Modal with Spring Animations */}
      <StrategySessionModal
        isOpen={strategyModalOpen}
        onClose={() => setStrategyModalOpen(false)}
        onLeadSuccess={handleLeadSuccess}
      />

      {/* Real-time Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        notifications={notifications}
        onRefresh={fetchNotifications}
      />
    </motion.div>
  );
}

export default App;
