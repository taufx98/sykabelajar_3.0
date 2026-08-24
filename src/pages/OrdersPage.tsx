import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ShoppingBag, Package, Truck, CheckCircle2, Clock, MapPin,
  Plus, Trash2, MessageCircle, Award as AwardIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/store/AppContext';
import { PRINT_CATALOG, WA_NUMBER } from '@/data/demo';
import { formatShortDate, formatRupiah } from '@/lib/utils';
import type { Order, OrderStatus, OrderItem } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: 'moss' | 'warn' | 'info' | 'default' | 'err'; icon: React.ReactNode }> = {
  pending: { label: 'Menunggu Pembayaran', color: 'warn', icon: <Clock size={12} /> },
  paid: { label: 'Dibayar', color: 'info', icon: <CheckCircle2 size={12} /> },
  shipped: { label: 'Dikirim', color: 'info', icon: <Truck size={12} /> },
  completed: { label: 'Selesai', color: 'moss', icon: <CheckCircle2 size={12} /> },
  cancelled: { label: 'Dibatalkan', color: 'err', icon: <Clock size={12} /> },
};

function randomPayCode(): string {
  return String(Math.floor(Math.random() * 900) + 100);
}

export function OrdersPage() {
  const { orders, addOrder, toast } = useApp();
  const location = useLocation();
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [prefillItem, setPrefillItem] = useState<{ category: string; itemName: string } | null>(null);

  useEffect(() => {
    const state = location.state as { prefill?: { category: string; itemName: string } } | null;
    if (state?.prefill) {
      setPrefillItem(state.prefill);
      setNewOrderOpen(true);
    }
  }, [location.state]);

  const handleOpenNew = () => {
    setPrefillItem(null);
    setNewOrderOpen(true);
  };

  return (
    <div>
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Pesanan Saya</h2>
          <p className="text-xs text-slate-500">Cetak sertifikat, medali & emblem fisik</p>
        </div>
        <Button size="sm" onClick={handleOpenNew} icon={<Plus size={14} />}>Pesan Baru</Button>
      </div>

      <div className="p-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Belum ada pesanan</p>
            <Button size="sm" className="mt-4" onClick={handleOpenNew} icon={<Plus size={14} />}>Pesan Baru</Button>
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} onTrack={() => toast('Tracking: ' + (order.trackingNumber || 'Belum ada nomor resi'), 'info')} />)
        )}
      </div>

      <NewOrderModal
        open={newOrderOpen}
        prefill={prefillItem}
        onClose={() => { setNewOrderOpen(false); setPrefillItem(null); }}
        onCreate={(order) => { addOrder(order); setNewOrderOpen(false); setPrefillItem(null); toast('Pesanan dibuat! Kode bayar: ' + order.payCode + '. Lanjut ke WhatsApp untuk konfirmasi.', 'success'); }}
      />
    </div>
  );
}

function OrderCard({ order, onTrack }: { order: Order; onTrack: () => void }) {
  const status = STATUS_CONFIG[order.status];
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white">{order.code}</p>
          <p className="text-xs text-slate-500">{formatShortDate(order.createdAt)}</p>
        </div>
        <Badge color={status.color}>{status.icon} {status.label}</Badge>
      </div>

      <div className="space-y-2 mb-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-ink-800/50">
            <div className="w-9 h-9 rounded-lg bg-moss-500/15 flex items-center justify-center shrink-0">
              {item.category === 'medali' ? <Package size={16} className="text-amber-400" /> : <CheckCircle2 size={16} className="text-moss-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{item.itemName}</p>
              <p className="text-xs text-slate-500 capitalize">{item.category} · {item.quantity} × {formatRupiah(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <MapPin size={12} /> <span className="truncate">{order.address}</span>
      </div>

      {order.trackingNumber && (
        <div className="flex items-center gap-2 text-xs text-sky-400 mb-2">
          <Truck size={12} /> Resi: <span className="font-mono">{order.trackingNumber}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-amber-400 mb-3">
        <Clock size={12} /> Kode Pembayaran: <span className="font-mono font-bold">{order.payCode}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div>
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-sm font-bold text-white">{formatRupiah(order.total)}</p>
        </div>
        <div className="flex gap-2">
          {order.status === 'shipped' && (
            <Button size="sm" variant="outline" onClick={onTrack} icon={<Truck size={14} />}>Lacak</Button>
          )}
          {order.status === 'pending' && (
            <Button size="sm" onClick={() => onTrack()}>Bayar Sekarang</Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function NewOrderModal({ open, prefill, onClose, onCreate }: {
  open: boolean;
  prefill: { category: string; itemName: string } | null;
  onClose: () => void;
  onCreate: (order: Order) => void;
}) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [address, setAddress] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (prefill) {
        const cat = PRINT_CATALOG.find((c) => c.name === prefill.itemName || c.category === prefill.category);
        if (cat) {
          setItems([{ id: 'oi-' + Math.random().toString(36).slice(2), category: cat.category, itemName: cat.name, quantity: 1, price: cat.price }]);
        }
      } else {
        setItems([]);
      }
      setAddress('');
      setSelectedCat('');
      setSelectedName('');
    }
  }, [open, prefill]);

  const addItem = () => {
    if (!selectedName) return;
    const catalogItem = PRINT_CATALOG.find((c) => c.name === selectedName);
    if (!catalogItem) return;
    setItems((prev) => [...prev, {
      id: 'oi-' + Math.random().toString(36).slice(2),
      category: catalogItem.category,
      itemName: catalogItem.name,
      quantity: 1,
      price: catalogItem.price,
    }]);
    setSelectedCat('');
    setSelectedName('');
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCreate = () => {
    if (items.length === 0 || !address.trim()) return;
    const order: Order = {
      id: 'o-' + Math.random().toString(36).slice(2),
      code: 'SBJ-ORD-' + Math.floor(Math.random() * 9999).toString().padStart(4, '0'),
      payCode: randomPayCode(),
      userId: 'u-me',
      items,
      total,
      status: 'pending',
      address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const msg = `Halo sykabelajar.id, saya ingin pesan cetak:\n${items.map((i) => `- ${i.itemName} (${i.quantity}x)`).join('\n')}\nTotal: ${formatRupiah(total)}\nKode Pembayaran: ${order.payCode}\nAlamat: ${address}`;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    onCreate(order);
  };

  const filteredCatalog = selectedCat ? PRINT_CATALOG.filter((c) => c.category === selectedCat) : PRINT_CATALOG;
  const previewItem = PRINT_CATALOG.find((c) => c.name === selectedName);

  const CATEGORY_ICON: Record<string, React.ReactNode> = {
    sertifikat: <CheckCircle2 size={18} className="text-moss-400" />,
    medali: <Package size={18} className="text-amber-400" />,
    emblem: <Award as AwardIcon size={18} className="text-sky-400" />,
  };

  return (
    <Modal open={open} onClose={onClose} title="Pesan Cetak Fisik" size="lg">
      <div className="space-y-4">
        {/* Add item with dropdown */}
        <div>
          <label className="label">Pilih Item yang Ingin Dicetak</label>

          {/* Preview image */}
          {selectedCat && (
            <div className="mb-3 rounded-xl overflow-hidden border border-white/10 bg-ink-800/50">
              {previewItem ? (
                <div className="flex gap-3 p-3">
                  <img
                    src={previewItem.preview}
                    alt={previewItem.name}
                    className="w-24 h-24 rounded-lg object-cover shrink-0 bg-ink-700"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      {CATEGORY_ICON[previewItem.category]}
                      <span className="text-xs text-slate-400 capitalize">{previewItem.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-white leading-snug">{previewItem.name}</p>
                    <p className="text-sm font-bold text-moss-300 mt-1">{formatRupiah(previewItem.price)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <div className="w-24 h-24 rounded-lg bg-ink-700/50 flex items-center justify-center shrink-0">
                    {CATEGORY_ICON[selectedCat] || <Package size={24} className="text-slate-600" />}
                  </div>
                  <p className="text-xs text-slate-500">Pilih item untuk melihat preview gambar</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                className="input flex-1"
                value={selectedCat}
                onChange={(e) => { setSelectedCat(e.target.value); setSelectedName(''); }}
              >
                <option value="">Pilih kategori...</option>
                <option value="sertifikat">Sertifikat</option>
                <option value="medali">Medali</option>
                <option value="emblem">Emblem</option>
              </select>
              <select
                className="input flex-1"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                disabled={!selectedCat}
              >
                <option value="">Pilih item...</option>
                {filteredCatalog.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} — {formatRupiah(c.price)}</option>
                ))}
              </select>
              <Button size="md" onClick={addItem} disabled={!selectedName} icon={<Plus size={16} />}>Tambah</Button>
            </div>
          </div>
        </div>

        {/* Items list */}
        {items.length > 0 && (
          <div className="space-y-2">
            <label className="label">Item Dipilih</label>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-800/50">
                <div className="w-9 h-9 rounded-lg bg-moss-500/15 flex items-center justify-center shrink-0">
                  {item.category === 'medali' ? <Package size={16} className="text-amber-400" /> : <CheckCircle2 size={16} className="text-moss-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.itemName}</p>
                  <p className="text-xs text-slate-500 capitalize">{item.category} · {formatRupiah(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-ink-700 text-white font-bold">−</button>
                  <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-ink-700 text-white font-bold">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400 transition"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}

        {/* Address */}
        <div>
          <label className="label">Alamat Pengiriman</label>
          <textarea className="input min-h-[80px]" placeholder="Nama penerima, no. HP, alamat lengkap, kota, kode pos" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        {/* Total + pay code preview */}
        <div className="card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Total Pembayaran</span>
            <span className="text-lg font-bold text-white">{formatRupiah(total)}</span>
          </div>
          <p className="text-xs text-slate-500">Kode pembayaran 3 digit akan dibuat otomatis untuk konfirmasi manual admin.</p>
        </div>

        <Button fullWidth size="lg" disabled={items.length === 0 || !address.trim()} onClick={handleCreate} icon={<MessageCircle size={18} />}>
          Pesan via WhatsApp
        </Button>
        <p className="text-xs text-slate-500 text-center">Kamu akan diarahkan ke WhatsApp dengan pesan yang sudah terisi otomatis</p>
      </div>
    </Modal>
  );
}
