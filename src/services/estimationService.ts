export function calculateEstimatedArrival(branchPrepTimeMinutes: number, queueCount: number, travelTimeMinutes: number): number {
  // Asumsi: setiap antrian butuh waktu rata-rata 3 menit ekstra, max 30 menit dari antrian
  const queueTime = Math.min(queueCount * 3, 30);
  
  // Total ETA = waktu prep dasar + tambahan karena antrian + waktu perjalanan
  return branchPrepTimeMinutes + queueTime + travelTimeMinutes;
}
