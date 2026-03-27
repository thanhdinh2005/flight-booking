
import heroPattern from '../assets/image 20.png'
import planeTakeoff from '../assets/máy bay cất cách.png'

export default function Hero() {
  return (
    <div
      className="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '360px',
        overflow: 'hidden',
        borderRadius: '0 0 36px 36px',
        backgroundImage: `linear-gradient(180deg, rgba(255,180,12,0.34), rgba(255,217,82,0.22)), url("${heroPattern}")`,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center top',
        backgroundSize: 'auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255,184,28,0.18) 0%, rgba(255,229,138,0.54) 48%, rgba(255,255,255,0.80) 100%)',
          pointerEvents: 'none',
        }}
      />

      <img
        src={planeTakeoff}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '10%',
          bottom: '70px',
          width: '132px',
          opacity: 0.44,
          transform: 'rotate(-8deg)',
          filter: 'drop-shadow(0 12px 24px rgba(255,183,41,0.28))',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '4%',
          bottom: '52px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,236,179,0.65) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
