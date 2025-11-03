export async function logActivity(db, deskrip, userId) {
  try {
    await db.query(
      "INSERT INTO logaktivitas (userId, deskrip, createdAt) VALUES (?, ?, NOW())",
      [userId, deskrip]
    );
  } catch (error) {
    console.error("Gagal log aktivitas:", error);
  }
}