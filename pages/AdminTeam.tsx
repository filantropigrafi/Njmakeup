
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Award, User, RefreshCw, 
  Loader2, Edit2, XCircle, Search, Mail, 
  Phone, Instagram, Cloud 
} from 'lucide-react';
import { fetchTeam, addTeamMember, deleteTeamMember, updateTeamMember } from '../services/teamService';
import { TeamMember } from '../types';
import { getStableImageUrl, isGoogleDriveImageUrl } from '../services/googleDrive';
import GoogleDrivePicker from '../components/GoogleDrivePicker';

const AdminTeam: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    specialization: '',
    avatar: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchTeam();
    setTeam(data);
    setIsLoading(false);
  };

  const openAddModal = () => {
    setFormData({ 
      name: '', 
      role: '', 
      specialization: '', 
      avatar: `https://picsum.photos/seed/${Math.random()}/300/300` 
    });
    setShowModal('add');
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      specialization: member.specialization,
      avatar: member.avatar
    });
    setShowModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showModal === 'add') {
      const id = await addTeamMember(formData);
      if (id) {
        await loadData();
        setShowModal(null);
      }
    } else if (showModal === 'edit' && selectedMember) {
      const success = await updateTeamMember(selectedMember.id, formData);
      if (success) {
        await loadData();
        setShowModal(null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Keluarkan anggota ini dari tim?')) {
      const success = await deleteTeamMember(id);
      if (success) await loadData();
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 mb-2">Team Directory</h1>
          <p className="text-zinc-500 font-medium">Manage your artists, stylists, and studio excellence.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={loadData} className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all active:scale-95">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-zinc-900/20 hover:bg-[#D4AF37] transition-all active:scale-95"
          >
            <Plus size={18} /> Add Artist
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-40">
          <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.id} className="bg-white rounded-[3rem] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/40 relative group overflow-hidden transition-all duration-700 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full -mr-16 -mt-16 opacity-[0.03] blur-2xl group-hover:scale-150 transition-transform"></div>
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-6">
                   <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-zinc-50 shadow-2xl group-hover:rotate-6 transition-transform duration-700">
                     <img src={isGoogleDriveImageUrl(member.avatar) ? getStableImageUrl(member.avatar) : member.avatar} alt={member.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white border-4 border-white">
                    <Award size={16} />
                  </div>
                </div>

                <h3 className="text-2xl font-serif text-zinc-900 mb-1">{member.name}</h3>
                <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mb-6">{member.role}</p>
                
                <div className="w-full space-y-4 pt-6 border-t border-zinc-50">
                  <div className="flex items-center justify-center gap-2 text-zinc-400 font-medium text-xs">
                    <span className="px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">{member.specialization}</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-2 pt-6 border-t border-zinc-50 w-full justify-center">
                  <button onClick={() => openEditModal(member)} className="p-3 bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-3 bg-zinc-50 text-zinc-400 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {team.length === 0 && (
            <div className="col-span-full py-40 text-center bg-zinc-50/50 rounded-[4rem] border-2 border-dashed border-zinc-100">
              <User size={64} className="mx-auto text-zinc-200 mb-6" />
              <p className="text-zinc-400 font-serif text-2xl italic">No team members yet. Build your crew.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[4rem] w-full max-w-xl overflow-hidden shadow-2xl border border-white/20">
            <div className="p-12 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
              <div>
                <h2 className="text-3xl font-serif text-zinc-900">{showModal === 'add' ? 'Join the Studio' : 'Edit Profile'}</h2>
                <p className="text-zinc-400 font-medium text-sm">Artist & Staff Information</p>
              </div>
              <button onClick={() => setShowModal(null)} className="p-4 bg-white rounded-full text-zinc-300 hover:text-zinc-900 transition-all shadow-xl">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar no-scrollbar">
              <div className="flex flex-col items-center gap-6">
                 <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-zinc-100 shadow-xl bg-zinc-50">
                   <img src={isGoogleDriveImageUrl(formData.avatar) ? getStableImageUrl(formData.avatar) : formData.avatar} className="w-full h-full object-cover" alt="avatar-preview" />
                 </div>
                 <button type="button" onClick={() => setShowDrivePicker(true)} className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-zinc-900 transition-all shadow-lg">
                    <Cloud size={14}/> Pilih Foto dari Drive
                 </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">Avatar Photo URL</label>
                   <input required type="text" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-[10px] font-mono" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">Role / Position</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium" placeholder="e.g. Lead Stylist" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">Specialization</label>
                  <input required type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium" placeholder="e.g. Traditional Hijab Do" />
                </div>
              </div>
              
              <button type="submit" className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-zinc-900/20 hover:bg-[#D4AF37] transition-all active:scale-[0.98]">
                {showModal === 'add' ? 'Confirm Addition' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDrivePicker && (
        <GoogleDrivePicker 
          onSelect={(url) => setFormData({ ...formData, avatar: url })} 
          onClose={() => setShowDrivePicker(false)} 
        />
      )}
    </div>
  );
};

export default AdminTeam;
