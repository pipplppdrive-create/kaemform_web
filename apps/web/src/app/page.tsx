import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BarChart3, FileCheck2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  const t = await getTranslations("landing");

  const features = [
    { Icon: FileCheck2, title: "Buat form", description: "Editor yang fokus" },
    { Icon: BarChart3, title: "Pantau respons", description: "Data real-time" },
    { Icon: Sparkles, title: "Pakai template", description: "Mulai lebih cepat" },
  ];

  return (
    <main className="brand-wash min-h-screen overflow-hidden">
      <div className="brand-accent h-[3px]" />
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo attribution="App by kaemnur" />
        <Link href="/login" className="text-sm font-semibold text-primary-700 transition-colors hover:text-primary-900">
          {t("ctaLogin")}
        </Link>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
        <div className="text-center lg:text-left">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-sm lg:mx-0">
            <Sparkles className="h-3.5 w-3.5" />
            Form builder Indonesia
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
            <span className="mt-2 block text-primary-600">cepat, rapi, dan ringan.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                {t("ctaLogin")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 rounded-full bg-primary-200/30 blur-3xl" />
          <div className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-form backdrop-blur sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">Workspace</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Semua alur dalam satu tempat</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Online</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {features.map(({ Icon, title, description }) => (
                <div key={title} className="rounded-card border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-input bg-primary-100 text-primary-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-card border border-primary-100 bg-primary-50 p-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Form aktif</span>
                <span>Respons hari ini</span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-3xl font-bold text-primary-800">12</span>
                <span className="text-3xl font-bold text-slate-900">148</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
