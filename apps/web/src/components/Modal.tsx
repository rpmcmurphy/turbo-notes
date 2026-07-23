export default function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-stone-900/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-paper p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
