import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../api/client";

type RFQ = {
  id: number;
  category: string;
  quantity: number;
  location: string;
  status: string;
  selected_offer_id?: number | null;
  created_at: string;
};

type Offer = {
  id: number;
  supplier: { name: string };
  product: { name: string };
  price: number;
  delivery_time_days: number;
  status: string;
};

const BuyerDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRFQId = searchParams.get("rfq");
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");

  const selectedRFQ = useMemo(() => rfqs.find((rfq) => rfq.id.toString() === selectedRFQId), [rfqs, selectedRFQId]);

  const fetchRFQs = async () => {
    const data = await apiFetch<RFQ[]>("/buyer/rfqs", { auth: true });
    setRfqs(data);
  };

  const fetchOffers = async (rfqId: string) => {
    const data = await apiFetch<Offer[]>(`/buyer/rfqs/${rfqId}/offers`, { auth: true });
    setOffers(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchRFQs();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load RFQs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedRFQId) {
      setOffers([]);
      return;
    }

    fetchOffers(selectedRFQId).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load offers");
    });
  }, [selectedRFQId]);

  const handleCreateRFQ = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await apiFetch<RFQ>("/buyer/rfqs", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          category,
          quantity: Number(quantity),
          location,
        }),
      });
      setCategory("");
      setQuantity("");
      setLocation("");
      await fetchRFQs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create RFQ");
    }
  };

  const handleAccept = async (offerId: number) => {
    setError("");
    try {
      await apiFetch(`/buyer/offers/${offerId}/accept`, {
        method: "POST",
        auth: true,
      });
      if (selectedRFQId) {
        await fetchOffers(selectedRFQId);
      }
      await fetchRFQs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept offer");
    }
  };

  if (loading) {
    return <div className="text-slate-300">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Create RFQ</h2>
        <p className="text-sm text-slate-400">Submit a new material request.</p>
        {error ? <div className="mt-4 rounded bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleCreateRFQ}>
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Category (e.g. Cement)"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          />
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
          />
          <button className="rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-900 md:col-span-3">
            Submit RFQ
          </button>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">My RFQs</h2>
          <p className="text-sm text-slate-400">Track status and view offers.</p>
          <div className="mt-4 space-y-3">
            {rfqs.length === 0 ? (
              <div className="text-sm text-slate-400">No RFQs yet.</div>
            ) : (
              rfqs.map((rfq) => (
                <div key={rfq.id} className="rounded border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{rfq.category}</div>
                      <div className="text-sm text-slate-400">
                        {rfq.quantity} • {rfq.location}
                      </div>
                    </div>
                    <div className="text-xs uppercase text-slate-400">{rfq.status}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-500">Created {new Date(rfq.created_at).toLocaleString()}</div>
                    <button
                      className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
                      onClick={() => setSearchParams({ rfq: rfq.id.toString() })}
                    >
                      View Offers
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Offers</h2>
          {selectedRFQ ? (
            <p className="text-sm text-slate-400">For RFQ #{selectedRFQ.id} ({selectedRFQ.category})</p>
          ) : (
            <p className="text-sm text-slate-400">Select an RFQ to view offers.</p>
          )}
          <div className="mt-4 space-y-3">
            {selectedRFQ && offers.length === 0 ? (
              <div className="text-sm text-slate-400">No offers yet.</div>
            ) : null}
            {offers.map((offer) => (
              <div key={offer.id} className="rounded border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{offer.product?.name}</div>
                    <div className="text-sm text-slate-400">Supplier: {offer.supplier?.name}</div>
                  </div>
                  <div className="text-xs uppercase text-slate-400">{offer.status}</div>
                </div>
                <div className="mt-2 text-sm text-slate-300">Price: ${offer.price.toFixed(2)}</div>
                <div className="text-sm text-slate-300">Delivery: {offer.delivery_time_days} days</div>
                {selectedRFQ?.status !== "selected" && offer.status === "pending" ? (
                  <button
                    className="mt-3 rounded bg-emerald-500 px-3 py-1 text-sm font-semibold text-slate-900"
                    onClick={() => handleAccept(offer.id)}
                  >
                    Accept
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyerDashboard;
