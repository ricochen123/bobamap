/** Slide-up drawer for shop list on mobile */
export default function MobileDrawer({ open, onToggle, children, title = "Nearby boba" }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-boba-500 px-6 py-3 font-semibold text-white shadow-lg md:hidden"
      >
        {open ? "Hide list" : `🧋 ${title}`}
      </button>

      <div
        className={`fixed inset-x-0 bottom-0 z-20 max-h-[70vh] transform rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 md:hidden ${
          open ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
        }`}
      >
        <div className="flex justify-center py-3" onClick={onToggle} role="presentation">
          <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="overflow-y-auto px-4 pb-24 pt-2">{children}</div>
      </div>
    </>
  );
}
