'use client';

interface ScrollIndicatorProps {
  currentIndex: number;
  total: number;
  accentColor: string;
}

export default function ScrollIndicator({ currentIndex, total, accentColor }: ScrollIndicatorProps) {
  return (
    <div
      aria-label="Gallery scroll position"
      role="navigation"
      style={{
        position: 'fixed',
        right: '1.25rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}
    >
      {/* Vertical track */}
      <div
        style={{
          position: 'relative',
          width: '2px',
          height: `${total * 20}px`,
          background: '#ffffff18',
          borderRadius: '1px',
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${((currentIndex + 1) / total) * 100}%`,
            background: accentColor,
            borderRadius: '1px',
            transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 6px ${accentColor}88`,
          }}
        />

        {/* Dot for each artwork */}
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <div
              key={i}
              aria-label={`Section ${i + 1}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: `${(i / (total - 1)) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: isActive ? '8px' : '5px',
                height: isActive ? '8px' : '5px',
                borderRadius: '50%',
                background: isActive ? accentColor : isPast ? `${accentColor}88` : '#ffffff33',
                boxShadow: isActive ? `0 0 8px ${accentColor}` : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* Current index label */}
      <div
        style={{
          marginTop: '0.75rem',
          fontFamily: 'monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.08em',
          color: '#ffffff44',
          userSelect: 'none',
        }}
      >
        {String(currentIndex + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </div>
    </div>
  );
}
