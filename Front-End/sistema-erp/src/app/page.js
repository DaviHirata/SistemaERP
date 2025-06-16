"use client";

import Layout from "@/components/Layout";
import Cronometro from "@/components/Cronometro";
import ProtectedRoutes from "@/components/ProtectedRoutes";

export default function Home() {
  return (
    <ProtectedRoutes>
      <Layout>
        <Cronometro />
      </Layout>
    </ProtectedRoutes>
  );
}