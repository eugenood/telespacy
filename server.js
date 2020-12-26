const Telegraf = require("telegraf");
const Telegram = require("telegraf/telegram");

const DataStore = require("./datastore");

const bot = new Telegraf(process.env.BOT_TOKEN);
const telegram = new Telegram(process.env.BOT_TOKEN);
const db = new DataStore("db.json");

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username;
});

bot.start(async ctx => {
  ctx.reply("To convert this group to a space, add me as an admin and run /create <spacename>.");
});

bot.command("create", async ctx => {

  if (!ctx.chat.type.includes("group")) {
    return ctx.reply("This chat is not a group.");
  }
  
  if (db.groupExist(ctx.chat.id)) {
    return ctx.reply("This chat is already part of some space.");
  }

  const spacename = ctx.message.text.split(" ")[1];

  if (spacename === undefined) {
    return ctx.reply("You missed out on giving your space a name. The command to create a space is /create <spacename>.");
  }

  if (db.spaceExist(spacename)) {
    return ctx.reply(`The name ${spacename} is already taken. Try something else.`);
  }

  ctx.exportChatInviteLink().then(async inviteLink => {

    const chat = await ctx.getChat(ctx.chat.id);
    db.createSpace(spacename, ctx.from.id, chat.id, chat.title, chat.invite_link);
    return ctx.reply(`Nice! This group is now the base for ${spacename}.`);

  }).catch(err => {

    console.log(err);
    return ctx.reply("I need admin rights to create space.");

  });

});

bot.command("add", async ctx => {
  
  if (!ctx.chat.type.includes("group")) {
    return ctx.reply("This chat is not a group.");
  }

  if (db.groupExist(ctx.chat.id)) {
    return ctx.reply("This chat is already part of some space.");
  }

  const spacename = ctx.message.text.split(" ")[1];

  if (spacename === undefined) {
    return ctx.reply("You need to tell me which space you want this group to be added to. The command to add a group to a space is /add <spacename>.");
  }

  if (!db.spaceExist(spacename)) {
    return ctx.reply(`${spacename} does not exist.`);
  }

  if (!db.isModerator(spacename, ctx.from.id)) {
    return ctx.reply(`Only a moderator of ${spacename} can add groups.`);
  }

  if (db.groupExist(spacename, ctx.chat.id)) {
    return ctx.reply("This chat is already part of some space.");
  }

  ctx.exportChatInviteLink().then(async inviteLink => {

    const chat = await ctx.getChat(ctx.chat.id);
    db.addGroup(spacename, chat.id, chat.title, chat.invite_link);
    return ctx.reply("Group added to space.");

  }).catch(err => {

    console.log(err);
    return ctx.reply("Error. Please add me as an admin and try again.");

  });

});

bot.command("list", ctx => {

  if (!db.groupExist(ctx.chat.id)) {
    return ctx.reply("This chat is not part of any space.");
  }

  const spacename = db.getGroup(ctx.chat.id).spacename;
  const space = db.getSpace(spacename);
  let message = `These are the groups in ${spacename}:\n\n`;
  message += `${space.base.title}\n${space.base.link}\n\n`
  space.groups.forEach(group => { message += `${group.title}\n${group.link}\n\n` });
  return ctx.reply(message);
  
});

bot.command("broadcast", ctx => {

  if (!db.groupExist(ctx.chat.id)) {
    return ctx.reply("This chat is not part of any space.");
  }

  const arguments = ctx.message.text.split(" ");
  const message = ctx.message.text.substring(arguments[0].length + 1);
  const spacename = db.getGroup(ctx.chat.id).spacename;
  const space = db.getSpace(spacename);
  
  if (space.base.id !== ctx.chat.id) {
    return ctx.reply("You can only broadcast from the base of a space.");
  }

  const groups = space.groups;
  groups.forEach(group => { telegram.sendMessage(group.id, message) });
  return ctx.reply("Message broadcasted.");
  
});

bot.command("moderator", ctx => {

  if (!db.groupExist(ctx.chat.id)) {
    return ctx.reply("This chat is not part of any space.");
  }

  const userId = parseInt(ctx.message.text.split(" ")[1]);

  if (isNaN(userId)) {
    ctx.reply("If you are looking to be a moderator, please ask any moderators to add the following user ID.");
    return ctx.reply(ctx.from.id);
  }

  const spacename = db.getGroup(ctx.chat.id).spacename;
  db.addModerator(spacename, userId);
  return ctx.reply(`${userId} is now a moderator of ${spacename}`);

});

bot.startPolling();
