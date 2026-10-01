import { useRef, useState, type FormEvent } from "react";
import type { User } from "../types/store";

export function useRegistrationForm(
  setUser: (user: User) => void,
  toast: (message: string) => void,
) {
  const [register, setRegister] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [touched, setTouched] = useState({
    firstname: false,
    lastname: false,
    email: false,
  });
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(register.email.trim());
  const validRegister =
    !!register.firstname.trim() && !!register.lastname.trim() && validEmail;

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validRegister) {
      setTouched({ firstname: true, lastname: true, email: true });
      if (!register.firstname.trim()) firstNameRef.current?.focus();
      else if (!register.lastname.trim()) lastNameRef.current?.focus();
      else emailRef.current?.focus();
      return;
    }
    const next = {
      firstname: register.firstname.trim(),
      lastname: register.lastname.trim(),
      email: register.email.trim(),
    };
    setUser(next);
    toast(`¡Bienvenido a Aura Books, ${next.firstname}!`);
  }

  return {
    register,
    setRegister,
    touched,
    setTouched,
    firstNameRef,
    lastNameRef,
    emailRef,
    validEmail,
    submitRegistration,
  };
}
