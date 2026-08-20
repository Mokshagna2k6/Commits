import { randomBytes } from "crypto";

function pad(n: number, len = 4): string {
  return String(n).padStart(len, "0");
}

function nextSeq(): string {
  return pad(parseInt(randomBytes(2).toString("hex"), 16) % 10000);
}

const now = () => new Date();

export function estimateId(): string {
  const d = now();
  return `EST-${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${nextSeq()}`;
}

export function orderId(): string {
  const d = now();
  return `ORD-${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${nextSeq()}`;
}

export function invoiceId(): string {
  const d = now();
  return `INV-${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${nextSeq()}`;
}

export function crId(): string {
  return `CR-${now().getFullYear()}-${nextSeq()}`;
}

export function ticketId(): string {
  return `TKT-${now().getFullYear()}-${nextSeq()}`;
}

export function engagementId(): string {
  return `ENG-${now().getFullYear()}-${nextSeq()}`;
}

export function programId(): string {
  return `PGM-${now().getFullYear()}-${pad(parseInt(randomBytes(1).toString("hex"), 16) % 100, 2)}`;
}

export function orgId(): string {
  return `ORG-${now().getFullYear()}-${nextSeq()}`;
}

export function projectId(servicePrefix: string): string {
  return `${servicePrefix}-${now().getFullYear()}-${nextSeq()}`;
}
