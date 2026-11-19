import { Banknote, CreditCard } from "lucide-react";

const OPTIONS = [
  {
    value: "CASH",
    title: "Thanh toán tại khách sạn",
    description: "Trả khi nhận phòng, không cần trả trước.",
    icon: Banknote,
  },
  {
    value: "ONLINE",
    title: "Thanh toán online",
    description: "Thẻ hoặc ví điện tử (bản demo).",
    icon: CreditCard,
  },
];

function PaymentMethodSelect({ value, onChange }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Phương thức thanh toán</h2>

      <div role="radiogroup" aria-label="Phương thức thanh toán" className="mt-4 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ value: optionValue, title, description, icon: Icon }) => {
          const selected = value === optionValue;

          return (
            <label
              key={optionValue}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-blue-500/30 ${
                selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={optionValue}
                checked={selected}
                onChange={() => onChange(optionValue)}
                className="sr-only"
              />

              <Icon size={20} className={`mt-0.5 shrink-0 ${selected ? "text-blue-600" : "text-slate-400"}`} />

              <span>
                <span className="block text-sm font-semibold text-slate-900">{title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export default PaymentMethodSelect;
