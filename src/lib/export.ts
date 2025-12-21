import type { PNodeWithScore } from "@/types/pnode";

export function exportToCSV(nodes: PNodeWithScore[], filename: string = "xandeum-pnodes"): void {
  const headers = [
    "Pubkey",
    "IP Address",
    "Port",
    "Status",
    "Credits",
    "X-Score",
    "Version",
    "Is Public",
    "Storage Committed (bytes)",
    "Storage Used (bytes)",
    "Storage Usage %",
    "Uptime (seconds)",
    "Last Seen (timestamp)",
  ];

  const rows = nodes.map((node) => [
    node.pubkey,
    node.ip,
    node.port,
    node.status,
    node.credits,
    node.xScore,
    node.version,
    node.is_public ? "Yes" : "No",
    node.storage_committed,
    node.storage_used,
    node.storage_usage_percent.toFixed(6),
    node.uptime,
    node.last_seen_timestamp,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(nodes: PNodeWithScore[], filename: string = "xandeum-pnodes"): void {
  const data = {
    exportedAt: new Date().toISOString(),
    totalNodes: nodes.length,
    nodes: nodes.map((node) => ({
      pubkey: node.pubkey,
      address: node.address,
      ip: node.ip,
      port: node.port,
      rpc_port: node.rpc_port,
      status: node.status,
      credits: node.credits,
      xScore: node.xScore,
      version: node.version,
      is_public: node.is_public,
      storage_committed: node.storage_committed,
      storage_used: node.storage_used,
      storage_usage_percent: node.storage_usage_percent,
      uptime: node.uptime,
      last_seen_timestamp: node.last_seen_timestamp,
    })),
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
