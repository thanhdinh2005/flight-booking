// src/components/PopularFlights.jsx
import '../styles/FlightCard.css';
import FlightCard from './Flightcard';

// Destination images from Unsplash
const DEST_IMAGES = {
  'Nha Trang': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop',
  'Đà Nẵng': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=300&fit=crop',
  'Phú Quốc': 'https://images.unsplash.com/photo-1583417319070-4a69db38a978?w=400&h=300&fit=crop',
  'Đà Lạt': 'https://images.unsplash.com/photo-1567694673016-7f1c4247c38a?w=400&h=300&fit=crop',
  'Huế': 'https://images.unsplash.com/photo-1586188775618-295c6677b2c8?w=400&h=300&fit=crop',
  'Hà Nội': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=300&fit=crop',
  'TP.HCM': 'https://images.unsplash.com/photo-1583417319070-4a69db38a978?w=400&h=300&fit=crop',
};

// Airport codes mapping
const AIRPORT_CODES = {
  'Nha Trang': 'Cam Ranh (CXR) – Nha Trang',
  'Đà Nẵng': 'Đà Nẵng (DAD)',
  'Phú Quốc': 'Phú Quốc (PQC)',
  'Đà Lạt': 'Liên Khương (DLI) – Đà Lạt',
  'Huế': 'Phú Bài (HUI) – Huế',
  'Hà Nội': 'Nội Bài (HAN) – Hà Nội',
  'TP.HCM': 'Tân Sơn Nhất (SGN) – TP.HCM',
};

const POPULAR = [
  { from: 'TP.HCM', to: 'Nha Trang', price: '799.000', scene: '🏖️ Biển xanh' },
  { from: 'Hà Nội', to: 'Đà Nẵng', price: '1.199.000', scene: '🌉 Cầu Rồng' },
  { from: 'TP.HCM', to: 'Phú Quốc', price: '999.000', scene: '🏝️ Đảo ngọc' },
  { from: 'Hà Nội', to: 'Nha Trang', price: '1.099.000', scene: ' Bình minh' },
  { from: 'TP.HCM', to: 'Đà Lạt', price: '699.000', scene: '🌲 Thành phố mộng mơ' },
  { from: 'Hà Nội', to: 'Huế', price: '899.000', scene: '🏛️ Cố đô' },
];

/**
 * PopularFlights – grid of popular flight cards.
 * Props:
 *   onAction {(message: string) => void}
 *   onSelectDestination {{from: string, to: string} => void} - callback to switch to TabMuaVe
 */
export default function PopularFlights({ onAction, onSelectDestination }) {
  const handleBuy = (flight) => {
    onAction?.(`🎫 Đã chọn: ${flight.from} → ${flight.to} ✈️`);
    onSelectDestination?.({
      from: AIRPORT_CODES[flight.from] || flight.from,
      to: AIRPORT_CODES[flight.to] || flight.to,
    });
  };

  return (
    <section className="flights-section">
      <div className="flights-section__container">
        <h2 className="flights-section__title">✨ Các chuyến bay được yêu thích nhất</h2>
        <div className="cards-grid">
          {POPULAR.map((flight, i) => (
            <FlightCard
              key={i}
              from={flight.from}
              to={flight.to}
              price={flight.price}
              imageUrl={DEST_IMAGES[flight.to]}
              scene={flight.scene}
              onBuy={() => handleBuy(flight)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}