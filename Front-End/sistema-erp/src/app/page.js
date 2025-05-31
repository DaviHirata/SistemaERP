"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Cronometro from "@/components/Cronometro";
import { useUser } from "@/context/UserContext";

export default function Home() {
  const router = useRouter();
  const { user, loadingUser } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  if (loadingUser) {
    return <div>Carregando usuário...</div>;
  }

  if(!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <Cronometro />
    </Layout>
  );
}