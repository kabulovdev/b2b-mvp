import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  created_at: string;
};

type RFQ = {
  id: number;
  category: string;
  quantity: number;
  location: string;
  created_at: string;
};

const SupplierDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [stock, setStock] = useState("");

  const [offerRFQId, setOfferRFQId] = useState<number | null>(null);
  const [offerProductId, setOfferProductId] = useState<number | "">("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDelivery, setOfferDelivery] = useState("");

  const fetchProducts = async () => {
    const data = await apiFetch<Product[]>("/supplier/products", { auth: true });
    setProducts(data);
  };

  const fetchRFQs = async () => {
    const data = await apiFetch<RFQ[]>("/supplier/rfqs", { auth: true });
    setRfqs(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchRFQs()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load supplier data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await apiFetch<Product>("/supplier/products", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          unit,
          stock: Number(stock),
        }),
      });
      setName("");
      setCategory("");
      setPrice("");
      setUnit("");
      setStock("");
      await fetchProducts();
      await fetchRFQs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    }
  };

  const handleSendOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!offerRFQId) return;

    setError("");
    try {
      await apiFetch("/supplier/offers", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          rfq_id: offerRFQId,
          product_id: offerProductId,
          price: Number(offerPrice),
          delivery_time_days: Number(offerDelivery),
        }),
      });
      setOfferRFQId(null);
      setOfferProductId("");
      setOfferPrice("");
      setOfferDelivery("");
      await fetchRFQs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send offer");
    }
  };

  if (loading) {
    return <div className="text-slate-300">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Create Product</h2>
        <p className="text-sm text-slate-400">Add products that suppliers can quote.</p>
        {error ? <div className="mt-4 rounded bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
        <form className="mt-4 grid gap-4 md:grid-cols-5" onSubmit={handleCreateProduct}>
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          />
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Price"
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            required
          />
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Stock"
            type="number"
            min="0"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            required
          />
          <button className="rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-900 md:col-span-5">
            Add Product
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">My Products</h2>
          <div className="mt-4 space-y-3">
            {products.length === 0 ? (
              <div className="text-sm text-slate-400">No products yet.</div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="rounded border border-slate-800 bg-slate-950 p-4">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-slate-400">{product.category}</div>
                  <div className="text-sm text-slate-300">${product.price.toFixed(2)} / {product.unit}</div>
                  <div className="text-xs text-slate-500">Stock: {product.stock}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Incoming RFQs</h2>
          <p className="text-sm text-slate-400">RFQs matching your product categories.</p>
          <div className="mt-4 space-y-3">
            {rfqs.length === 0 ? (
              <div className="text-sm text-slate-400">No matching RFQs yet.</div>
            ) : (
              rfqs.map((rfq) => (
                <div key={rfq.id} className="rounded border border-slate-800 bg-slate-950 p-4">
                  <div className="font-semibold">{rfq.category}</div>
                  <div className="text-sm text-slate-400">
                    {rfq.quantity} • {rfq.location}
                  </div>
                  <div className="text-xs text-slate-500">Created {new Date(rfq.created_at).toLocaleString()}</div>
                  <button
                    className="mt-3 rounded border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
                    onClick={() => setOfferRFQId(rfq.id)}
                  >
                    Send Offer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {offerRFQId ? (
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Send Offer for RFQ #{offerRFQId}</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleSendOffer}>
            <select
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
              value={offerProductId}
              onChange={(event) => setOfferProductId(Number(event.target.value))}
              required
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.category})
                </option>
              ))}
            </select>
            <input
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="Offer price"
              type="number"
              min="0"
              value={offerPrice}
              onChange={(event) => setOfferPrice(event.target.value)}
              required
            />
            <input
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="Delivery days"
              type="number"
              min="1"
              value={offerDelivery}
              onChange={(event) => setOfferDelivery(event.target.value)}
              required
            />
            <div className="md:col-span-3 flex gap-3">
              <button className="rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-900" type="submit">
                Submit Offer
              </button>
              <button
                className="rounded border border-slate-700 px-4 py-2 text-slate-200"
                type="button"
                onClick={() => setOfferRFQId(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
};

export default SupplierDashboard;
