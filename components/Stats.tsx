"use client";

interface StatItem {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

interface StatsProps {
  stats: StatItem[];
}

export default function Stats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-[#111827] border border-gray-800 rounded-xl p-4 text-center"
        >
          <div
            className={`text-2xl font-black ${stat.color || "text-[#35D07F]"}`}
          >
            {stat.value}
          </div>
          <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          {stat.sub && (
            <div className="text-xs text-gray-600 mt-0.5">{stat.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
