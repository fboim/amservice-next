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

export function DataServisSkeleton() {
  return (
    <div style={{ padding: '0' }}>
      {/* Page Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Skeleton height={24} width={200} borderRadius={6} />
          <div style={{ marginTop: 8 }}>
            <Skeleton height={14} width={280} borderRadius={4} />
          </div>
        </div>
        <Skeleton width={120} height={32} borderRadius={99} />
      </div>

      {/* Search Card Skeleton */}
      <div style={{
        background: 'var(--am-surface)',
        border: '1px solid var(--am-border)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        display: 'flex',
        gap: 8,
      }}>
        <Skeleton width={200} height={38} borderRadius={8} />
        <Skeleton width={120} height={38} borderRadius={8} />
        <Skeleton width={80} height={38} borderRadius={8} />
      </div>

      {/* Main Layout Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Table Skeleton */}
        <div style={{
          background: 'var(--am-surface)',
          border: '1px solid var(--am-border)',
          borderRadius: 12,
          padding: 16,
        }}>
          <SkeletonTable rows={6} cols={5} />
        </div>

        {/* Sidebar Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: 12,
            padding: 16,
          }}>
            <Skeleton height={14} width="60%" borderRadius={4} />
            <div style={{ marginTop: 12 }}>
              <SkeletonList items={5} />
            </div>
          </div>

          <div style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: 12,
            padding: 16,
          }}>
            <Skeleton height={14} width="50%" borderRadius={4} />
            <div style={{ marginTop: 12 }}>
              <SkeletonList items={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SparepartSkeleton() {
  return (
    <div style={{ padding: '0' }}>
      {/* Page Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Skeleton height={24} width={160} borderRadius={6} />
          <div style={{ marginTop: 8 }}>
            <Skeleton height={14} width={200} borderRadius={4} />
          </div>
        </div>
        <Skeleton width={140} height={32} borderRadius={99} />
      </div>

      {/* Search Card Skeleton */}
      <div style={{
        background: 'var(--am-surface)',
        border: '1px solid var(--am-border)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        display: 'flex',
        gap: 8,
      }}>
        <Skeleton width={250} height={38} borderRadius={8} />
        <Skeleton width={80} height={38} borderRadius={8} />
      </div>

      {/* Table Skeleton */}
      <div style={{
        background: 'var(--am-surface)',
        border: '1px solid var(--am-border)',
        borderRadius: 12,
        padding: 16,
      }}>
        <SkeletonTable rows={8} cols={5} />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div style={{ padding: '0' }}>
      {/* Stats Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <Skeleton width={42} height={42} borderRadius={10} />
            <div style={{ flex: 1 }}>
              <Skeleton height={10} width="50%" borderRadius={4} />
              <div style={{ marginTop: 8 }}>
                <Skeleton height={24} width="60%" borderRadius={4} />
              </div>
              <div style={{ marginTop: 6 }}>
                <Skeleton height={10} width="40%" borderRadius={4} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Omzet Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <Skeleton width={42} height={42} borderRadius={10} />
            <div style={{ flex: 1 }}>
              <Skeleton height={10} width="60%" borderRadius={4} />
              <div style={{ marginTop: 8 }}>
                <Skeleton height={18} width="80%" borderRadius={4} />
              </div>
              <div style={{ marginTop: 6 }}>
                <Skeleton height={10} width="50%" borderRadius={4} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table + Sidebar Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Table Skeleton */}
        <div style={{
          background: 'var(--am-surface)',
          border: '1px solid var(--am-border)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ marginBottom: 16 }}>
            <Skeleton height={14} width="40%" borderRadius={4} />
          </div>
          <SkeletonTable rows={5} cols={7} />
        </div>

        {/* Sidebar Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ marginBottom: 12 }}>
              <Skeleton height={14} width="50%" borderRadius={4} />
            </div>
            <SkeletonList items={3} />
          </div>

          <div style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ marginBottom: 12 }}>
              <Skeleton height={14} width="40%" borderRadius={4} />
            </div>
            <SkeletonList items={4} />
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div style={{
        background: 'var(--am-surface)',
        border: '1px solid var(--am-border)',
        borderRadius: 12,
        padding: 16,
      }}>
        <div style={{ marginBottom: 16 }}>
          <Skeleton height={14} width="30%" borderRadius={4} />
        </div>
        <div style={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 8px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${30 + Math.random() * 60}%`,
              background: 'linear-gradient(180deg, rgba(59,130,246,.3) 0%, rgba(59,130,246,.1) 100%)',
              borderRadius: '4px 4px 0 0',
              animation: 'shimmer 1.5s infinite',
            }} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}