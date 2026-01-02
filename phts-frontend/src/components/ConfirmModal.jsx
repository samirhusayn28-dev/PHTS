function ConfirmModal({ text, onYes, onNo }) {
  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center">
      <div className="modal glass rounded-3xl p-10 w-[380px]">
        <p className="mb-6">{text}</p>
        <div className="flex gap-4">
          <button onClick={onNo} className="flex-1 py-3 bg-white/10 rounded-xl">
            Cancel
          </button>
          <button onClick={onYes} className="flex-1 py-3 bg-red-600 rounded-xl">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
