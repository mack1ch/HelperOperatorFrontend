import { Histogram } from "@/entities/chart-slice/histogram";
import { ChartTable } from "@/entities/chart-slice/table";
import { IssuesQuestionsTable } from "@/entities/chart-slice/tableWithIssues/ui/ui";

export default function StatsPage() {
  return (
    <section
      style={{
        padding: 20,
        overflowY: "auto",
        maxHeight: "calc(100vh - 120px)",
      }}
    >
      <ChartTable pageSize={6} />
      <Histogram topN={10} />
      <IssuesQuestionsTable pageSize={8} />
    </section>
  );
}
