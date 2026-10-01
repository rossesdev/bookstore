import type {
  Dispatch,
  FormEventHandler,
  RefObject,
  SetStateAction,
} from "react";
import type { CustomerInput } from "../types/store";
import Icon from "./Icon";
import Modal from "./Modal";

type RegistrationFields = CustomerInput;
type TouchedFields = Record<keyof CustomerInput, boolean>;

type RegistrationFormProps = {
  register: RegistrationFields;
  setRegister: Dispatch<SetStateAction<RegistrationFields>>;
  touched: TouchedFields;
  setTouched: Dispatch<SetStateAction<TouchedFields>>;
  firstNameRef: RefObject<HTMLInputElement | null>;
  lastNameRef: RefObject<HTMLInputElement | null>;
  emailRef: RefObject<HTMLInputElement | null>;
  validEmail: boolean;
  submitRegistration: FormEventHandler<HTMLFormElement>;
};

export default function RegistrationDialog({
  open,
  form,
}: {
  open: boolean;
  form: RegistrationFormProps;
}) {
  const {
    register,
    setRegister,
    touched,
    setTouched,
    firstNameRef,
    lastNameRef,
    emailRef,
    validEmail,
    submitRegistration,
  } = form;
  return (
    <Modal open={open} onClose={() => {}} locked>
      <div className="bg-surface-lowest text-content p-7 text-center">
        <div className="w-14 h-14 mx-auto rounded-lg bg-surface-raised flex items-center justify-center mb-3">
          <Icon name="book" className="w-7 h-7 text-muted" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          Bienvenido a Bookstore
        </h2>
        <p className="text-muted text-xs sm:text-sm mt-1.5">
          Crea tu perfil de lector para comenzar a explorar nuestro catálogo de
          libros.
        </p>
      </div>
      <form
        onSubmit={submitRegistration}
        noValidate
        className="p-6 sm:p-7 space-y-4"
      >
        {(["firstname", "lastname", "email"] as const).map((field) => {
          const label =
            field === "firstname"
              ? "Nombre"
              : field === "lastname"
                ? "Apellido"
                : "Correo Electrónico";
          const invalid =
            field === "email" ? !validEmail : !register[field].trim();
          return (
            <div key={field}>
              <label
                htmlFor={`reg-${field}`}
                className="block text-xs font-bold uppercase tracking-wider text-content mb-1.5"
              >
                {label} <span className="text-muted">*</span>
              </label>
              <input
                ref={
                  field === "firstname"
                    ? firstNameRef
                    : field === "lastname"
                      ? lastNameRef
                      : emailRef
                }
                id={`reg-${field}`}
                name={field}
                type={field === "email" ? "email" : "text"}
                autoComplete={
                  field === "email"
                    ? "email"
                    : field === "firstname"
                      ? "given-name"
                      : "family-name"
                }
                spellCheck={field === "email" ? false : undefined}
                value={register[field]}
                onChange={(event) =>
                  setRegister((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                onBlur={() =>
                  setTouched((current) => ({ ...current, [field]: true }))
                }
                aria-invalid={touched[field] && invalid}
                aria-describedby={
                  touched[field] && invalid ? `error-${field}` : undefined
                }
                placeholder={
                  field === "firstname"
                    ? "Ej. Ana…"
                    : field === "lastname"
                      ? "Ej. García…"
                      : "ana.garcia@ejemplo.com…"
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline text-content text-sm"
                required
              />
              <p
                id={`error-${field}`}
                aria-live="polite"
                className={`text-xs text-error mt-1 font-medium ${touched[field] && invalid ? "" : "hidden"}`}
              >
                {field === "email"
                  ? "Ingresa un correo válido, por ejemplo usuario@dominio.com."
                  : `Por favor ingresa tu ${label.toLowerCase()}.`}
              </p>
            </div>
          );
        })}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm tracking-wide  flex items-center justify-center gap-2"
          >
            <Icon name="check" className="w-4 h-4" />
            Crear usuario
          </button>
        </div>
        <p className="text-[11px] text-muted text-center">
          Registro obligatorio para navegar en la librería.
        </p>
      </form>
    </Modal>
  );
}
