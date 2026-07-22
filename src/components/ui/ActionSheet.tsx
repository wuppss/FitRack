import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function ActionSheet({ open, onClose, title, children }: ActionSheetProps) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className="relative w-full max-w-[428px] rounded-t-xl bg-bg-elevated p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-elevated"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose()
            }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-txt-tertiary" />
            {title && (
              <h2 className="mb-4 font-display text-lg font-bold text-txt-primary">{title}</h2>
            )}
            <div className="max-h-[70vh] overflow-y-auto no-scrollbar">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
