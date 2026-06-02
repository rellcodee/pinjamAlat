import { PrismaClient } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Memulai proses pembersihan data lama (Clean Up)...');

    // Urutan hapus dari tabel anak (transaksi) ke tabel induk (master)
    // Biar gak kena error Foreign Key Constraint di MySQL lo

    // 1. Matikan proteksi foreign key biar MySQL gak komplain pas kita paksa kosongin tabel
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    // 2. Gunakan TRUNCATE agar data terhapus SEKALIGUS hitungan ID balik ke 1
    // PENTING: Pakai nama asli tabel di MySQL lo (huruf kecil semua dan pakai _)
    await prisma.$executeRawUnsafe('TRUNCATE TABLE log_aktivitas;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE pengembalian;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE detail_peminjaman;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE peminjaman;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE alat_unit;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE alat;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE pengaturan;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE users;'); // <--- Nama tabel MySQL untuk model User
    await prisma.$executeRawUnsafe('TRUNCATE TABLE kategori;');

    // 3. Nyalakan kembali proteksi foreign key demi keamanan database
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('✨ Data lama berhasil dibersihkan & Semua ID di-reset ke 1!');

    // ==========================================
    // SEEDING DATA MASTER UTAMA
    // ==========================================

    console.log('Membuat user Admin baru...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Masuk ke aturan Prisma: ngebungkus field di dalam objek `data`
    const admin = await prisma.user.create({
        data: {
            nama: 'Super Admin',
            username: 'admin',          // Kolom asli lo (UNI)
            password: hashedPassword,   // Hasil hash bcryptjs
            role: 'admin',              // Enum huruf kecil sesuai DB lo
            // Kolom kelas, noTelp, dll dikosongin karena tipenya nullable (YES)
        },
    });

    console.log('Membuat Kategori Default...');
    // Menggunakan array [] di dalam properti `data` karena bikin banyak baris sekaligus
    await prisma.kategori.createMany({
        data: [
            { nama: 'Elektronik', deskripsi: 'Alat elektronik', kode: 'ELE' },
            { nama: 'Perkakas', deskripsi: 'Alat perkakas', kode: 'PER' },
        ],
    });

    console.log(`\n SEEDING SELESAI DENGAN SUKSES!`);
    console.log(`Username Admin : ${admin.username}`);
    console.log(`Password Admin : admin123`);
}

main()
    .catch((e) => {
        console.error('❌ Terjadi error saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });