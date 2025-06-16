"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "@/components/Layout";
import EditarUsuario from "@/components/EditarUsuario";
import { useUser } from "@/context/UserContext";
import ProtectedRoutes from "@/components/ProtectedRoutes";

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const usuarioId = params.usuarioId;
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

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <ProtectedRoutes>
      <Layout user={user}>
        <EditarUsuario usuarioId={usuarioId}/>
      </Layout>
    </ProtectedRoutes>
  );
}