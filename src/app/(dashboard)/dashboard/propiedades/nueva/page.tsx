import { PropiedadForm } from "@/components/PropiedadForm";

export default function NuevaPropiedadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Nueva propiedad</h1>
      <PropiedadForm />
    </div>
  );
}
