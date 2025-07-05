const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = 7832264582;
const paymentNumbers = ['📲 bKash/Nagad: 01965064030', '📲 bKash/Nagad: 01937240300'];

const diamondPackages = [
  { id: 'd1', label: '💎25 = 28TK' },
  { id: 'd2', label: '💎60 = 50TK' },
  { id: 'd3', label: '💎170 = 130TK' },
  { id: 'd4', label: '💎240 = 190TK' },
  { id: 'd5', label: '💎355 = 270TK' },
  { id: 'd6', label: '💎425 = 320TK' },
  { id: 'd7', label: '💎610 = 490TK' },
  { id: 'd8', label: '💎725 = 595TK' },
  { id: 'd9', label: '💎860 = 680TK' },
  { id: 'd10', label: '💎1080 = 900TK' },
  { id: 'd11', label: '💎1240 = 1020TK' },
  { id: 'd12', label: '💎1450 = 1200TK' },
  { id: 'd13', label: '💎1720 = 1270TK' },
  { id: 'd14', label: '💎2000 = 1450TK' },
  { id: 'd15', label: '💎2530 = 1690TK' },
  { id: 'd16', label: '💎3000 = 2000TK' },
  { id: 'd17', label: '💎3760 = 2700TK' },
  { id: 'd18', label: '💎5060 = 3670TK' },
  { id: 'd19', label: '💎10120 = 6900TK' }
];

const orders = {};
const sessions = {};

bot.start((ctx) => {
  ctx.reply(
    `📝 *Welcome to FX TOP UP BOT!*

⚠️ Please read the rules:
1. Use valid UID.
2. Send correct TrxID after payment.
3. Wait for confirmation.

Click "✅ Accept" to continue.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([Markup.button.callback('✅ Accept', 'accept_rules')])
    }
  );
});

bot.action('accept_rules', (ctx) => {
  ctx.editMessageText('💎 Choose a Diamond Package:', {
    ...Markup.inlineKeyboard(diamondPackages.map(pkg => Markup.button.callback(pkg.label, pkg.id)), { columns: 2 })
  });
});

diamondPackages.forEach(pkg => {
  bot.action(pkg.id, (ctx) => {
    const userId = ctx.from.id;
    orders[userId] = { package: pkg.label };
    sessions[userId] = 'awaiting_uid';
    ctx.reply('📥 Please enter your Free Fire UID:');
  });
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const session = sessions[userId];

  if (!orders[userId] || !session) return;

  if (session === 'awaiting_uid') {
    orders[userId].uid = ctx.message.text;
    sessions[userId] = 'awaiting_trxid';
    ctx.reply(`💳 Pay to one of the numbers:
${paymentNumbers.join('
')}

Then send your TrxID:`);
  } else if (session === 'awaiting_trxid') {
    orders[userId].trxid = ctx.message.text;
    orders[userId].status = 'pending';
    sessions[userId] = null;

    ctx.reply('📩 Your order has been submitted. Please wait for admin confirmation.');

    await bot.telegram.sendMessage(
      ADMIN_ID,
      `📬 *New Order*
👤 User: @${ctx.from.username || 'N/A'} (${userId})
💎 Package: ${orders[userId].package}
🆔 UID: ${orders[userId].uid}
💳 TrxID: ${orders[userId].trxid}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('✅ Confirm', `confirm_${userId}`),
          Markup.button.callback('❌ Reject', `reject_${userId}`)
        ])
      }
    );
  }
});

bot.action(/confirm_(\d+)/, async (ctx) => {
  const userId = ctx.match[1];
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCbQuery("You're not authorized.");
  await bot.telegram.sendMessage(userId, '✅ Your order has been *confirmed*!', { parse_mode: 'Markdown' });
  ctx.editMessageText('✅ Order confirmed.');
});

bot.action(/reject_(\d+)/, async (ctx) => {
  const userId = ctx.match[1];
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCbQuery("You're not authorized.");
  await bot.telegram.sendMessage(userId, '❌ Your order was *rejected*. Please try again.', { parse_mode: 'Markdown' });
  ctx.editMessageText('❌ Order rejected.');
});

bot.launch();
console.log('🚀 FX TOP UP BOT is running...');
  
