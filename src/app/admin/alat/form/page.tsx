"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, ImageIcon, X } from "lucide-react";

function AlatFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!idParam);
    const [kategoriList, setKategoriList] = useState<any[]>([]);

    const [dragActive, setDragActive] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [form, setForm] = useState({
        id: null as number | null,
        nama: "",
        deskripsi: "",
        kategoriId: 0,
        image: "",
        merk: ""
    });

    useEffect(() => {
        const fetchKategori = async () => {
            try {
                const res = await fetch("/api/kategori");
                const katJson = await res.json();
                setKategoriList(katJson.data || katJson);
            } catch (err) {
                console.error("Gagal mengambil kategori", err);
            }
        };
        fetchKategori();

        if (idParam) {
            const fetchAlat = async () => {
                try {
                    const res = await fetch(`/api/alat/${idParam}`);
                    if (!res.ok) throw new Error("Gagal mengambil data alat");
                    const data = await res.json();

                    setForm({
                        id: data.id,
                        nama: data.nama,
                        deskripsi: data.deskripsi || "",
                        kategoriId: data.kategoriId,
                        image: data.image || "",
                        merk: data.merk || ""
                    });

                    if (data.image) {
                        setPreviewImage(data.image);
                    }
                } catch (error) {
                    console.error(error);
                    alert("Alat tidak ditemukan.");
                    router.push("/admin/alat");
                } finally {
                    setFetching(false);
                }
            };
            fetchAlat();
        } else {
            setFetching(false);
        }
    }, [idParam, router]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "kategoriId" ? Number(value) : value,
        }));
    };

    // --- Drag and Drop Handlers ---
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            alert("Format file tidak didukung. Harap gunakan JPG atau PNG.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar. Maksimal 2MB.");
            return;
        }

        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
        setForm(prev => ({ ...prev, image: "" })); // Clear existing string URL if new file uploaded
    };

    const clearImage = () => {
        setSelectedFile(null);
        setPreviewImage(null);
        setForm(prev => ({ ...prev, image: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // --- Form Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.kategoriId === 0) {
            alert("Harap pilih kategori.");
            return;
        }

        setLoading(true);

        try {
            let imageUrl = form.image;

            // Jika ada file baru yang dipilih, upload terlebih dahulu
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const errObj = await uploadRes.json();
                    throw new Error(errObj.error || "Gagal mengunggah gambar");
                }

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            }

            const method = form.id ? "PUT" : "POST";
            const payload = { ...form, image: imageUrl };

            const res = await fetch("/api/alat", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

            router.push("/admin/alat");
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
            {/* Kiri: Info Form */}
            <div className="flex-1 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Alat</label>
                    <input
                        required
                        name="nama"
                        type="text"
                        placeholder="Contoh: Kamera DSLR Canon"
                        value={form.nama}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                    <select
                        name="kategoriId"
                        value={form.kategoriId}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    >
                        <option value={0} disabled>Pilih Kategori</option>
                        {kategoriList.map(k => (
                            <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Merk/Brand</label>
                    <input
                        required
                        name="merk"
                        type="text"
                        placeholder="Contoh: Kamera DSLR Canon"
                        value={form.merk}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi (Opsional)</label>
                    <textarea
                        name="deskripsi"
                        rows={4}
                        placeholder="Masukkan deskripsi detail mengenai alat..."
                        value={form.deskripsi}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                    />
                </div>
            </div>

            {/* Kanan: Drag n Drop Image */}
            <div className="w-full md:w-1/3 flex flex-col space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Alat</label>
                <div
                    className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                        } ${previewImage ? 'border-transparent overflow-hidden' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !previewImage && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileInput}
                        className="hidden"
                    />

                    {previewImage ? (
                        <>
                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 cursor-pointer">
                            <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold text-blue-600">Klik untuk upload</span> atau drag and drop
                            </p>
                            <p className="text-xs text-center text-gray-400">JPG, PNG (Max 2MB)</p>
                        </div>
                    )}
                </div>

                {/* Submit button on bottom right */}
                <div className="mt-auto pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Save size={18} />
                        )}
                        {form.id ? "Simpan Perbaikan" : "Simpan Alat Baru"}
                    </button>
                </div>
            </div>

        </form>
    );
}

export default function AlatFormPage() {
    return (
        <AppLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-8 max-w-4xl mx-auto">
                    <Link
                        href="/admin/alat"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium mb-4"
                    >
                        <ArrowLeft size={16} /> Kembali ke Katalog Alat
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        <Suspense fallback="Loading...">
                            <FormTitle />
                        </Suspense>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Lengkapi informasi spesifikasi alat di bawah ini</p>
                </div>

                <Suspense fallback={
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                }>
                    <AlatFormContent />
                </Suspense>
            </div>
        </AppLayout>
    );
}

function FormTitle() {
    const searchParams = useSearchParams();
    return searchParams.get("id") ? "Edit Data Alat" : "Tambah Alat Baru";
}
