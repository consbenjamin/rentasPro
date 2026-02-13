import { ContratoForm } from "@/components/ContratoForm";

export default function NuevoContratoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Nuevo contrato</h1>
      <ContratoForm />
    </div>
  );
}
