import "./loader.css";

function Loader() {
  return (
    <div className="min-h-screen health-bg flex flex-col items-center justify-center text-white">
      <div className="loading mb-6">
        <svg width="96" height="72" viewBox="0 0 64 48">
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="back"
          />
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="front"
          />
        </svg>
      </div>
      <p className="text-slate-300 text-lg">
        Preparing your health dashboard…
      </p>
    </div>
  );
}

export default Loader;
