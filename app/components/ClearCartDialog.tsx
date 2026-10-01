import Icon from "./Icon";
import Modal from "./Modal";

export default function ClearCartDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-raised text-content mx-auto flex items-center justify-center">
          <Icon name="alert" className="w-6 h-6" />
        </div>
        <h2 className="font-display text-xl font-bold text-content">
          ¿Vaciar carrito?
        </h2>
        <p className="text-sm text-muted">
          ¿Seguro que quieres eliminar todo el carrito? Esta acción quitará
          todos los libros seleccionados.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onCancel}
            className="py-2.5 px-4 rounded-lg border border-outline text-content hover:bg-surface-raised font-semibold text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
