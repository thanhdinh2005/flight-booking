// src/components/PopularFlights.jsx
import '../styles/FlightCard.css';
import FlightCard from './Flightcard';

const POPULAR = [
  { from: 'TP.Hồ Chí Minh', to: 'Đà Nẵng', price: '666.000', variant: 1, scene: '🏖️🌉' },
  { from: 'TP.Hồ Chí Minh', to: 'Đà Nẵng', price: '666.000', variant: 2, scene: '🌉🏔️' },
  { from: 'TP.Hồ Chí Minh', to: 'Đà Nẵng', price: '666.000', variant: 3, scene: '🏝️🌅' },
  { from: 'TP.Hồ Chí Minh', to: 'Đà Nẵng', price: '666.000', variant: 4, scene: '🌄🏛️' },
];

/**
 * PopularFlights – grid of popular flight cards.
 * Props:
 *   onAction {(message: string) => void}
 */
export default function PopularFlights({ onAction }) {
  return (
    <section className="flights-section">
      <div className="flights-section__container">
        <h2 className="flights-section__title">✨ Các chuyến bay được yêu thích nhất</h2>
        <div className="cards-grid">
          {POPULAR.map((flight, i) => (
            <FlightCard
              key={i}
              {...flight}
              onBuy={() => onAction(`🎫 Đã chọn: ${flight.from} → ${flight.to} ✈️`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}