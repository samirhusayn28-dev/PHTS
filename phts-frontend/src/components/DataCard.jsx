function DataCard({ title, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 lift">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default DataCard;
