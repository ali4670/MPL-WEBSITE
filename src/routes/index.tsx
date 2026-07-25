import { createFileRoute, Link } from "@tanstack/react-router";
import { RainingXO, ScrambledText } from "../components/RainingXO";
import { ProfileEdit } from "../components/ProfileEdit";
import { useLanguage } from "../lib/LanguageContext";
import { useAuth } from "../hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BookOpen,
  X,
  Check,
  ArrowUpRight,
  ArrowRight,
  MonitorPlay,
  Palette,
  Gamepad2,
} from "lucide-react";
import { supabase } from "../lib/supabase-code";
import { toast } from "sonner";
import { Component as NewHero } from "../components/ui/hero";
import { HeroButton } from "../funs/HeroButton";
import { SpotlightCard } from "../components/SpotlightCard";
import { MPLLogo } from "../components/MPLLogo";

export const Route = createFileRoute("/")({
  component: Index,
});

interface Level {
  id: string;
  title: string;
  level_order: number;
  image_url?: string;
  is_published: boolean;
}

function Index() {
  const { isAr } = useLanguage();
  const { user } = useAuth();
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [activeOnlineGame, setActiveOnlineGame] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [spotlight, setSpotlight] = useState<any>(null);
  const [incomingChallenge, setIncomingChallenge] = useState<{
    id: string;
    player_x: string;
    challengerName: string;
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetchLevels();
    fetchSpotlight();
  }, []);

  const fetchLevels = async () => {
    const { data } = await supabase
      .from("level_templates")
      .select("id, title, description, image_url, level_order, is_published, drip_interval_days")
      .eq("is_published", true)
      .order("level_order", { ascending: true });
    if (data) setLevels(data);
  };

  const fetchSpotlight = async () => {
    const { data } = await supabase
      .from("spotlight")
      .select("*, profiles(username)")
      .single();
    if (data) setSpotlight(data);
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_challenges_${user.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          table: "games",
          filter: `player_o=eq.${user.id}`,
        },
        async (payload: any) => {
          const { data: challenger } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.player_x)
            .single();

          setIncomingChallenge({
            id: payload.new.id,
            player_x: payload.new.player_x,
            challengerName: challenger?.username || "Unknown",
          });
        },
      )
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          table: "games",
          filter: `player_x=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new.status === "active") {
            setActiveOnlineGame(payload.new.id);
            toast.success(isAr ? "تم قبول التحدي!" : "Challenge accepted!");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAr]);

  const acceptChallenge = async () => {
    if (!incomingChallenge) return;
    try {
      const { error } = await supabase
        .from("games")
        .update({ status: "active" })
        .eq("id", incomingChallenge.id);

      if (error) throw error;
      setActiveOnlineGame(incomingChallenge.id);
      setIncomingChallenge(null);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  if (!isClient) {
    return <div className="bg-background min-h-screen" />;
  }

  return (
    <main className="bg-background flex flex-col relative overflow-x-hidden text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,oklch(0.98_0.01_140/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.98_0.01_140/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      {/* Hero Section */}
      <div id="hero-section" className="relative">
        <NewHero />
      </div>

      {/* Mission Section */}
      <section className="py-8 md:py-16 relative bg-card/20 overflow-hidden border-y border-border flex flex-col items-center justify-center min-h-[20vh] md:min-h-[30vh]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center px-4 md:px-6 relative z-10"
        >
          <motion.h2
            className="text-2xl md:text-4xl lg:text-6xl font-black tracking-tighter italic mb-3 md:mb-4"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            <ScrambledText
              phrases={
                isAr
                    ? [
                      "المعرفة تبدأ هنا",
                      "اقرأ • تعلم • نمُ",
                      "بوابتك لاكتشاف العالم",
                    ]
                    : [
                      "KNOWLEDGE BEGINS HERE",
                      "READ • LEARN • GROW",
                      "YOUR DOOR TO DISCOVERY",
                    ]
              }
            />
          </motion.h2>
          <p className="text-muted-foreground text-xs md:text-sm font-black uppercase tracking-[0.3em]">
            {isAr
              ? "مكتبة مصر العامة بدمنهور - منذ 2009"
              : "Misr Public Library Damanhour - Since 2009"}
          </p>
        </motion.div>

        {/* Background Decorative Element */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-[800px] h-[800px] bg-primary rounded-full blur-[150px] animate-pulse" />
        </div>
      </section>

      {/* Library Collections Section */}
      <section
        id="arena-section"
        className="py-12 md:py-24 px-4 md:px-6 bg-background relative overflow-hidden border-t border-border"
      >
        {/* Raining X and O Background */}
        <div className="absolute inset-0 opacity-10">
          <RainingXO />
        </div>

        {/* Global Glowing Accents */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-chart-3/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6">
            <div className="text-left">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-3xl md:text-5xl lg:text-7xl font-black italic tracking-tighter leading-none mb-3"
              >
                {isAr ? "المجموعات" : "COLLECTIONS"}
              </motion.h2>
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-12 bg-primary" />
                <p className="text-primary font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-[10px]">
                  {isAr
                    ? "كتب ومراجع فيVarious التخصصات"
                    : "Books and references across disciplines"}
                </p>
              </div>
            </div>
            <Link to="/levels">
              <HeroButton
                variant="outline"
                className="border-border text-muted-foreground hover:text-foreground px-8 h-14 rounded-2xl"
              >
                {isAr ? "عرض كل المجموعات" : "VIEW ALL COLLECTIONS"}
              </HeroButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {levels.map((level, idx) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to="/levels"
                  className="group relative block aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all duration-500 shadow-2xl"
                >
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                    <img
                      src={
                        level.image_url ||
                        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800"
                      }
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 grayscale group-hover:grayscale-0"
                      alt={level.title}
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />

                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex flex-col justify-end h-full">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <span className="px-2 md:px-3 py-1 bg-primary text-primary-foreground text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                          {isAr
                            ? `القسم ${level.level_order}`
                            : `SECTION-${String(level.level_order).padStart(2, "0")}`}
                        </span>
                        <div className="h-[1px] flex-1 bg-border" />
                      </div>
                      <h3 className="text-xl md:text-3xl font-black italic uppercase text-foreground tracking-tighter leading-tight mb-2 group-hover:text-primary transition-colors">
                        {level.title}
                      </h3>
                      <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                          {isAr ? "جاهز للاستعارة" : "READY TO BORROW"}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center border border-border">
                          <ArrowUpRight className="w-5 h-5 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {levels.length === 0 && (
              <div className="col-span-full py-16 md:py-32 flex flex-col items-center justify-center gap-4 md:gap-6 border border-dashed border-border rounded-2xl md:rounded-4xl bg-card">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground font-black uppercase tracking-[0.5em] text-xs italic">
                  {isAr
                    ? "جاري تحميل المجموعات..."
                    : "LOADING COLLECTIONS..."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="missions-section"
        className="py-12 md:py-24 px-4 md:px-6 bg-muted/50 relative overflow-hidden border-y border-border"
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4 md:mb-6">
                <span className="text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                  {isAr ? "خدماتنا" : "OUR SERVICES"}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic tracking-[calc(-0.05em)] mb-4 md:mb-6 uppercase leading-[0.85] text-foreground">
                {isAr ? "ما نقدمه" : "WHAT WE OFFER"}
              </h2>
              <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-[9px] md:text-[10px] mb-6 md:mb-8">
                {isAr
                  ? "خدمات متنوعة للمجتمع"
                  : "Diverse services for the community"}
              </p>
              <div className="h-1 w-20 bg-primary/30 rounded-full"></div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  t: isAr ? "القراءة والبحث" : "READING & RESEARCH",
                  d: isAr
                    ? "آلاف الكتب والمراجع فيVarious التخصصات"
                    : "Thousands of books and references across disciplines",
                  icon: <BookOpen className="w-6 h-6" />,
                  tag: "KNOWLEDGE",
                },
                {
                  t: isAr ? "الأنشطة والورش" : "ACTIVITIES & WORKSHOPS",
                  d: isAr
                    ? "ورش عمل فنية وثقافية وتعليمية"
                    : "Artistic, cultural, and educational workshops",
                  icon: <Palette className="w-6 h-6" />,
                  tag: "CULTURE",
                },
                {
                  t: isAr ? "البرامج التقنية" : "TECH PROGRAMS",
                  d: isAr
                    ? "دورات تدريبية على الحاسوب واللغات"
                    : "Computer training and language courses",
                  icon: <MonitorPlay className="w-6 h-6" />,
                  tag: "DIGITAL",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="p-1 rounded-[2.5rem] bg-primary/5 border border-border hover:border-primary/40 transition-all duration-700 group"
                >
                  <div className="bg-card/60 backdrop-blur-3xl p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    <div className="flex items-center gap-4 md:gap-6 text-center md:text-left flex-col md:flex-row">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                        {s.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 md:gap-3 mb-2 justify-center md:justify-start">
                          <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {s.tag}
                          </span>
                          <div className="h-px w-6 bg-border"></div>
                        </div>
                        <h3 className="text-lg md:text-xl font-black italic tracking-tighter text-foreground uppercase leading-none">
                          {s.t}
                        </h3>
                        <p className="text-muted-foreground font-medium mt-2 text-xs md:text-sm">
                          {s.d}
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shrink-0">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        {/* ── Desktop Footer (md+) ── */}
        <div className="hidden md:block py-12 px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-4 gap-8 text-left">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MPLLogo size="lg" className="w-28 h-20 rounded-full border-2 border-border shadow-lg p-0.5 bg-card" />
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-foreground">
                      MPL<span className="text-primary">.</span>
                    </h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                  {isAr ? "مكتبة مصر العامة بدمنهور" : "MISR PUBLIC LIBRARY DAMANHOUR"}
                </p>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  {isAr ? "الروابط" : "NAVIGATION"}
                </h4>
                <nav className="flex flex-col gap-2">
                  {["Levels", "Profile"].map((link) => (
                    <Link
                      key={link}
                      to={`/${link.toLowerCase()}` as any}
                      className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Socials */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  {isAr ? "تواصل" : "CONNECT"}
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open("https://www.facebook.com/misrlibrary.damanhour", "_blank")}
                    className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-[10px] font-black hover:bg-primary hover:text-background transition-all"
                  >
                    FB
                  </button>
                  <button
                    onClick={() => window.open("https://www.youtube.com/@MPLDamanhour", "_blank")}
                    className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-[10px] font-black hover:bg-primary hover:text-background transition-all"
                  >
                    YT
                  </button>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-muted-foreground text-[9px] font-black uppercase tracking-widest flex flex-col justify-end gap-1">
                <p>&copy; 2026 MPL DAMANHOUR.</p>
                <p>
                  {isAr ? "شارع الجمهورية، دمنهور" : "Republic St, Damanhour, Beheira"}
                </p>
                <p className="mt-1 opacity-50">
                  {isAr ? "جميع الحقوق محفوظة" : "ALL RIGHTS RESERVED"}
                </p>
                <p className="mt-2 text-primary/60">
                  {isAr ? "تصميم وتطوير BAKOGO" : "DESIGNED & MADE BY BAKOGO"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile Footer ── */}
        <div className="md:hidden">
          {/* Brand + tagline */}
          <div className="px-5 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-3">
              <MPLLogo size="md" className="w-12 h-12 rounded-2xl border border-border bg-card" />
              <div>
                <h3 className="text-lg font-black italic tracking-tighter text-foreground">
                  MPL<span className="text-primary">.</span>
                </h3>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                  {isAr ? "مكتبة مصر العامة بدمنهور" : "MISR PUBLIC LIBRARY DAMANHOUR"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation pills */}
          <div className="px-5 pb-6">
            <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              {isAr ? "الروابط" : "NAVIGATION"}
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { link: "Levels", label: isAr ? "المكتبة" : "Library" },
                { link: "Profile", label: isAr ? "الملف" : "Profile" },
              ].map((item) => (
                <Link
                  key={item.link}
                  to={`/${item.link.toLowerCase()}` as any}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social row */}
          <div className="px-5 pb-6">
            <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              {isAr ? "تواصل" : "CONNECT"}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => window.open("https://www.facebook.com/misrlibrary.damanhour", "_blank")}
                className="w-11 h-11 rounded-2xl bg-background border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground hover:bg-primary hover:text-background hover:border-primary transition-all"
              >
                FB
              </button>
              <button
                onClick={() => window.open("https://www.youtube.com/@MPLDamanhour", "_blank")}
                className="w-11 h-11 rounded-2xl bg-background border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground hover:bg-primary hover:text-background hover:border-primary transition-all"
              >
                YT
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-5 py-5 border-t border-border bg-background/50">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                &copy; 2026 MPL DAMANHOUR.
              </p>
              <p className="text-[9px] font-bold text-muted-foreground">
                {isAr ? "شارع الجمهورية، دمنهور" : "Republic St, Damanhour, Beheira"}
              </p>
              <p className="text-[7px] text-muted-foreground/50 font-bold uppercase tracking-widest mt-1">
                {isAr ? "جميع الحقوق محفوظة" : "ALL RIGHTS RESERVED"}
              </p>
              <p className="text-[7px] text-primary/50 font-bold uppercase tracking-widest mt-1">
                {isAr ? "تصميم وتطوير BAKOGO" : "DESIGNED & MADE BY BAKOGO"}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Challenge Modal */}
      <AnimatePresence>
        {incomingChallenge && (
          <div className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-[320px] z-[150]">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-card/90 border border-border backdrop-blur-2xl rounded-2xl md:rounded-4xl p-4 md:p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                  <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-background" />
                </div>
                <div>
                  <h4 className="text-foreground font-bold">
                    {isAr ? "تحدي جديد!" : "New Challenge!"}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {incomingChallenge.challengerName}{" "}
                    {isAr ? "يدعوك للعب" : "invited you to play"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={acceptChallenge}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  {isAr ? "قبول" : "Accept"}
                </button>
                <button
                  onClick={() => setIncomingChallenge(null)}
                  className="px-4 py-3 bg-muted border border-border text-foreground rounded-2xl hover:bg-border active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ProfileEdit
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/00000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-[90] bottom-20 md:bottom-8 right-4 md:right-6 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-110 active:scale-95 transition-all duration-300 animate-[bounce_2s_infinite]"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </main>
  );
}
