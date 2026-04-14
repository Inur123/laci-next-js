import { Pool, Client } from "pg";
import { EventEmitter } from "events";

/**
 * GLOBAL REALTIME HUB
 * 
 * Strategi: "Satu Koneksi untuk Ribuan User"
 * Kita hanya pakai 1 koneksi database persisten untuk LISTEN,
 * lalu disebarkan ke semua user yang sedang online lewat memori (EventEmitter).
 */

// Singleton Emitter untuk membagikan berita di memori server
export const realtimeHub = new EventEmitter();
realtimeHub.setMaxListeners(2000); // Dukung sampai 2000 user online sekaligus

let pool: Pool | null = null;
let listenerClient: Client | null = null;

export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL not set");
    
    pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

/**
 * Memulai Listener Tunggal (PENTING!)
 * Dipanggil otomatis saat ada user yang konek.
 */
async function startGlobalListener() {
  if (listenerClient) return; // Sudah jalan

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  try {
    listenerClient = new Client({ connectionString: databaseUrl });
    
    await listenerClient.connect();
    await listenerClient.query("LISTEN laci_realtime");

    listenerClient.on("notification", (msg) => {
      const payload = msg.payload || "{}";
      // SEBARKAN BERITA KE SEMUA USER (DI MEMORI)
      realtimeHub.emit("update", payload);
    });

    listenerClient.on("error", (err) => {
      console.error("[Realtime] Listener Error:", err.message);
      listenerClient = null;
      setTimeout(startGlobalListener, 5000); // Auto-reconnect jika putus
    });

  } catch (err) {
    console.error("[Realtime] Failed to start listener:", (err as Error).message);
    listenerClient = null;
    setTimeout(startGlobalListener, 5000);
  }
}

// Jalankan listener secara otomatis, tapi hanya jika dalam konteks server (bukan saat build/seed)
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  // Hanya jalankan jika kita tidak sedang dalam script CLI murni (seperti seed)
  // Next.js biasanya mendefinisikan NEXT_RUNTIME di dalam API routes
  const isServer = process.env.NEXT_RUNTIME === "nodejs" || process.env.PHASE === "phase-production-server" || process.env.NODE_ENV === "development";
  
  if (isServer) {
     startGlobalListener();
  }
}

/**
 * Panggil fungsi ini jika ada mutasi data (Create/Update/Delete)
 */
export async function notifyRealtime(payload: object) {
  try {
    const p = getPool();
    await p.query("SELECT pg_notify($1, $2)", [
      "laci_realtime",
      JSON.stringify(payload),
    ]);
  } catch (err) {
    console.error("[Realtime] Notification failed:", (err as Error).message);
  }
}
