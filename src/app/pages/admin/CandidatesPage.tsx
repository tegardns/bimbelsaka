import { useState, useEffect } from "react";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
// import { useState, useEffect, useMemo } from "react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  subject: string;
  teachingLevel: string;
  experience: string;
  motivation: string;
  referralSource: string;
  referralFriendName?: string;
  referralOther?: string;
  date: string;
}

export function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(
    null,
  );
  const itemsPerPage = 10;

  // Dummy data - dalam production, ambil dari API/localStorage
  // const allCandidates: Candidate[] = [
  //   {
  //     id: 1,
  //     name: "Ahmad Fauzi",
  //     email: "ahmad@email.com",
  //     phone: "081234567890",
  //     education: "S1",
  //     subject: "Matematika, Fisika",
  //     teachingLevel: "SMA",
  //     experience: "2 tahun mengajar di SMA",
  //     motivation:
  //       "Ingin berbagi ilmu dan membantu siswa memahami konsep dengan lebih baik",
  //     referralSource: "Instagram",
  //     date: "2026-05-01",
  //   },
  //   {
  //     id: 2,
  //     name: "Siti Nurhaliza",
  //     email: "siti@email.com",
  //     phone: "082345678901",
  //     education: "S1",
  //     subject: "Bahasa Inggris",
  //     teachingLevel: "SMP",
  //     experience: "1 tahun mengajar privat",
  //     motivation:
  //       "Passion dalam mengajar dan ingin mengembangkan kemampuan siswa",
  //     referralSource: "Teman",
  //     referralFriendName: "Rina",
  //     date: "2026-05-03",
  //   },
  //   {
  //     id: 3,
  //     name: "Budi Santoso",
  //     email: "budi@email.com",
  //     phone: "083456789012",
  //     education: "S2",
  //     subject: "Kimia, Biologi",
  //     teachingLevel: "SMA",
  //     experience: "3 tahun mengajar di bimbel",
  //     motivation: "Membantu siswa berprestasi dan mencapai cita-cita mereka",
  //     referralSource: "Facebook",
  //     date: "2026-04-28",
  //   },
  //   {
  //     id: 4,
  //     name: "Dewi Lestari",
  //     email: "dewi@email.com",
  //     phone: "084567890123",
  //     education: "S1",
  //     subject: "Calistung",
  //     teachingLevel: "Calistung",
  //     experience: "Fresh graduate pendidikan",
  //     motivation:
  //       "Suka mengajar anak kecil dan membangun fondasi belajar yang kuat",
  //     referralSource: "Lainnya",
  //     referralOther: "Spanduk di jalan",
  //     date: "2026-05-05",
  //   },
  // ];

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/tutors`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengambil data tutor");
      }

      const mapped: Candidate[] = result.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        education: item.education,
        subject: item.subject,
        teachingLevel: item.teaching_level,
        experience: item.experience,
        motivation: item.motivation,
        referralSource: item.referral_source || "",
        referralFriendName: item.referral_friend_name || undefined,
        referralOther: item.referral_other || undefined,
        date: item.created_at,
      }));

      setAllCandidates(mapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();

    const interval = setInterval(
      () => {
        fetchCandidates();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get unique months from data
  const availableMonths = Array.from(
    new Set(allCandidates.map((c) => c.date.substring(0, 7))),
  )
    .sort()
    .reverse()
    .map((monthStr) => {
      const [year, month] = monthStr.split("-");
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      return {
        value: monthStr,
        label: `${monthNames[parseInt(month) - 1]} ${year}`,
      };
    });

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth]);

  // Filter data
  const filteredCandidates = allCandidates.filter((candidate) => {
    const matchSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.includes(searchTerm);

    const matchMonth =
      selectedMonth === "" || candidate.date.substring(0, 7) === selectedMonth;

    return matchSearch && matchMonth;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCandidates.map((c) => {
        const referralInfo =
          c.referralSource === "Teman"
            ? `${c.referralSource} (${c.referralFriendName})`
            : c.referralSource === "Lainnya"
              ? `${c.referralSource} (${c.referralOther})`
              : c.referralSource;

        return {
          Nama: c.name,
          Email: c.email,
          Telepon: c.phone,
          Pendidikan: c.education,
          "Mata Pelajaran": c.subject,
          "Level Mengajar": c.teachingLevel,
          Pengalaman: c.experience,
          Motivasi: c.motivation,
          "Info Dari": referralInfo,
          "Tanggal Daftar": new Date(c.date).toLocaleDateString("id-ID"),
        };
      }),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Candidate");
    const fileName = selectedMonth
      ? `Data_Candidate_${selectedMonth}.xlsx`
      : `Data_Candidate_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <>
      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          Memuat data candidate...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Data Candidate Tutor
          </h1>
          <p className="text-muted-foreground">
            Kelola data calon tutor yang mendaftar
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">Semua Bulan</option>
                {availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {paginatedCandidates.length} dari{" "}
              {filteredCandidates.length} data
            </p>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Telepon
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Pendidikan
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Mata Pelajaran
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCandidates.map((candidate, index) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {candidate.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {candidate.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {candidate.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {candidate.education}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {candidate.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(candidate.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setViewingCandidate(candidate)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Sebelumnya
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {viewingCandidate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Detail Candidate</h2>
                <button
                  onClick={() => setViewingCandidate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Nama Lengkap
                  </label>
                  <p className="text-gray-900 mt-1">{viewingCandidate.name}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Email
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingCandidate.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Telepon
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingCandidate.phone}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Pendidikan
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingCandidate.education}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Tanggal Daftar
                    </label>
                    <p className="text-gray-900 mt-1">
                      {new Date(viewingCandidate.date).toLocaleDateString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Mata Pelajaran yang Dikuasai
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingCandidate.subject}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Level Mengajar
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingCandidate.teachingLevel}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Pengalaman Mengajar
                  </label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {viewingCandidate.experience}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Motivasi Menjadi Tutor
                  </label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {viewingCandidate.motivation}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Sumber Informasi
                  </label>
                  <p className="text-gray-900 mt-1">
                    {viewingCandidate.referralSource}
                    {viewingCandidate.referralSource === "Teman" &&
                      viewingCandidate.referralFriendName &&
                      ` (Nama Teman: ${viewingCandidate.referralFriendName})`}
                    {viewingCandidate.referralSource === "Lainnya" &&
                      viewingCandidate.referralOther &&
                      ` (${viewingCandidate.referralOther})`}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setViewingCandidate(null)}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
