export function last5Days(data) {
  if (!Array.isArray(data)) return [];

  const sorted = [...data].sort((a, b) => {
    const da = new Date(`${a.RecordedDate} ${a.RecordedTime}`);
    const db = new Date(`${b.RecordedDate} ${b.RecordedTime}`);
    return da - db;
  });

  return sorted.slice(-5);
}
