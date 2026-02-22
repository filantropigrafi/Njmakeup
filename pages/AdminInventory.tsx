import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Search, RefreshCw, 
  Loader2, ImageIcon, Tag, Package, XCircle, 
  CheckCircle2, FolderPlus, Grid, ChevronRight, Eye,
  Cloud, Check, ExternalLink, ChevronUp, ChevronDown,
  Upload, Save
} from 'lucide-react';
import { 
  fetchCatalog, addCatalogItem, updateCatalogItem, deleteCatalogItem,
  fetchCategories, addCategory, deleteCategory, updateCategoryOrder
} from '../services/inventoryService';
import { fetchPackages } from '../services/packageService';
import { CatalogItem, Category, Package as PackageType } from '../types';
import GoogleDrivePicker from '../components/GoogleDrivePicker';
import { getStableImageUrl, isGoogleDriveImageUrl } from '../services/googleDrive';

const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showItemModal, setShowItemModal] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [itemForm, setItemForm] = useState({
    title: '',
    category: '',
    imageUrl: '',
    description: '',
    stock: 1,
    availablePackageIds: [] as string[]
  });

  const [newCatName, setNewCatName] = useState('');
  const [newCatOrder, setNewCatOrder] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [catData, itemData, pkgData] = await Promise.all([
      fetchCategories(),
      fetchCatalog(),
      fetchPackages()
    ]);
    setCategories(catData);
    setItems(itemData);
    setPackages(pkgData);
    setIsLoading(false);
  };

  const handleAddItem = () => {
    setItemForm({
      title: '',
      category: '',
      imageUrl: '',
      description: '',
      stock: 1,
      availablePackageIds: []
    });
    setSelectedItem(null);
    setShowItemModal('add');
  };

  const openEdit = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    setSelectedItem(item);
    setItemForm({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description,
      stock: item.stock,
      availablePackageIds: item.availablePackageIds || []
    });
    setShowItemModal('edit');
  };

  const openDetail = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    setSelectedItem(item);
    setShowItemModal('detail');
  };

  const handleSaveItem = async () => {
    if (!itemForm.title || !itemForm.category || !itemForm.imageUrl) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      if (showItemModal === 'edit' && selectedItem) {
        await updateCatalogItem(selectedItem.id, itemForm);
      } else {
        await addCatalogItem(itemForm);
      }
      await loadData();
      setShowItemModal(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteCatalogItem(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setItemForm({ ...itemForm, imageUrl: result });
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload error:', error);
        setIsLoading(false);
      }
    }
  };

  const openDrivePicker = () => {
    setShowDrivePicker(true);
  };

  const selectDriveFile = (url: string) => {
    setItemForm({ ...itemForm, imageUrl: url });
    setShowDrivePicker(false);
  };

  const togglePackageLink = (packageId: string) => {
    setItemForm(prev => ({
      ...prev,
      availablePackageIds: prev.availablePackageIds.includes(packageId)
        ? prev.availablePackageIds.filter(id => id !== packageId)
        : [...prev.availablePackageIds, packageId]
    }));
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    
    try {
      await addCategory(newCatName.trim(), newCatOrder);
      await loadData();
      setNewCatName('');
      setNewCatOrder(0);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
      }
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-10 bg-zinc-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-serif text-zinc-900 mb-2">Inventory Management</h1>
          <p className="text-zinc-400 font-medium">Manage your catalog items and categories</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-300" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:border-[#D4AF37] transition-all"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-6 py-4 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:border-[#D4AF37] transition-all"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <button
            onClick={loadData}
            className="px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-700 transition-all"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-[#D4AF37]" size={24} />
              <span className="text-3xl font-bold text-zinc-900">{items.length}</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium">Total Items</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <Grid className="text-[#D4AF37]" size={24} />
              <span className="text-3xl font-bold text-zinc-900">{categories.length}</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium">Categories</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <Tag className="text-[#D4AF37]" size={24} />
              <span className="text-3xl font-bold text-zinc-900">{packages.length}</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium">Packages</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleAddItem}
            className="px-6 py-4 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-900 transition-all"
          >
            <Plus size={16} /> Add Item
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-700 transition-all"
          >
            <FolderPlus size={16} /> Add Category
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden border border-zinc-100 hover:border-[#D4AF37] transition-all cursor-pointer"
                onClick={(e) => openDetail(e, item)}
              >
                <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={isGoogleDriveImageUrl(item.imageUrl) ? getStableImageUrl(item.imageUrl) : item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-zinc-300" size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white">
                      <p className="text-sm font-bold mb-1">{item.title}</p>
                      <p className="text-xs opacity-90">Stock: {item.stock}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-zinc-900 mb-2 truncate">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mb-3">{item.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest">
                      {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => openEdit(e, item)}
                        className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-[#D4AF37] hover:text-white transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showItemModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/90 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
              <div className="p-10 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
                <div>
                  <h2 className="text-3xl font-serif text-zinc-900">
                    {showItemModal === 'add' ? 'Add New Item' : showItemModal === 'edit' ? 'Edit Item' : 'Item Details'}
                  </h2>
                  <p className="text-zinc-400 font-medium text-sm">
                    {showItemModal === 'detail' ? 'View item information' : 'Fill in the item details below'}
                  </p>
                </div>
                <button
                  onClick={() => setShowItemModal(null)}
                  className="p-4 bg-white rounded-full text-zinc-300 hover:text-zinc-900 transition-all shadow-lg"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                {showItemModal === 'detail' && selectedItem ? (
                  <div className="space-y-8">
                    <div className="aspect-square bg-zinc-100 rounded-3xl overflow-hidden">
                      {selectedItem.imageUrl ? (
                        <img
                          src={isGoogleDriveImageUrl(selectedItem.imageUrl) ? getStableImageUrl(selectedItem.imageUrl) : selectedItem.imageUrl}
                          alt={selectedItem.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="text-zinc-300" size={48} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif text-zinc-900 mb-4">{selectedItem.title}</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1 mb-2">Category</p>
                          <p className="text-zinc-600">{selectedItem.category}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1 mb-2">Stock</p>
                          <p className="text-zinc-600">{selectedItem.stock}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1 mb-2">Description</p>
                          <p className="text-zinc-600 whitespace-pre-wrap">{selectedItem.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Title</label>
                        <input
                          type="text"
                          value={itemForm.title}
                          onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                          className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-bold"
                          placeholder="Enter item title"
                          disabled={showItemModal === 'detail'}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Category</label>
                        <select
                          value={itemForm.category}
                          onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                          className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-bold"
                          disabled={showItemModal === 'detail'}
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Stock</label>
                        <input
                          type="number"
                          value={itemForm.stock}
                          onChange={(e) => setItemForm({ ...itemForm, stock: Number(e.target.value) })}
                          className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-bold"
                          placeholder="0"
                          disabled={showItemModal === 'detail'}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={itemForm.imageUrl}
                          onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                          className="flex-1 px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-medium"
                          placeholder="https://..."
                          disabled={showItemModal === 'detail'}
                        />
                        <button
                          type="button"
                          onClick={openDrivePicker}
                          className="px-6 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-900 transition-all"
                          disabled={showItemModal === 'detail'}
                        >
                          <Cloud size={16} /> Drive
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Description</label>
                      <textarea
                        rows={4}
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm resize-none"
                        placeholder="Enter item description"
                        disabled={showItemModal === 'detail'}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Available Packages</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {packages.map((pkg) => (
                          <label
                            key={pkg.id}
                            className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={itemForm.availablePackageIds.includes(pkg.id)}
                              onChange={() => togglePackageLink(pkg.id)}
                              disabled={showItemModal === 'detail'}
                              className="w-5 h-5 text-[#D4AF37] border-zinc-300 rounded focus:ring-[#D4AF37]"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-zinc-900">{pkg.name}</p>
                              <p className="text-xs text-zinc-400">{pkg.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {showItemModal !== 'detail' && (
                <div className="p-10 border-t border-zinc-50 flex justify-end gap-4 bg-zinc-50/50">
                  <button
                    onClick={() => setShowItemModal(null)}
                    className="px-8 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveItem}
                    disabled={isLoading}
                    className="px-8 py-4 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin inline-block mr-2" size={16} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={16} className="inline-block mr-2" />
                        {showItemModal === 'add' ? 'Add Item' : 'Update Item'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/90 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
              <div className="p-10 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
                <div>
                  <h2 className="text-3xl font-serif text-zinc-900">Category Management</h2>
                  <p className="text-zinc-400 font-medium text-sm">Manage your catalog categories</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-4 bg-white rounded-full text-zinc-300 hover:text-zinc-900 transition-all shadow-lg"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Order"
                      value={newCatOrder}
                      onChange={(e) => setNewCatOrder(Number(e.target.value))}
                      className="px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none text-sm font-bold"
                    />
                  </div>
                  <button
                    onClick={handleAddCategory}
                    className="w-full px-6 py-4 bg-[#D4AF37] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-900 transition-all"
                  >
                    <Plus size={16} className="inline-block mr-2" />
                    Add Category
                  </button>
                  
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            value={cat.order}
                            onChange={async (e) => {
                              const newOrder = Number(e.target.value);
                              try {
                                await updateCategoryOrder(cat.id, newOrder);
                                await loadData();
                              } catch (error) {
                                console.error('Error updating category order:', error);
                                alert('Error updating category order');
                              }
                            }}
                            className="w-20 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold"
                          />
                          <span className="font-bold text-zinc-900">{cat.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDrivePicker && (
          <GoogleDrivePicker
            onSelect={selectDriveFile}
            onClose={() => setShowDrivePicker(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
