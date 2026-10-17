import {
  ChartIcon,
  CoinsIcon,
  CreditCardIcon,
  PiggyBankIcon,
  ShieldIcon,
  TrendingUpIcon,
  WalletIcon,
  ZapIcon,
} from "../ui";

const RINGS = [
  {
    id: "inner",
    size: 460,
    duration: 62,
    reverse: false,
    chips: [
      { icon: WalletIcon, angle: 250, tone: "emerald" },
      { icon: CoinsIcon, angle: 110, tone: "sky" },
    ],
  },
  {
    id: "middle",
    size: 700,
    duration: 92,
    reverse: true,
    chips: [
      { icon: CreditCardIcon, angle: 282, tone: "sky" },
      { icon: ShieldIcon, angle: 78, tone: "emerald" },
      { icon: PiggyBankIcon, angle: 225, tone: "violet" },
      { icon: ChartIcon, angle: 135, tone: "coral" },
    ],
  },
  {
    id: "outer",
    size: 940,
    duration: 128,
    reverse: false,
    chips: [
      { icon: ZapIcon, angle: 308, tone: "amber" },
      { icon: TrendingUpIcon, angle: 52, tone: "emerald" },
      { icon: CoinsIcon, angle: 258, tone: "coral" },
      { icon: CreditCardIcon, angle: 102, tone: "sky" },
    ],
  },
];

export function OrbitField() {
  return (
    <div className="rs-orbit" aria-hidden="true">
      {RINGS.map((ring) => (
        <div
          key={ring.id}
          className={`rs-orbit-ring rs-orbit-ring-${ring.id}${
            ring.reverse ? " rs-orbit-ring-reverse" : ""
          }`}
          style={{
            "--ring-size": `${ring.size}px`,
            "--ring-duration": `${ring.duration}s`,
          }}
        >
          {ring.chips.map((chip) => {
            const Icon = chip.icon;
            return (
              <span
                key={`${ring.id}-${chip.angle}`}
                className="rs-orbit-satellite"
                style={{
                  "--chip-angle": `${chip.angle}deg`,
                  "--chip-counter-angle": `${-chip.angle}deg`,
                }}
              >
                <span className={`rs-orbit-chip rs-orbit-chip-${chip.tone}`}>
                  <Icon size={18} />
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
