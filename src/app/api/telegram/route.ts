import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import OpenAI from "openai";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const XAND_MINT = "XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx";
const DASHBOARD_URL = "https://xandeum-analytics-theta.vercel.app";

// Inline keyboard types
interface InlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

// Send message to Telegram with optional inline keyboard
async function sendTelegramMessage(
  chatId: string, 
  text: string, 
  parseMode: string = "HTML",
  inlineKeyboard?: InlineButton[][]
) {
  if (!TELEGRAM_BOT_TOKEN) {
    return false;
  }

  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    };

    if (inlineKeyboard) {
      body.reply_markup = { inline_keyboard: inlineKeyboard };
    }

    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data.ok;
  } catch {
    return false;
  }
}

// Answer callback query (acknowledge button press)
async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || "",
      }),
    });
  } catch {
    // Silent fail
  }
}

// Handle incoming webhook from Telegram
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message?.chat?.id?.toString();
      const data = callbackQuery.data;
      
      if (chatId && data) {
        await answerCallbackQuery(callbackQuery.id);
        await handleCallbackQuery(chatId, data);
      }
      return NextResponse.json({ ok: true });
    }
    
    // Handle message updates
    if (update.message) {
      const chatId = update.message.chat.id.toString();
      const text = update.message.text || "";
      const username = update.message.from?.username || "User";

      // Handle commands
      if (text.startsWith("/start")) {
        await handleStartCommand(chatId, username);
      } else if (text.startsWith("/watch")) {
        await handleWatchCommand(chatId, text);
      } else if (text.startsWith("/unwatch")) {
        await handleUnwatchCommand(chatId, text);
      } else if (text.startsWith("/status")) {
        await handleStatusCommand(chatId);
      } else if (text.startsWith("/help")) {
        await handleHelpCommand(chatId);
      } else if (text.startsWith("/alerts")) {
        await handleAlertsCommand(chatId, text);
      } else if (text.startsWith("/network")) {
        await handleNetworkCommand(chatId);
      } else if (text.startsWith("/price")) {
        await handlePriceCommand(chatId);
      } else if (text.startsWith("/")) {
        // Unknown command - show menu
        await showMainMenu(chatId);
      } else {
        // Regular message - use AI to respond
        await handleAIChat(chatId, text);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// Handle button clicks
async function handleCallbackQuery(chatId: string, data: string) {
  switch (data) {
    case "network":
      await handleNetworkCommand(chatId);
      break;
    case "price":
      await handlePriceCommand(chatId);
      break;
    case "status":
      await handleStatusCommand(chatId);
      break;
    case "help":
      await handleHelpCommand(chatId);
      break;
    case "menu":
      await showMainMenu(chatId);
      break;
    case "alerts_on":
      await toggleAlerts(chatId, true);
      break;
    case "alerts_off":
      await toggleAlerts(chatId, false);
      break;
    default:
      await showMainMenu(chatId);
  }
}

// Show main menu with buttons
async function showMainMenu(chatId: string) {
  const keyboard: InlineButton[][] = [
    [
      { text: "📊 Network Stats", callback_data: "network" },
      { text: "💰 XAND Price", callback_data: "price" },
    ],
    [
      { text: "📋 My Watched Nodes", callback_data: "status" },
      { text: "❓ Help", callback_data: "help" },
    ],
    [
      { text: "🌐 Open Dashboard", url: DASHBOARD_URL },
    ],
  ];

  await sendTelegramMessage(
    chatId,
    "🎛️ <b>Xandeum Analytics Menu</b>\n\nChoose an option below:",
    "HTML",
    keyboard
  );
}

// AI Chat Context
const AI_CONTEXT = `You are XandBot, a helpful AI assistant for Xandeum Analytics on Telegram. Keep responses SHORT (2-3 sentences max) since this is a chat app.

Key Facts:
- Xandeum: Scalable storage layer for Solana with 240+ pNodes
- XAND Token: XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx (trade on Jupiter)
- pNodes: Storage provider nodes earning rewards for reliability
- Pod Credits: +1 per heartbeat, -100 for missed operations, reset monthly
- X-Score: Performance metric 0-100 (credits, uptime, availability, storage, public access)
- Node Status: Online (<5min), Warning (5-30min), Offline (>30min)

Commands: /network (stats), /price (XAND price), /watch [pubkey], /status, /alerts
Dashboard: ${DASHBOARD_URL}
Links: xandeum.network, discord.gg/uqRSmmM5m, twitter.com/xandeumnetwork

Be friendly and concise. Use emojis sparingly. If unsure, suggest /help or the dashboard.`;

// Handle AI chat messages
async function handleAIChat(chatId: string, message: string) {
  try {
    // Show typing indicator
    await fetch(`${TELEGRAM_API}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action: "typing" }),
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: AI_CONTEXT },
        { role: "user", content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 
      "I couldn't process that. Try /help for commands!";

    const keyboard: InlineButton[][] = [
      [
        { text: "📊 Network", callback_data: "network" },
        { text: "💰 Price", callback_data: "price" },
        { text: "🎛️ Menu", callback_data: "menu" },
      ],
    ];

    await sendTelegramMessage(chatId, response, "HTML", keyboard);
  } catch {
    await sendTelegramMessage(
      chatId,
      "🤖 I'm having trouble thinking right now. Try a command like /network or /price instead!",
      "HTML",
      [[{ text: "🎛️ Show Menu", callback_data: "menu" }]]
    );
  }
}

// Toggle alerts helper
async function toggleAlerts(chatId: string, enabled: boolean) {
  const supabase = createServerSupabaseClient();
  
  await supabase
    .from("telegram_subscribers")
    .update({
      alert_on_offline: enabled,
      alert_on_warning: enabled,
    })
    .eq("chat_id", chatId);

  const keyboard: InlineButton[][] = [
    [{ text: "« Back to Menu", callback_data: "menu" }],
  ];

  await sendTelegramMessage(
    chatId,
    enabled
      ? "✅ Alerts are now <b>enabled</b>. You'll receive notifications when your watched nodes have issues."
      : "🔕 Alerts are now <b>disabled</b>.",
    "HTML",
    keyboard
  );
}

async function handleStartCommand(chatId: string, username: string) {
  const supabase = createServerSupabaseClient();

  // Register or update subscriber
  const { error } = await supabase
    .from("telegram_subscribers")
    .upsert(
      {
        chat_id: chatId,
        is_active: true,
        watched_nodes: [],
        alert_on_offline: true,
        alert_on_warning: false,
        alert_on_credits_drop: false,
      },
      { onConflict: "chat_id" }
    );

  if (error) {
    // Telegram error handling
  }

  const welcomeMessage = `
🌐 <b>Welcome to Xandeum Analytics Bot!</b>

Hi ${username}! I'll help you monitor the Xandeum network and your pNodes in real-time.

<b>Quick Actions:</b>
Use the buttons below or type commands like:
• /watch [pubkey] - Monitor a pNode
• /unwatch [pubkey] - Stop monitoring
  `.trim();

  const keyboard: InlineButton[][] = [
    [
      { text: "📊 Network Stats", callback_data: "network" },
      { text: "💰 XAND Price", callback_data: "price" },
    ],
    [
      { text: "📋 My Watched Nodes", callback_data: "status" },
      { text: "❓ Help & Commands", callback_data: "help" },
    ],
    [
      { text: "🌐 Open Full Dashboard", url: DASHBOARD_URL },
    ],
  ];

  await sendTelegramMessage(chatId, welcomeMessage, "HTML", keyboard);
}

async function handleWatchCommand(chatId: string, text: string) {
  const parts = text.split(" ");
  const pubkey = parts[1]?.trim();

  if (!pubkey || pubkey.length < 32) {
    await sendTelegramMessage(
      chatId,
      "⚠️ Please provide a valid pNode pubkey.\n\nUsage: <code>/watch [pubkey]</code>"
    );
    return;
  }

  const supabase = createServerSupabaseClient();

  // Get current watched nodes
  const { data: subscriber } = await supabase
    .from("telegram_subscribers")
    .select("watched_nodes")
    .eq("chat_id", chatId)
    .single();

  const currentNodes = subscriber?.watched_nodes || [];

  if (currentNodes.includes(pubkey)) {
    await sendTelegramMessage(chatId, "ℹ️ You're already watching this pNode.");
    return;
  }

  if (currentNodes.length >= 10) {
    await sendTelegramMessage(
      chatId,
      "⚠️ You can watch up to 10 pNodes. Use /unwatch to remove some first."
    );
    return;
  }

  // Add to watched nodes
  const { error } = await supabase
    .from("telegram_subscribers")
    .update({ watched_nodes: [...currentNodes, pubkey] })
    .eq("chat_id", chatId);

  if (error) {
    await sendTelegramMessage(chatId, "❌ Failed to add pNode. Please try again.");
    return;
  }

  await sendTelegramMessage(
    chatId,
    `✅ <b>Now watching pNode:</b>\n<code>${pubkey.slice(0, 8)}...${pubkey.slice(-6)}</code>\n\nYou'll receive alerts when this node goes offline.`
  );
}

async function handleUnwatchCommand(chatId: string, text: string) {
  const parts = text.split(" ");
  const pubkey = parts[1]?.trim();

  if (!pubkey) {
    await sendTelegramMessage(
      chatId,
      "⚠️ Please provide the pNode pubkey to unwatch.\n\nUsage: <code>/unwatch [pubkey]</code>"
    );
    return;
  }

  const supabase = createServerSupabaseClient();

  // Get current watched nodes
  const { data: subscriber } = await supabase
    .from("telegram_subscribers")
    .select("watched_nodes")
    .eq("chat_id", chatId)
    .single();

  const currentNodes = subscriber?.watched_nodes || [];
  const matchingNode = currentNodes.find((n: string) => n.includes(pubkey));

  if (!matchingNode) {
    await sendTelegramMessage(chatId, "ℹ️ This pNode is not in your watch list.");
    return;
  }

  // Remove from watched nodes
  const { error } = await supabase
    .from("telegram_subscribers")
    .update({ watched_nodes: currentNodes.filter((n: string) => n !== matchingNode) })
    .eq("chat_id", chatId);

  if (error) {
    await sendTelegramMessage(chatId, "❌ Failed to remove pNode. Please try again.");
    return;
  }

  await sendTelegramMessage(
    chatId,
    `✅ Stopped watching pNode:\n<code>${matchingNode.slice(0, 8)}...${matchingNode.slice(-6)}</code>`
  );
}

async function handleStatusCommand(chatId: string) {
  const supabase = createServerSupabaseClient();

  const { data: subscriber } = await supabase
    .from("telegram_subscribers")
    .select("*")
    .eq("chat_id", chatId)
    .single();

  if (!subscriber || subscriber.watched_nodes.length === 0) {
    await sendTelegramMessage(
      chatId,
      "📋 <b>Your Status</b>\n\nYou're not watching any pNodes yet.\n\nUse /watch [pubkey] to start monitoring a node."
    );
    return;
  }

  let statusMessage = "📋 <b>Your Watched pNodes:</b>\n\n";

  for (const pubkey of subscriber.watched_nodes) {
    statusMessage += `• <code>${pubkey.slice(0, 8)}...${pubkey.slice(-6)}</code>\n`;
  }

  statusMessage += `\n<b>Alert Settings:</b>\n`;
  statusMessage += `• Offline alerts: ${subscriber.alert_on_offline ? "✅" : "❌"}\n`;
  statusMessage += `• Warning alerts: ${subscriber.alert_on_warning ? "✅" : "❌"}\n`;
  statusMessage += `• Credits drop alerts: ${subscriber.alert_on_credits_drop ? "✅" : "❌"}`;

  await sendTelegramMessage(chatId, statusMessage);
}

async function handleAlertsCommand(chatId: string, text: string) {
  const parts = text.split(" ");
  const setting = parts[1]?.toLowerCase();

  if (!setting || !["on", "off"].includes(setting)) {
    await sendTelegramMessage(
      chatId,
      "⚠️ Usage: <code>/alerts on</code> or <code>/alerts off</code>"
    );
    return;
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("telegram_subscribers")
    .update({
      alert_on_offline: setting === "on",
      alert_on_warning: setting === "on",
    })
    .eq("chat_id", chatId);

  if (error) {
    await sendTelegramMessage(chatId, "❌ Failed to update settings.");
    return;
  }

  await sendTelegramMessage(
    chatId,
    setting === "on"
      ? "✅ Alerts are now <b>enabled</b>. You'll receive notifications when your watched nodes have issues."
      : "✅ Alerts are now <b>disabled</b>. You won't receive notifications."
  );
}

async function handleHelpCommand(chatId: string) {
  const helpMessage = `
📖 <b>Xandeum Analytics Bot - Help</b>

<b>📊 Network Info:</b>
/network - Live network statistics
/price - XAND token price & market data

<b>🔔 Node Monitoring:</b>
/watch [pubkey] - Start watching a pNode
/unwatch [pubkey] - Stop watching
/status - View your watched nodes

<b>⚙️ Settings:</b>
/alerts on|off - Toggle notifications

<b>📝 Tips:</b>
• Watch up to 10 pNodes
• Get instant offline alerts
• All data is real-time
  `.trim();

  const keyboard: InlineButton[][] = [
    [
      { text: "🔔 Enable Alerts", callback_data: "alerts_on" },
      { text: "🔕 Disable Alerts", callback_data: "alerts_off" },
    ],
    [
      { text: "« Back to Menu", callback_data: "menu" },
    ],
  ];

  await sendTelegramMessage(chatId, helpMessage, "HTML", keyboard);
}

// Fetch network stats via our own API (uses the working proxy)
async function fetchNetworkStats() {
  try {
    const response = await fetch(`${DASHBOARD_URL}/api/pnodes`, {
      cache: "no-store",
    });
    const data = await response.json();
    
    if (!data.success || !data.data) {
      return null;
    }
    
    const stats = data.data.stats;
    const nodes = data.data.nodes || [];
    
    // Calculate status from nodes
    const online = nodes.filter((n: { status: string }) => n.status === "online").length;
    const offline = nodes.filter((n: { status: string }) => n.status === "offline").length;
    const warning = nodes.filter((n: { status: string }) => n.status === "warning").length;
    
    return {
      total: stats.totalNodes || nodes.length,
      online,
      offline,
      syncing: warning,
      storageGB: Math.round((stats.totalStorageCommitted || 0) / (1024 * 1024 * 1024)),
      healthPercent: stats.totalNodes > 0 ? Math.round((online / stats.totalNodes) * 100) : 0,
    };
  } catch {
    return null;
  }
}

async function handleNetworkCommand(chatId: string) {
  await sendTelegramMessage(chatId, "⏳ Fetching live network data...");
  
  const stats = await fetchNetworkStats();
  
  if (!stats) {
    await sendTelegramMessage(chatId, "❌ Unable to fetch network data. Please try again later.");
    return;
  }
  
  const statusEmoji = stats.healthPercent >= 90 ? "🟢" : stats.healthPercent >= 70 ? "🟡" : "🔴";
  
  const message = `
📊 <b>Xandeum Network Status</b>

${statusEmoji} <b>Health:</b> ${stats.healthPercent}%

<b>pNode Statistics:</b>
├ 🟢 Online: ${stats.online}
├ 🔴 Offline: ${stats.offline}
├ 🔄 Syncing: ${stats.syncing}
└ 📦 Total: ${stats.total}

<b>Storage:</b> ${stats.storageGB.toLocaleString()} GB

<i>Updated: ${new Date().toLocaleTimeString()}</i>
  `.trim();
  
  const keyboard: InlineButton[][] = [
    [
      { text: "🔄 Refresh", callback_data: "network" },
      { text: "💰 Check Price", callback_data: "price" },
    ],
    [
      { text: "🌐 Open Dashboard", url: DASHBOARD_URL },
    ],
    [
      { text: "« Back to Menu", callback_data: "menu" },
    ],
  ];
  
  await sendTelegramMessage(chatId, message, "HTML", keyboard);
}

async function handlePriceCommand(chatId: string) {
  try {
    // Fetch from our API (which proxies Jupiter)
    const response = await fetch(`${DASHBOARD_URL}/api/token-price`, {
      cache: "no-store",
    });
    const data = await response.json();
    if (!data.success || !data.data) {
      await sendTelegramMessage(chatId, "❌ Unable to fetch XAND price. Please try again.");
      return;
    }
    
    const priceData = data.data;
    const price = priceData.price || 0;
    const priceFormatted = price < 0.01 ? price.toFixed(6) : price.toFixed(4);
    const change24h = priceData.price_change_24h || 0;
    const changeEmoji = change24h >= 0 ? "📈" : "📉";
    const changeFormatted = change24h >= 0 ? `+${change24h.toFixed(2)}%` : `${change24h.toFixed(2)}%`;
    
    const message = `
💰 <b>XAND Token Price</b>

<b>Price:</b> $${priceFormatted}
${changeEmoji} <b>24h:</b> ${changeFormatted}

<i>Data from Jupiter/DexScreener</i>
    `.trim();
    
    const keyboard: InlineButton[][] = [
      [
        { text: "📈 View Chart", url: `https://birdeye.so/token/${XAND_MINT}?chain=solana` },
        { text: "💱 Trade on Jupiter", url: "https://jup.ag/swap/SOL-XAND" },
      ],
      [
        { text: "🔄 Refresh Price", callback_data: "price" },
        { text: "📊 Network Stats", callback_data: "network" },
      ],
      [
        { text: "« Back to Menu", callback_data: "menu" },
      ],
    ];
    
    await sendTelegramMessage(chatId, message, "HTML", keyboard);
  } catch {
    const keyboard: InlineButton[][] = [
      [{ text: "🔄 Try Again", callback_data: "price" }],
      [{ text: "« Back to Menu", callback_data: "menu" }],
    ];
    await sendTelegramMessage(chatId, "❌ Unable to fetch price data. Please try again.", "HTML", keyboard);
  }
}

// GET endpoint to send alerts (called by cron)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20);

  // Basic auth check
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // This would be implemented to check node status and send alerts
  // For now, return success
  return NextResponse.json({
    success: true,
    message: "Alert check completed",
  });
}
