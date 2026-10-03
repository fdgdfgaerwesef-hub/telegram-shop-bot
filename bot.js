const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '8898251164:AAHWYZt38rUvs4uhxG1dgVMQeWJ28d4ZtmE';
const bot = new Telegraf(BOT_TOKEN);
const ADMIN_CHAT_ID = '957629516';

// 📂 ឃ្លាំងเก็บ Link ផលិតផលរបស់អ្នក (មាន Link ច្រើនដាច់ដោយឡែកពីគ្នា)
// ពេលមានคนទិញ Bot នឹងទាញយក Link លើសគេមកផ្ញើ ហើយលុបវាចោលពីក្នុង List នេះភ្លាម
let availableLinks = [
    "https://drive.google.com/drive/folders/1d18GslaJJAklWdo2OX6p503k5fRobJQL?usp=sharing",
    "https://drive.google.com/drive/folders/UNIQUE_LINK_ID_002",
    "https://drive.google.com/drive/folders/UNIQUE_LINK_ID_003",
    "https://drive.google.com/drive/folders/UNIQUE_LINK_ID_004",
    // អ្នកអាចដាក់ Link រាប់រយ ឬរាប់ពាន់នៅទីនេះ
];

bot.start((ctx) => {
    ctx.reply('សួស្តី! សូមស្វាគមន៍មកកាន់ហាងទិញទំនិញឌីជីថល JZ Signals។');
});

// ទទួល Slip ពីអតិថិជន
bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username ? `@${ctx.from.username}` : (ctx.from.first_name || 'អតិថិជន');
    const photoArray = ctx.message.photo;
    const fileId = photoArray[photoArray.length - 1].file_id;

    await ctx.reply('🙏 សូមអរគុណ! ប្រព័ន្ធបានទទួល Slip របស់អ្នកហើយ។ Admin កំពុងពិនិត្យ...');

    // ឆែកមើលថាតើនៅសល់ Link សម្រាប់លក់ដែរឬទេ
    if (availableLinks.length === 0) {
        await ctx.reply('⚠️ សូមអភ័យទោស ពេលនេះផលិតផលអស់ស្ដុកបណ្ដោះអាសន្ន សូមទាក់ទង Admin ជាបន្ទាន់!');
        // ផ្ញើសារប្រាប់ Admin ថាអត់មាន Link សល់
        await bot.telegram.sendMessage(ADMIN_CHAT_ID, `⚠️ អាសន្ន៖ Link ផលិតផលក្នុង Bot បានអស់ហើយ! សូមមេត្តាបញ្ចូល Link បន្ថែម។`);
        return;
    }

    // ส่ง Slip មក Admin พร้อมปุ่มอนุมัติ
    await bot.telegram.sendPhoto(ADMIN_CHAT_ID, fileId, {
        caption: `🔔 **មានការទូទាត់ប្រាក់ថ្មី!**\n👤 អតិថិជន៖ ${username}\n🆔 ID: <code>${userId}</code>\n📦 Link ដែលសល់ក្នុងស្តុក៖ ${availableLinks.length} ទៀត`,
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ អនុម័ត និងផ្ញើ Link ពិសេស', `approve_link_${userId}`)],
            [Markup.button.callback('❌ បដិសេធ', `reject_${userId}`)]
        ])
    });
});

// ពេល Admin ចុចអនុម័ត
bot.action(/^approve_link_(.+)$/, async (ctx) => {
    const userId = ctx.match[1];

    if (availableLinks.length === 0) {
        await ctx.answerCbQuery('⚠️ Link បានអស់ហើយ មិនអាចផ្ញើបានទេ!');
        return;
    }

    // ទាញយក Link ទីមួយចេញពី List (Shift) ដើម្បីយកទៅឱ្យអតិថិជនម្នាក់នេះ
    const assignedLink = availableLinks.shift(); 

    try {
        await bot.telegram.sendMessage(
            userId,
            `✅ ការទូទាត់របស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់ជោគជ័យ!\n\n🎁 ខាងក្រោមនេះជា **Link ផ្ទាល់ខ្លួនដាច់ដោយឡែករបស់អ្នក** (មិនជាន់នឹងអ្នកដទៃឡើយ)៖\n👉 ${assignedLink}`
        );

        await ctx.editMessageCaption(`✅ បានបញ្ជូន Link ពិសេសជូនអតិថិជនជោគជ័យ!\n🔗 Link ដែលបានផ្ញើ៖ ${assignedLink}\n📦 Link សល់ក្នុងស្តុក៖ ${availableLinks.length}`);
    } catch (error) {
        // ប្រសិនបើផ្ញើមិនទាន់រួច យក Link នោះមកដាក់ចូល List វិញ
        availableLinks.unshift(assignedLink);
        await ctx.reply('⚠️ មានបញ្ហា៖ ' + error.message);
    }
});

bot.action(/^reject_(.+)$/, async (ctx) => {
    const userId = ctx.match[1];
    await bot.telegram.sendMessage(userId, `❌ សូមអភ័យទោស ការទូទាត់របស់អ្នកមិនត្រឹមត្រូវទេ។`);
    await ctx.editMessageCaption('❌ បានបដិសេធសំណើនេះ។');
});

bot.launch();
console.log('🤖 Unique Link Shop Bot is running...');