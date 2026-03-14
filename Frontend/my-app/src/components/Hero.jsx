
import image20 from '../assets/image 20.png';

export default function Hero() {
  return (
    <div className="hero" style={{
      backgroundImage: `url(${image20})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: 0.5,
      width: '100%',
      height: '300px'
    }}>
    </div>
  );
}