import { Quote } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function QuoteCard({ quote }: { quote?: string | null }) {
  return (
    <Card title="Daily Quote">
      <div className="flex gap-4">
        <Quote size={22} className="mt-1 shrink-0 text-[#34D399]" />
        <p className="text-lg leading-8 text-white">
          {quote?.trim() || "No quote added today."}
        </p>
      </div>
    </Card>
  );
}
