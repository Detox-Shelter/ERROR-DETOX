import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * 정원 톤에 맞는 알림과 확인 대화상자.
 *
 * 브라우저 기본 alert/confirm 을 대신한다. 기본 대화상자는 이 앱의 결과 화면과
 * 톤이 어긋나기도 하지만, 무엇보다 어느 입력이 문제인지 짚어 주지 못하고
 * 포커스도 옮기지 못한다.
 */

export type GardenDialogKind = 'notice' | 'confirm' | 'danger';

export interface GardenDialogProps {
  open: boolean;
  kind?: GardenDialogKind;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

const TONE: Record<GardenDialogKind, { icon: string; accent: string; button: string }> = {
  notice: {
    icon: '🌿',
    accent: 'text-emerald-900',
    button: 'bg-emerald-900 text-emerald-50 hover:bg-emerald-950',
  },
  confirm: {
    icon: '🍃',
    accent: 'text-emerald-900',
    button: 'bg-emerald-900 text-emerald-50 hover:bg-emerald-950',
  },
  danger: {
    icon: '🥀',
    accent: 'text-rose-900',
    button: 'bg-rose-800 text-rose-50 hover:bg-rose-900',
  },
};

export default function GardenDialog({
  open,
  kind = 'notice',
  title,
  message,
  confirmLabel,
  cancelLabel = '취소',
  onConfirm,
  onClose,
}: GardenDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const isChoice = kind !== 'notice';

  // 열리면 확인 버튼으로 포커스를 옮기고, Esc 로 닫을 수 있게 한다.
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const tone = TONE[kind];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-emerald-950/40 p-4"
          onClick={onClose}
          id="garden-dialog-overlay"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="garden-dialog-title"
            aria-describedby={message ? 'garden-dialog-message' : undefined}
            className="bg-white rounded-3xl border border-emerald-100 shadow-lg w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5" aria-hidden="true">
                {tone.icon}
              </span>
              <div className="space-y-1.5 min-w-0">
                <h2 id="garden-dialog-title" className={`text-base font-bold font-serif ${tone.accent}`}>
                  {title}
                </h2>
                {message && (
                  <p id="garden-dialog-message" className="text-xs text-emerald-800 leading-relaxed">
                    {message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
              {isChoice && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                ref={confirmRef}
                type="button"
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${tone.button}`}
              >
                {confirmLabel ?? (isChoice ? '확인' : '알겠습니다')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DialogRequest = Omit<GardenDialogProps, 'open' | 'onClose'>;

/**
 * alert/confirm 을 대신하는 최소한의 상태 관리.
 *
 *   const dialog = useGardenDialog();
 *   dialog.notify('저장에 실패했습니다.');
 *   dialog.confirm({ title: '삭제할까요?', kind: 'danger', onConfirm: remove });
 *   ...
 *   <GardenDialog {...dialog.props} />
 */
export function useGardenDialog() {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const close = useCallback(() => setRequest(null), []);

  const notify = useCallback((title: string, message?: string) => {
    setRequest({ kind: 'notice', title, message });
  }, []);

  const confirm = useCallback((req: DialogRequest) => {
    setRequest({ kind: 'confirm', ...req });
  }, []);

  return {
    notify,
    confirm,
    close,
    props: {
      open: request !== null,
      onClose: close,
      title: request?.title ?? '',
      message: request?.message,
      kind: request?.kind,
      confirmLabel: request?.confirmLabel,
      cancelLabel: request?.cancelLabel,
      onConfirm: request?.onConfirm,
    } satisfies GardenDialogProps,
  };
}
