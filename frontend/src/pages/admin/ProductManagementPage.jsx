import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function ProductManagementPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Mechanical Components',
    pointsPerBox: 100,
    price: 1500,
    status: 'Active',
    description: ''
  });

  const categories = [
    'Mechanical Components',
    'Seals & Gaskets',
    'Cutting Tools',
    'Electrical Equipment',
    'Pneumatics',
    'Fasteners & Hardware'
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Mechanical Components',
      pointsPerBox: 100,
      price: 1500,
      status: 'Active',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      pointsPerBox: p.pointsPerBox,
      price: p.price,
      status: p.status,
      description: p.description || ''
    });
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      toast.error('Please enter product name and SKU.');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      toast.success(`Updated "${formData.name}" successfully!`);
      setEditingProduct(null);
    } else {
      addProduct(formData);
      toast.success(`Added new product "${formData.name}"!`);
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingProductId) return;
    deleteProduct(deletingProductId);
    toast.success('Product deleted from catalog.');
    setDeletingProductId(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <Package className="w-3.5 h-3.5" />
            Factory Catalog
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Configure manufactured boxed physical goods, assign loyalty reward points per box unit, and monitor code generation status.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-black text-[#ffe17c] neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-5 bg-white border-2 border-black rounded-2xl neo-shadow flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by SKU, name, or category..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        <span className="text-xs font-bold text-neutral-500 hidden sm:block">
          Showing {filteredProducts.length} manufactured items
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">SKU / ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Points / Box</th>
                <th className="py-3 px-4">Box Unit Price</th>
                <th className="py-3 px-4">Codes Generated</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#fbfaf5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-black">{p.sku}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-black">{p.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate max-w-xs">{p.description}</p>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-700">{p.category}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 bg-[#ffe17c] text-black border border-black rounded font-black text-xs">
                      +{p.pointsPerBox} PTS
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-black">
                    ₹{p.price.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 font-mono">
                    {p.totalCodesGenerated?.toLocaleString() || 5000}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase border border-black rounded ${
                      p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 bg-white neo-btn rounded-lg text-black hover:bg-[#ffe17c]"
                        title="Edit Product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProductId(p.id)}
                        className="p-1.5 bg-white neo-btn rounded-lg text-red-600 hover:bg-red-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? "Edit Manufactured Product" : "Add Product to Factory Catalog"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Product Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Heavy Duty Bearing Box"
              className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                SKU Code
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-XXX-000"
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Points Per Box
              </label>
              <input
                type="number"
                required
                min="10"
                step="5"
                value={formData.pointsPerBox}
                onChange={(e) => setFormData({ ...formData, pointsPerBox: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Unit Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Product Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical specs, packaging unit count, or grade specifications..."
              className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
              className="w-1/2 py-2.5 bg-white text-black neo-btn rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-[#ffe17c] text-black neo-btn rounded-xl text-xs font-black"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        title="Confirm Product Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-700 leading-relaxed font-medium">
            Are you sure you want to remove this product from the active factory catalog? Any existing generated batch codes will remain archived in security logs.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingProductId(null)}
              className="w-1/2 py-2.5 bg-white text-black neo-btn rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="w-1/2 py-2.5 bg-red-600 text-white neo-btn rounded-xl text-xs font-black hover:bg-red-700"
            >
              Delete Product
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
