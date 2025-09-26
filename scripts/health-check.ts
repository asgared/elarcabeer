import {runHealthChecks} from "@/lib/health";

async function main() {
  const report = await runHealthChecks();

  console.table(
    report.checks.map((check) => ({
      componente: check.label,
      estado: check.status,
      detalles: check.details ?? "--"
    }))
  );

  if (report.status === "error") {
    process.exitCode = 1;
  }
}

void main();
