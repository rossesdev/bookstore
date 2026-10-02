import Icon from "./Icon";
import Modal from "./Modal";

export default function PurchaseSuccessDialog({
  open,
  onContinue,
}: {
  open: boolean;
  onContinue: () => void;
}) {
  return (
    <Modal open={open} onClose={() => {}} locked>
      <div className="p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
          <Icon name="check" className="w-9 h-9" />
        </div>
        <span className="inline-block text-xs uppercase tracking-widest text-success font-bold bg-success/10 px-3 py-1 rounded-full border border-success/30">
          ¡Pago confirmado!
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-content">
          ¡Felicidades, compraste tus libros!
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Tu pedido ahora aparece como pagado en <strong>Mis libros</strong>.
        </p>
        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm"
        >
          Volver al dashboard
        </button>
      </div>
    </Modal>
  );
}
