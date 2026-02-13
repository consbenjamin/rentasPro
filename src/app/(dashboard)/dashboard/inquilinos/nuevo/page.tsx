import { InquilinoForm } from "@/components/InquilinoForm";

export default function NuevoInquilinoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Nuevo inquilino</h1>
      <InquilinoForm />
    </div>
  );
}
