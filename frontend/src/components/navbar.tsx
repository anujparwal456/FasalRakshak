"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { EnhancedLogo } from "@/components/enhanced-logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Bot, Scan, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from "@/lib/translations";

export default function Navbar() {
  const router = useRouter();
  const { language } = useLanguage();
  const supabase = createClient();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserName(null);
      setLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (!error && profile) setUserName(profile.full_name);

    setLoading(false);
  };

  useEffect(() => {
    fetchUserProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUserProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserName(null);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-green-200 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <EnhancedLogo size="md" />
        </Link>

        {!loading && (
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              asChild
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 bg-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link href="/">
                <span className="hidden sm:inline">{translate("home", language)}</span>
                <span className="sm:hidden">{translate("home", language)}</span>
              </Link>
            </Button>
            {userName && (
              <Button
                asChild
                variant="outline"
                className="border-blue-500 text-blue-700 hover:bg-blue-50 bg-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link href="/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{translate("analytics", language)}</span>
                </Link>
              </Button>
            )}
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/chatbot">
                <Bot className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{translate("aiAssistant", language)}</span>
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/scan">
                <Scan className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{translate("scan", language)}</span>
              </Link>
            </Button>

            {userName ? (
              <>
                <span className="text-gray-700 font-medium">Hi, {userName}</span>
                <Button onClick={handleLogout} variant="outline">
                  {translate("logout", language)}
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button>{translate("login", language)}</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
