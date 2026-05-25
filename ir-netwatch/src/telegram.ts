import type { StatusChange } from './kv.ts';

export interface TelegramEnv {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export async function sendTelegramNotification(
  change: StatusChange,
  env: TelegramEnv,
): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const isRecovery = change.newStatus === 'up';
  const icon = isRecovery ? '🟢' : change.newStatus === 'down' ? '🔴' : '🟡';
  const verb = isRecovery ? 'recovered (UP)' : `went ${change.newStatus.toUpperCase()}`;
  const detail = isRecovery
    ? `└ Response: ${change.responseTimeMs}ms`
    : `└ Details: ${change.message}`;
  const text = [
    `${icon} <b>${change.name}</b> ${verb}`,
    `└ Was: ${change.prevStatus}  →  Now: ${change.newStatus}`,
    detail,
    `└ ${change.timestamp} UTC`,
  ].join('\n');
  await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
    },
  );
}
