import { useState, useEffect, useMemo } from "react";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";

interface Student {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  address: string;
  grade: string;
  program: string;
  method: string;
  subjects: string;
  notes: string;
  referralSource: string;
  referralFriendName?: string;
  referralOther?: string;
  date: string;
}

export function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const itemsPerPage = 10;

  // Dummy data - dalam production, ambil dari API/localStorage
  // const allStudents: Student[] = [
  //   {
  //     id: 1,
  //     studentName: "Andi Pratama",
  //     parentName: "Budi Pratama",
  //     phone: "081234567890",
  //     email: "budi@email.com",
  //     address: "Jl. Merdeka No. 10, Purbalingga",
  //     grade: "SD Kelas 5",
  //     program: "SD",
  //     method: "Tutor ke Rumah",
  //     subjects: "Matematika, IPA",
  //     notes: "Butuh fokus lebih di matematika",
  //     referralSource: "Instagram",
  //     date: "2026-05-02",
  //   },
  //   {
  //     id: 2,
  //     studentName: "Sinta Dewi",
  //     parentName: "Ibu Ratna",
  //     phone: "082345678901",
  //     email: "ratna@email.com",
  //     address: "Jl. Sudirman No. 25, Purbalingga",
  //     grade: "SMP Kelas 8",
  //     program: "SMP",
  //     method: "Les Online",
  //     subjects: "Matematika, Bahasa Inggris",
  //     notes: "Persiapan ujian semester",
  //     referralSource: "Teman",
  //     referralFriendName: "Dewi Sartika",
  //     date: "2026-05-04",
  //   },
  //   {
  //     id: 3,
  //     studentName: "Raka Aditya",
  //     parentName: "Pak Suryanto",
  //     phone: "083456789012",
  //     email: "suryanto@email.com",
  //     address: "Jl. Veteran No. 5, Purbalingga",
  //     grade: "SMA Kelas 12",
  //     program: "SMA",
  //     method: "Tutor ke Rumah",
  //     subjects: "Matematika, Fisika, Kimia",
  //     notes: "Persiapan UTBK",
  //     referralSource: "Tiktok",
  //     date: "2026-04-30",
  //   },
  //   {
  //     id: 4,
  //     studentName: "Nina Cantika",
  //     parentName: "Ibu Sari",
  //     phone: "084567890123",
  //     email: "sari@email.com",
  //     address: "Jl. Ahmad Yani No. 12, Purbalingga",
  //     grade: "Calistung",
  //     program: "Calistung",
  //     method: "Tutor ke Rumah",
  //     subjects: "Membaca, Menulis, Berhitung",
  //     notes: "Anak usia 5 tahun, persiapan masuk SD",
  //     referralSource: "Lainnya",
  //     referralOther: "Brosur di sekolah",
  //     date: "2026-05-06",
  //   },
  // ];
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/students`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengambil data siswa");
      }

      const mapped: Student[] = result.data.map((item: any) => ({
        id: item.id,
        studentName: item.student_name,
        parentName: item.parent_name,
        phone: item.phone,
        email: item.email || "",
        address: item.address,
        grade: item.grade,
        program: item.program,
        method: item.method,
        subjects: item.subjects,
        notes: item.notes || "",
        referralSource: item.referral_source || "",
        referralFriendName: item.referral_friend_name || undefined,
        referralOther: item.referral_other || undefined,
        date: item.created_at,
      }));

      setAllStudents(mapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    const interval = setInterval(() => {
      fetchStudents();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Get unique months from data
  const availableMonths = Array.from(
    new Set(allStudents.map((s) => s.date.substring(0, 7))),
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
  const filteredStudents = allStudents.filter((student) => {
    const matchSearch =
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm);

    const matchMonth =
      selectedMonth === "" || student.date.substring(0, 7) === selectedMonth;

    return matchSearch && matchMonth;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredStudents.map((s) => {
        const referralInfo =
          s.referralSource === "Teman"
            ? `${s.referralSource} (${s.referralFriendName})`
            : s.referralSource === "Lainnya"
              ? `${s.referralSource} (${s.referralOther})`
              : s.referralSource;

        return {
          "Nama Siswa": s.studentName,
          "Nama Orang Tua": s.parentName,
          Telepon: s.phone,
          Email: s.email,
          Alamat: s.address,
          Kelas: s.grade,
          Program: s.program,
          Metode: s.method,
          "Mata Pelajaran": s.subjects,
          Catatan: s.notes,
          "Info Dari": referralInfo,
          "Tanggal Daftar": new Date(s.date).toLocaleDateString("id-ID"),
        };
      }),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendaftar");
    const fileName = selectedMonth
      ? `Data_Pendaftar_${selectedMonth}.xlsx`
      : `Data_Pendaftar_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <>
      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          Memuat data siswa...
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
            Data Pendaftar Siswa
          </h1>
          <p className="text-muted-foreground">
            Kelola data siswa yang mendaftar les
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
                  placeholder="Cari nama siswa, orang tua, atau telepon..."
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
              Menampilkan {paginatedStudents.length} dari{" "}
              {filteredStudents.length} data
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
                    Nama Siswa
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Orang Tua
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Telepon
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Kelas
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Metode
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
                {paginatedStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {student.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.parentName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.grade}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.program}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.method}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(student.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setViewingStudent(student)}
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
        {viewingStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Detail Pendaftar</h2>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Nama Siswa
                  </label>
                  <p className="text-gray-900 mt-1">
                    {viewingStudent.studentName}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Nama Orang Tua/Wali
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingStudent.parentName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Telepon
                    </label>
                    <p className="text-gray-900 mt-1">{viewingStudent.phone}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Email
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingStudent.email || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Tanggal Daftar
                    </label>
                    <p className="text-gray-900 mt-1">
                      {new Date(viewingStudent.date).toLocaleDateString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Alamat
                  </label>
                  <p className="text-gray-900 mt-1">{viewingStudent.address}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Kelas/Tingkat
                    </label>
                    <p className="text-gray-900 mt-1">{viewingStudent.grade}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Program
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingStudent.program}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Metode Belajar
                    </label>
                    <p className="text-gray-900 mt-1">
                      {viewingStudent.method}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Mata Pelajaran yang Ingin Dipelajari
                  </label>
                  <p className="text-gray-900 mt-1">
                    {viewingStudent.subjects || "-"}
                  </p>
                </div>
                {viewingStudent.notes && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Catatan Tambahan
                    </label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                      {viewingStudent.notes}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Sumber Informasi
                  </label>
                  <p className="text-gray-900 mt-1">
                    {viewingStudent.referralSource}
                    {viewingStudent.referralSource === "Teman" &&
                      viewingStudent.referralFriendName &&
                      ` (Nama Teman: ${viewingStudent.referralFriendName})`}
                    {viewingStudent.referralSource === "Lainnya" &&
                      viewingStudent.referralOther &&
                      ` (${viewingStudent.referralOther})`}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setViewingStudent(null)}
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
