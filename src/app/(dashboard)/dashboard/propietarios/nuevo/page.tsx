import { PropietarioForm } from "@/components/PropietarioForm";

export default function NuevoPropietarioPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Nuevo propietario</h1>
      <PropietarioForm />
    </div>
  );
}
