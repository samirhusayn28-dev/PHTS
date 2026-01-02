function SectionHeader({ title, subtitle, icon }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
          {icon}
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-slate-400 mt-2 ml-12 max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
