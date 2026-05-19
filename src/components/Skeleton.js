export function Skeleton({ width = '100%', height = 20, borderRadius = 8 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,.05) 25%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  )
}

export function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(lines - 1)].map((_, i) => (
        <Skeleton key={i} height={16} borderRadius={4} />
      ))}
      <Skeleton height={16} width={lastLineWidth} borderRadius={4} />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(255,255,255,.06)',
      borderRadius: 16,
      padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <div style={{ flex: 1 }}>
          <Skeleton height={18} width="60%" borderRadius={4} />
          <div style={{ marginTop: 8 }}>
            <Skeleton height={14} width="40%" borderRadius={4} />
          </div>
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} height={14} borderRadius={4} />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,.05)',
          }}
        >
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} height={16} borderRadius={4} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ items = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...Array(items)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton width={40} height={40} borderRadius={10} />
          <div style={{ flex: 1 }}>
            <Skeleton height={16} width="70%" borderRadius={4} />
            <div style={{ marginTop: 6 }}>
              <Skeleton height={12} width="40%" borderRadius={4} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}