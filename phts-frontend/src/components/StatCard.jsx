function StatCard({ title, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lift">
      <p className="text-slate-400">{title}</p>
      <h2 className="text-3xl font-semibold mt-2">{value}</h2>
    </div>
  );
}

export default StatCard;
