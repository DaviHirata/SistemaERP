"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Layout from "@/components/Layout";
import Cronometro from "@/components/Cronometro";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioData = localStorage.getItem("usuario");
    
    if (!token) {
      router.push("/login");
    } else {
      // Se você salvou os dados do usuário
      if (usuarioData) {
        try {
          const usuario = JSON.parse(usuarioData);
          setUser({
            name: usuario.nome || usuario.email,
            email: usuario.email,
            // photoUrl: usuario.photoUrl
          });
        } catch (error) {
          console.error('Erro ao recuperar dados do usuário:', error);
          // Usar dados padrão se houver erro
          setUser({
            name: "Usuário",
            // photoUrl: "/caminho-da-foto.jpg"
          });
        }
      } else {
        // Dados padrão se não tiver dados salvos
        setUser({
          name: "Usuário",
          // photoUrl: "/caminho-da-foto.jpg"
        });
      }
      setLoading(false);
    }
  }, [router]);

  if (loading) {
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