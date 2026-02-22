
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, CheckCircle2, RefreshCw, Loader2, Sparkles, XCircle, Gift, Info, Edit2, ChevronRight, Eye } from 'lucide-react';
import { fetchPackages, addPackage, deletePackage, updatePackage } from '../services/packageService';
import { Package } from '../types';

const AdminPackages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    include: '',
    exclude: '',
    freebies: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchPackages();
    setPackages(data);
    setIsLoading(false);
  };

  const openAddModal = () => {
    setFormData({ name: '', price: 0, description: '', include: '', exclude: '', freebies: '' });
    setShowModal('add');
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      description: pkg.description,
      include: (pkg.include || []).join('\n'),
      exclude: (pkg.exclude || []).join('\n'),
      freebies: (pkg.freebies || []).join('\n')
    });
    setShowModal('edit');
  };

  const openDetail = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowModal('detail');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pkgData: Omit<Package, 'id'> = {
      name: formData.name,
      price: formData.price,
      description: formData.description,
      features: [], // Deprecated
      include: formData.include.split('\n').filter(f => f.trim() !== ''),
      exclude: formData.exclude.split('\n').filter(f => f.trim() !== ''),
      freebies: formData.freebies.split('\n').filter(f => f.trim() !== '')
    };
    
    if (showModal === 'add') {
      const id = await addPackage(pkgData);
      if (id) {
        await loadData();
        setShowModal(null);
      }
    } else if (showModal === 'edit' && selectedPackage) {
      const success = await updatePackage(selectedPackage.id, pkgData);
      if (success) {
        await loadData();
        setShowModal(null);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Don't trigger the card click (detail)
    if (window.confirm('Hapus paket ini secara permanen?')) {
      const success = await deletePackage(id);
      if (success) await loadData();
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif text-zinc-900 mb-2">Package Library</h1>
          <p className="text-zinc-500 font-medium">Manage your service bundles. Click cards to view details.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={loadData} className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all active:scale-95">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-zinc-900/20 hover:bg-[#D4AF37] transition-all active:scale-95"
          >
            <Plus size={18} /> Add New
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin text-[#D4AF37] mb-6" size={56} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              onClick={() => openDetail(pkg)}
              className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 cursor-pointer group hover:bg-zinc-900 hover:border-zinc-900 transition-all duration-500 relative flex flex-col justify-between h-48"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-white/10 text-[#D4AF37] transition-colors">
                  <Tag size={20} />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(pkg); }} 
                    className="p-2 text-zinc-300 hover:text-[#D4AF37] transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, pkg.id)} 
                    className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif text-zinc-900 group-hover:text-white transition-colors line-clamp-1 mb-1">{pkg.name}</h3>
                <div className="text-2xl font-black text-[#D4AF37] group-hover:text-white flex items-baseline gap-1">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">Rp</span>
                  {(pkg.price / 1000).toLocaleString()}k
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all text-white">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full py-20 text-center bg-zinc-50/50 rounded-[3rem] border-2 border-dashed border-zinc-100">
              <p className="text-zinc-400 font-serif text-xl italic">No packages yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail / Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[4rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
            
            {/* Close Button */}
            <button onClick={() => setShowModal(null)} className="absolute top-10 right-10 p-4 bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-900 transition-all z-20">
              <XCircle size={28} />
            </button>

            {showModal === 'detail' && selectedPackage && (
              <div className="p-12 md:p-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl">
                    <Eye size={32} />
                  </div>
                  <div>
                    <h2 className="text-5xl font-serif text-zinc-900">{selectedPackage.name}</h2>
                    <p className="text-zinc-400 font-medium">Full Information & Service Details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
                   <div className="md:col-span-2 space-y-10">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2 mb-6">
                          <CheckCircle2 size={16} /> Includes
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedPackage.include?.map((f, i) => (
                            <p key={i} className="text-sm text-zinc-600 font-medium flex items-start gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {f}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] flex items-center gap-2 mb-6">
                          <Gift size={16} /> Special Freebies
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedPackage.freebies?.map((f, i) => (
                            <p key={i} className="text-sm text-zinc-600 font-medium flex items-start gap-3 bg-[#D4AF37]/5 p-4 rounded-2xl border border-[#D4AF37]/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" /> {f}
                            </p>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="p-8 bg-zinc-900 rounded-[2.5rem] text-white">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Investment</p>
                         <h3 className="text-4xl font-black text-[#D4AF37] mb-6">
                           <span className="text-xs mr-1 opacity-50">Rp</span>
                           {(selectedPackage.price / 1000).toLocaleString()}k
                         </h3>
                         <div className="space-y-4 pt-6 border-t border-white/10">
                           <p className="text-xs text-white/60 leading-relaxed font-medium italic">"{selectedPackage.description}"</p>
                         </div>
                      </div>

                      <div className="p-8 bg-white border border-zinc-100 rounded-[2.5rem]">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 flex items-center gap-2 mb-6">
                          <XCircle size={16} /> Exclude
                        </h4>
                        <div className="space-y-3">
                          {selectedPackage.exclude?.map((f, i) => (
                            <p key={i} className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-zinc-200" /> {f}
                            </p>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="mt-16 flex gap-4">
                   <button 
                    onClick={() => openEditModal(selectedPackage)}
                    className="flex-1 py-5 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#D4AF37] transition-all"
                   >
                     <Edit2 size={16} /> Edit Package
                   </button>
                </div>
              </div>
            )}

            {(showModal === 'add' || showModal === 'edit') && (
              <div className="p-12 md:p-20">
                <div className="mb-12">
                  <h2 className="text-5xl font-serif text-zinc-900">{showModal === 'add' ? 'New Package' : 'Edit Package'}</h2>
                  <p className="text-zinc-400 font-medium">Define your package pricing and features.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">Package Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">Price (Rp)</label>
                      <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">Short Description</label>
                    <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium italic" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] block ml-1 flex items-center gap-2">Include</label>
                      <textarea rows={6} value={formData.include} onChange={e => setFormData({...formData, include: e.target.value})} className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all resize-none font-medium text-sm leading-relaxed" placeholder="Item per line..." />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] block ml-1 flex items-center gap-2">Freebies</label>
                      <textarea rows={6} value={formData.freebies} onChange={e => setFormData({...formData, freebies: e.target.value})} className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all resize-none font-medium text-sm leading-relaxed" placeholder="Item per line..." />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] block ml-1 flex items-center gap-2">Exclude</label>
                      <textarea rows={6} value={formData.exclude} onChange={e => setFormData({...formData, exclude: e.target.value})} className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all resize-none font-medium text-sm leading-relaxed" placeholder="Item per line..." />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-7 bg-zinc-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-zinc-900/40 hover:bg-[#D4AF37] transition-all">
                    {showModal === 'add' ? 'Publish Package' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
