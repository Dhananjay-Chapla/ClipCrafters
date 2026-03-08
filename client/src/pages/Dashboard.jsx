import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { PlusCircle, Film, Edit3, BarChart3, Search, SlidersHorizontal, TrendingUp, PieChart, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import ProjectCard from '../components/dashboard/ProjectCard.jsx';
import StatWidget from '../components/dashboard/StatWidget.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';
import { ProjectsBarChart, StatusPieChart, ActivityLineChart } from '../components/dashboard/Charts.jsx';
import { SkeletonCard } from '../components/ui/index.jsx';
import { staggerContainer } from '../utils/animations.js';
import { pageTransition } from '../utils/animations.js';

const STATUS_FILTERS = ['All', 'Draft', 'Processing', 'Completed', 'Failed'];

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [sidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getAll({ limit: 50 });
      const fetchedProjects = res.data.data?.projects || res.data.data || [];
      
      // Add dummy data if no projects exist
      if (fetchedProjects.length === 0) {
        const dummyProjects = [
          {
            _id: 'dummy-1',
            title: 'AI Video Marketing Campaign',
            description: 'Create engaging marketing videos using AI-generated visuals and narration',
            status: 'completed',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 120,
            scenes: 8,
          },
          {
            _id: 'dummy-2',
            title: 'Educational Science Explainer',
            description: 'Generate educational videos explaining complex scientific concepts',
            status: 'processing',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            duration: 180,
            scenes: 12,
          },
          {
            _id: 'dummy-3',
            title: 'Product Demo Video',
            description: 'Showcase product features with AI-generated visuals and voiceover',
            status: 'draft',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            duration: 90,
            scenes: 6,
          },
          {
            _id: 'dummy-4',
            title: 'Social Media Content Series',
            description: 'Generate short-form videos optimized for social media platforms',
            status: 'completed',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 60,
            scenes: 4,
          },
          {
            _id: 'dummy-5',
            title: 'Tutorial Video Series',
            description: 'Create step-by-step tutorial videos with AI narration',
            status: 'processing',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            duration: 240,
            scenes: 15,
          },
          {
            _id: 'dummy-6',
            title: 'Brand Story Video',
            description: 'Tell your brand story with cinematic AI-generated visuals',
            status: 'draft',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 150,
            scenes: 10,
          },
        ];
        setProjects(dummyProjects);
      } else {
        setProjects(fetchedProjects);
      }
    } catch (err) {
      // On error, show dummy data
      const dummyProjects = [
        {
          _id: 'dummy-1',
          title: 'AI Video Marketing Campaign',
          description: 'Create engaging marketing videos using AI-generated visuals and narration',
          status: 'completed',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 120,
          scenes: 8,
        },
        {
          _id: 'dummy-2',
          title: 'Educational Science Explainer',
          description: 'Generate educational videos explaining complex scientific concepts',
          status: 'processing',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          duration: 180,
          scenes: 12,
        },
        {
          _id: 'dummy-3',
          title: 'Product Demo Video',
          description: 'Showcase product features with AI-generated visuals and voiceover',
          status: 'draft',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          duration: 90,
          scenes: 6,
        },
        {
          _id: 'dummy-4',
          title: 'Social Media Content Series',
          description: 'Generate short-form videos optimized for social media platforms',
          status: 'completed',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          scenes: 4,
        },
        {
          _id: 'dummy-5',
          title: 'Tutorial Video Series',
          description: 'Create step-by-step tutorial videos with AI narration',
          status: 'processing',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          duration: 240,
          scenes: 15,
        },
        {
          _id: 'dummy-6',
          title: 'Brand Story Video',
          description: 'Tell your brand story with cinematic AI-generated visuals',
          status: 'draft',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 150,
          scenes: 10,
        },
      ];
      setProjects(dummyProjects);
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
    setDeleteModal(null);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const filtered = projects
    .filter((p) => filter === 'All' || p.status === filter.toLowerCase())
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return a.title.localeCompare(b.title);
    });

  const MARGIN = sidebarCollapsed ? 68 : 240;

  return (
    <motion.div {...pageTransition} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: MARGIN, padding: '32px', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <Link to="/projects/create" className="btn-primary" data-cursor="pointer">
            <PlusCircle size={16} /> New Project
          </Link>
        </div>

        {/* Stats row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}
        >
          <StatWidget label="Total Projects" value={projects.length} IconComponent={BarChart3} />
          <StatWidget label="Completed" value={projects.filter((p) => p.status === 'completed').length} IconComponent={Film} />
          <StatWidget label="In Progress" value={projects.filter((p) => p.status === 'processing').length} IconComponent={Edit3} />
          <StatWidget label="Drafts" value={projects.filter((p) => p.status === 'draft').length} IconComponent={SlidersHorizontal} />
        </motion.div>

        {/* Quick actions */}
        <div style={{ marginBottom: 28 }}>
          <QuickActions />
        </div>

        {/* Charts Section */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
            Analytics Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Bar Chart */}
            <div className="glass-card hover-3d-lift" style={{ padding: '24px', height: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Monthly Projects
                </h3>
              </div>
              <div style={{ height: 'calc(100% - 40px)' }}>
                <ProjectsBarChart />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="glass-card hover-3d-lift" style={{ padding: '24px', height: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <PieChart size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Project Status
                </h3>
              </div>
              <div style={{ height: 'calc(100% - 40px)' }}>
                <StatusPieChart />
              </div>
            </div>

            {/* Line Chart */}
            <div className="glass-card hover-3d-lift" style={{ padding: '24px', height: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Activity size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Weekly Activity
                </h3>
              </div>
              <div style={{ height: 'calc(100% - 40px)' }}>
                <ActivityLineChart />
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>
          {/* Projects */}
          <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Your Projects</h2>
              <Link to="/projects/create" style={{ fontSize: '0.8rem', color: 'var(--gold-primary)' }}>View all projects →</Link>
            </div>

            {/* Search + filter row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  className="input-neu"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects..."
                  style={{ paddingLeft: 36, paddingTop: 8, paddingBottom: 8, fontSize: '0.85rem' }}
                  data-cursor="text"
                />
              </div>
              <select className="input-neu" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto', paddingTop: 8, paddingBottom: 8, fontSize: '0.85rem', cursor: 'pointer' }} data-cursor="pointer">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="alpha">A–Z</option>
              </select>
            </div>

            {/* Status tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  data-cursor="pointer"
                  className={filter === f ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
                  style={{ fontSize: '0.78rem' }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Cards */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                <SkeletonCard count={4} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Film size={48} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.5 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', marginBottom: 8 }}>No projects yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>Create your first AI video project</p>
                <Link to="/projects/create" className="btn-primary" data-cursor="pointer">Create Project</Link>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer} initial="hidden" animate="visible"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}
              >
                {filtered.map((project) => (
                  <ProjectCard key={project._id} project={project} onDelete={(id) => setDeleteModal(id)} />
                ))}
              </motion.div>
            )}
          </div>

          {/* Activity */}
          <div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 16, padding: '20px', position: 'sticky', top: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                Recent Activity
              </h3>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Delete Project?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>This action cannot be undone. All videos and scenes will be permanently deleted.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleDelete(deleteModal)} className="btn-danger" data-cursor="pointer">Delete</button>
              <button onClick={() => setDeleteModal(null)} className="btn-ghost" data-cursor="pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 1023px) { main[style] { margin-left: 0 !important; } }`}</style>
    </motion.div>
  );
}
