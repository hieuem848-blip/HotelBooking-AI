import { Heart, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist } from "../api/wishlistApi";
import { useWishlist } from "../context/WishlistContext";

function Wishlist() {
  const { setLike } = useWishlist();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist()
      .then((data) => setItems(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (hotelId) => {
    const removed = await setLike(hotelId, false);

    if (removed) {
      setItems((prev) => prev.filter((item) => item.hotel._id !== hotelId));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Wishlist</h1>
      <p className="mt-2 text-slate-500">Những nơi lưu trú bạn đang quan tâm.</p>

      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map(({ id, hotel }) => (
            <article key={id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <img src={hotel.images?.[0]?.url} alt={hotel.name} className="h-48 w-full object-cover" />

              <div className="p-5">
                <h2 className="font-bold">{hotel.name}</h2>

                <p className="mt-2 flex gap-1 text-sm text-slate-500">
                  <MapPin size={15} />
                  {hotel.address?.city}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <Link to={`/hotels/${hotel.slug}`} className="text-sm font-semibold text-blue-600">
                    Xem chi tiết
                  </Link>

                  <button
                    onClick={() => handleRemove(hotel._id)}
                    aria-label="Bỏ khỏi wishlist"
                    className="text-sm text-red-500"
                  >
                    <Heart size={17} className="fill-red-500" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !items.length && (
        <div className="mt-10 rounded-2xl bg-white p-12 text-center">
          <p className="text-slate-500">Wishlist đang trống.</p>
          <Link to="/hotels" className="mt-4 inline-block text-blue-600">
            Khám phá khách sạn
          </Link>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
