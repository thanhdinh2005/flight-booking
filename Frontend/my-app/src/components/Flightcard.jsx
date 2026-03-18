// src/components/FlightCard.jsx
import '../styles/FlightCard.css';


export default function FlightCard({ from, to, price, imageUrl, scene, onBuy }) {
  // Style inline để xử lý ảnh động từ props
  const imageStyle = {
    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className="flight-card" onClick={onBuy}>
      <div 
        className="flight-card__img" 
        style={imageStyle}
      >
        {/* Nếu không có ảnh, có thể hiển thị scene hoặc màu nền mặc định */}
        <div className="flight-card__scene">{scene}</div>
        <div className="flight-card__badge">
          {from}<br />đến {to}
        </div>
      </div>
      
      <div className="flight-card__body">
        <div className="flight-card__price">Từ {price}*</div>
        <div className="flight-card__tag">một chiều</div>
        <button
          className="flight-card__buy"
          onClick={(e) => { 
            e.stopPropagation(); 
            onBuy(); 
          }}
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}