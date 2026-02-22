
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { User, Role, SiteContent, TeamMember } from './types';
import { INITIAL_CONTENT } from './constants';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchSiteContent } from './services/siteService';
import { fetchUserProfile } from './services/userService';
import { fetchTeam } from './services/teamService';

// Layout & Navigation Components
import Navbar from './components/navigation/Navbar';
import Footer from './components/navigation/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ScrollToTop from './components/navigation/ScrollToTop';
import { GlobalSeeder } from './components/GlobalSeeder';

// Lazy Loaded Pages for Performance
const PublicHome = lazy(() => import('./pages/PublicHome'));
const PublicCatalog = lazy(() => import('./pages/PublicCatalog'));
const PublicBooking = lazy(() => import('./pages/PublicBooking'));
const PublicPackages = lazy(() => import('./pages/PublicPackages'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminInventory = lazy(() => import('./pages/AdminInventory'));
const AdminSchedule = lazy(() => import('./pages/AdminSchedule'));
const AdminTeam = lazy(() => import('./pages/AdminTeam'));
const AdminPackages = lazy(() => import('./pages/AdminPackages'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const Login = lazy(() => import('./pages/Login'));

type Language = 'id' | 'en';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="relative">
       <Loader2 className="animate-spin text-zinc-100" size={50} strokeWidth={1} />
       <Sparkles className="absolute inset-0 m-auto text-[#D4AF37] animate-pulse" size={20} />
    </div>
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('id');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        let role: Role | null = null;

        if (email === 'admin@njmakeup.com') {
          role = 'ADMIN_MASTER';
        } else if (email === 'admin2@njmakeup.com') {
          role = 'ADMIN_FITTING';
        }

        const profile = await fetchUserProfile(firebaseUser.uid);

        if (role) {
          setCurrentUser({
            id: firebaseUser.uid,
            email,
            name: profile?.name || firebaseUser.displayName || (role === 'ADMIN_MASTER' ? 'Master Admin' : 'Fitting Admin'),
            role,
            phone: profile?.phone,
            instagram: profile?.instagram
          });
        } else {
          // Logged in with a non-admin account – treat as public user (no admin access)
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    // Fetch site content and team from Firebase
    const loadData = async () => {
      const [content, teamData] = await Promise.all([
        fetchSiteContent(),
        fetchTeam()
      ]);
      setSiteContent(content);
      setTeam(teamData);
    };
    loadData();

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setCurrentUser(null);
  };

  if (isLoading) return <PageLoader />;

  const publicProps = { lang, siteContent };

  return (
    <HashRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Route */}
          <Route path="/login" element={<Login onLoginSuccess={setCurrentUser} />} />

          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Navbar siteContent={siteContent} currentUser={currentUser} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} lang={lang} setLang={setLang} />
              <PublicHome siteContent={siteContent} team={team} lang={lang} />
              <Footer siteContent={siteContent} lang={lang} />
            </>
          } />
          
          <Route path="/catalog" element={
            <>
              <Navbar siteContent={siteContent} currentUser={currentUser} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} lang={lang} setLang={setLang} />
              <PublicCatalog siteContent={siteContent} lang={lang} />
              <Footer siteContent={siteContent} lang={lang} />
            </>
          } />

          <Route path="/booking" element={
            <>
              <Navbar siteContent={siteContent} currentUser={currentUser} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} lang={lang} setLang={setLang} />
              <PublicBooking lang={lang} />
              <Footer siteContent={siteContent} lang={lang} />
            </>
          } />

          <Route path="/packages" element={
            <>
              <Navbar siteContent={siteContent} currentUser={currentUser} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} lang={lang} setLang={setLang} />
              <PublicPackages lang={lang} />
              <Footer siteContent={siteContent} lang={lang} />
            </>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={currentUser ? <AdminLayout currentUser={currentUser} logout={logout}><AdminDashboard user={currentUser} /></AdminLayout> : <Navigate to="/" />} />
          <Route path="/admin/orders" element={currentUser?.role === 'ADMIN_MASTER' ? <AdminLayout currentUser={currentUser} logout={logout}><AdminOrders /></AdminLayout> : <Navigate to="/" />} />
          <Route path="/admin/schedule" element={currentUser ? <AdminLayout currentUser={currentUser} logout={logout}><AdminSchedule /></AdminLayout> : <Navigate to="/" />} />
          <Route path="/admin/inventory" element={currentUser ? <AdminLayout currentUser={currentUser} logout={logout}><AdminInventory /></AdminLayout> : <Navigate to="/" />} />
          <Route path="/admin/packages" element={currentUser ? <AdminLayout currentUser={currentUser} logout={logout}><AdminPackages /></AdminLayout> : <Navigate to="/" />} />
          <Route path="/admin/team" element={currentUser ? <AdminLayout currentUser={currentUser} logout={logout}><AdminTeam /></AdminLayout> : <Navigate to="/admin" />} />
          <Route path="/admin/settings" element={currentUser ? <AdminLayout currentUser={currentUser} logout={logout}><AdminSettings user={currentUser} /></AdminLayout> : <Navigate to="/" />} />
          
          {/* Seeder - development only */}
          {import.meta.env.DEV && <Route path="/seed" element={<GlobalSeeder />} />}
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
