import type { Dispatch, RefObject, SetStateAction } from "react";
import Icon from "./Icon";
import Modal from "./Modal";

type CancellationFormProps = {
  cancelId: string | null;
  reason: string;
  setReason: Dispatch<SetStateAction<string>>;
  reasonError: boolean;
  setReasonError: Dispatch<SetStateAction<boolean>>;
  reasonRef: RefObject<HTMLTextAreaElement | null>;
  closeCancel: () => void;
  confirmCancel: () => void;
};

export default function CancelOrderDialog({
  form,
}: {
  form: CancellationFormProps;
}) {
  const {
    cancelId,
    reason,
    setReason,
    reasonError,
    setReasonError,
    reasonRef,
    closeCancel,
    confirmCancel,
  } = form;
  const open = !!cancelId;
  return (
    <Modal open={open} onClose={closeCancel}>
      <div className="p-6 sm:p-7 space-y-5 relative">
        <button
          onClick={closeCancel}
          className="absolute top-5 right-5 p-1 text-muted hover:text-content rounded-lg hover:bg-surface-raised"
          aria-label="Cerrar modal"
        >
          <Icon name="x" />
        </button>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-surface-raised text-content flex items-center justify-center">
            <Icon name="x" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-content">
              Cancelar pedido
            </h2>
            <p className="text-xs text-muted">
              Esta acción dará de baja el pedido registrado.
            </p>
          </div>
        </div>
        <p className="text-sm text-content font-medium">
          ¿Seguro que quieres cancelar este pedido?
        </p>
        <div className="space-y-1.5">
          <label
            htmlFor="cancel-reason"
            className="block text-xs font-bold uppercase tracking-wider text-muted"
          >
            Motivo de cancelación{" "}
            <span className="text-muted">* (Obligatorio)</span>
          </label>
          <textarea
            ref={reasonRef}
            id="cancel-reason"
            name="cancel-reason"
            autoComplete="off"
            rows={3}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (event.target.value.trim()) setReasonError(false);
            }}
            placeholder="Explica brevemente por qué deseas cancelar el pedido…"
            aria-invalid={reasonError}
            aria-describedby={reasonError ? "err-cancel-reason" : undefined}
            className="w-full px-3 py-2 text-sm rounded-lg border border-outline text-content resize-none"
          />
          <p
            id="err-cancel-reason"
            aria-live="polite"
            className={`text-xs text-error font-medium ${reasonError ? "" : "hidden"}`}
          >
            Escribe un motivo para poder cancelar el pedido.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={closeCancel}
            className="py-2.5 px-4 rounded-lg border border-outline text-content hover:bg-surface-raised font-semibold text-sm"
          >
            Volver
          </button>
          <button
            onClick={confirmCancel}
            className="py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm"
          >
            Confirmar cancelación
          </button>
        </div>
      </div>
    </Modal>
  );
}
