import React, { useState } from 'react';

// Simplified Campaign Hub: basic banner + sitewide discount only
const CampaignHub = () => {
  const [banner, setBanner] = useState({
    title: 'Storewide Savings',
    subtitle: 'Fresh looks at friendly prices',
    image: '',
  });

  const [discount, setDiscount] = useState({
    code: 'SAVE10',
    value: 10,
  });

  const handleBannerSave = (e) => {
    e.preventDefault();
    alert('Banner saved (placeholder) — hook up backend when ready.');
  };

  const handleDiscountSave = (e) => {
    e.preventDefault();
    alert('Discount saved (placeholder) — hook up backend when ready.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Campaign Hub (Simplified)</h1>
        <p className="text-gray-600 mt-2">
          Reduced to a single banner and a global discount. Full campaign/event/loyalty tooling is temporarily disabled.
        </p>
      </div>

      <section className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Hero Banner</h2>
          <p className="text-sm text-gray-600">Shown across the site. Provide a simple headline, subtext, and optional image URL.</p>
        </div>
        <form className="space-y-4" onSubmit={handleBannerSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={banner.title}
              onChange={(e) => setBanner({ ...banner, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={banner.subtitle}
              onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
            <input
              type="url"
              value={banner.image}
              onChange={(e) => setBanner({ ...banner, image: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
              placeholder="https://example.com/banner.jpg"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
          >
            Save Banner (stub)
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sitewide Discount</h2>
          <p className="text-sm text-gray-600">Applies a single promo code to all products. Extend later for per-segment targeting.</p>
        </div>
        <form className="space-y-4" onSubmit={handleDiscountSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
            <input
              type="text"
              value={discount.code}
              onChange={(e) => setDiscount({ ...discount, code: e.target.value.toUpperCase() })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount.value}
              onChange={(e) => setDiscount({ ...discount, value: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
          >
            Save Discount (stub)
          </button>
        </form>
      </section>

      <section className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-sm text-gray-700">
        <p className="font-semibold">Next steps (later):</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Wire these forms to backend endpoints.</li>
          <li>Re-enable events/promotions, per-audience targeting, and scheduling.</li>
          <li>Add previews and analytics once backend support returns.</li>
        </ul>
      </section>
    </div>
  );
};

export default CampaignHub;
