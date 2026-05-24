// import { Outlet } from "react-router-dom";
// import { Header } from "../Header";
// import { Footer } from "../Footer";

// export function PublicLayout() {
//   return (
//     <div className="min-h-screen">
//       <Header />
//       <Outlet />
//       <Footer />
//     </div>
//   );
// }

// src/app/components/layout/PublicLayout.tsx
//
// PERUBAHAN: Tambahkan import AISakaButton dan render di bawah PopupLokasi
// Sisanya tidak berubah — sesuaikan dengan isi PublicLayout kamu yang asli

import { Outlet } from "react-router-dom";
import { Header } from "../Header";
import { Footer } from "../Footer";

export function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
