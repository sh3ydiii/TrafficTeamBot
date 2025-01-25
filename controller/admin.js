import fs from 'fs'
import {userLoad} from '../controller/user.js'

const generateStatsAll = (users) => {
    let stats = '📊 <b>Общая статистика работников</b>\n\n';
    for (const userId in users) {
        const user = users[userId];
        stats += `ID: ${userId}\n`;
        stats += `Баланс: ${user.balanceAll}$\n`;
        stats += `Всего приглашено: ${user.refs.length}\n\n`
    }
    return stats;
};

const generateStatsUser  = (userId, users) => {
    const user = users[userId];
    if (!user) return `Пользователь с ID ${userId} не найден.`;
    
    let stats = `ID: ${userId}\n`;
    stats += `Баланс: ${user.balanceAll}$\n`;
    stats += ` Всего приглашено: ${user.refs.length}\n`

    return stats;
};


const sendStatsToAdmin = (bot, chatId, stats, fileName) => {
    fs.writeFileSync(fileName, stats); 
    bot.sendDocument(chatId, fileName).then(() => {
        fs.unlinkSync(fileName); 
    }).catch(error => {
        console.error('Ошибка при отправке документа:', error);
    });
};

const adminMenu = (bot,chatId) => {
    const users = userLoad()

    const userCount = Object.keys(users).length;
    const totalBalanceAll = Object.values(users)
      .reduce((total, user) => total + user.balanceAll, 0);

    const AdminMsg = `
   🥷<b>WINZER | Admin</b>

💻 ‒ <b>Admin Panel</b>
⊢🆔 Admin ID: <code>${chatId}</code>
⊢👥 Всего работников: <code>${userCount}</code>
⊢💰 Всего заработано: <code>${totalBalanceAll}$</code>
    `

    const adminKey = {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Выплата пользователю', callback_data: 'user_balance'},],
                [
                    {text: 'Удалить работника', callback_data: 'delete_user'},
                    {text: 'Разблокировать работника', callback_data: 'unblocked_user'}
                ],
                [
                    {text: 'Статистика общая', callback_data: 'statsAll'},
                    {text: 'Статистика работника',callback_data: 'statsUser'}
                ],
                [{text: 'Рассылка', callback_data: 'messageAllUsers'}]
            ]
        }
    }

    bot.sendPhoto(chatId, './image/main.jpg', {
        caption: AdminMsg,
        ...adminKey,
        parse_mode: 'HTML'
    })
}


export {adminMenu, generateStatsAll, generateStatsUser, sendStatsToAdmin}