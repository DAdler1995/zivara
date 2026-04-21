interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function LogMealModal({ onClose }: Props) {
  return (
    <ModalOverlay onClose={onClose}>
      <p style={{ color: 'var(--color-text-muted)' }}>Meal logging coming soon</p>
    </ModalOverlay>
  )
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        padding: '2rem',
        width: '100%',
        maxWidth: '440px',
      }}>
        {children}
      </div>
    </div>
  )
}