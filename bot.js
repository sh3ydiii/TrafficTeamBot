import Bot from 'node-telegram-bot-api'
import fs from 'fs'
import dotenv from 'dotenv'


dotenv.config()

const bot = new Bot(process.env.BOT_TOKEN, { polling: true })

import { examination } from './controller/subscribe.js'
import { userLoad, userSave } from './controller/user.js'
import { menu, profile, referals, stats, information, system } from './controller/menu.js'
import {adminMenu, generateStatsAll, generateStatsUser, sendStatsToAdmin} from './controller/admin.js'

const adminChat = '-1002446202758';
const adminChatIds = ['8098508247','7799783748'];  // Замените на свой adminChatId
let userState = {};  // Сохраняем состояние пользователя (для админов)
const userResponses = {}

async function sendMessageToAllUsers(message) {
    const users = userLoad();
    for (const userId in users) {
        try {
            await bot.sendMessage(userId, message);
        } catch (error) {
            console.error(`Не удалось отправить сообщение пользователю ${userId}:`, error.message);
        }
    }
}
bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const referrerId = match[1].trim();

    const users = userLoad(bot);
    delete userState[chatId]

    if (adminChatIds.includes(chatId.toString())) {
        adminMenu(bot, chatId)
    } else if (users[chatId] && users[chatId].status != 'blocked') {
        menu(bot, chatId);
    } else if (!users[chatId]) {
        if (referrerId && users[referrerId]) {
            if (!users[referrerId].refs.includes(chatId)) {
                users[referrerId].refs.push(chatId);
                users[referrerId].balance += 0.6;
                users[referrerId].balanceAll += 0.6
                userSave(users);
            }
        }

        const sponsors = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔔 1 СПОНСОР', url: 'https://t.me/sh3ydii' },
                        { text: '🔔 2 СПОНСОР', url: 'https://t.me/sh3ydii' }
                    ],
                    [{ text: 'Заполнить анкету', callback_data: `ankets_${chatId}` }]
                ]
            }
        };

        bot.sendPhoto(chatId, './image/main.jpg', {
            caption: 'Для начала работы подпишитесь на спонсоров!',
            ...sponsors
        });

    } else if (users[chatId].status === 'blocked') {
        bot.sendMessage(chatId, 'Вы были заблокированы!')
    }
});

async function askQuestion(chatId, questionIndex) {
    const answer = [
        '1. Сколько вам лет?',
        '2. Знакомы с арбитражем трафика?',
        '3. Сколько в среднем заливаете в день?'
    ];

    if (questionIndex < answer.length) {
        bot.sendMessage(chatId, answer[questionIndex]);
        userState[chatId] = { step: 'answer', questionIndex }; // Сохраняем индекс текущего вопроса
    } else {
        const adminMsg = `
        <b>Новая анкета! <code>${chatId}</code></b>

1. Сколько вам лет: ${userResponses[chatId][0]}
2. Знакомы с арбитражем трафика: ${userResponses[chatId][1]}
3. Сколько в среднем заливаете в день: ${userResponses[chatId][2]}


        `
        bot.sendMessage(chatId, 'Спасибо за заполнение анкеты!Ожидайте одобрения');
        bot.sendMessage(adminChat, adminMsg, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Принять', callback_data: `accept_${chatId}`}]
                ]
            },
            parse_mode: 'HTML'
        })
        delete userResponses[chatId]; // Удаляем после обработки
        delete userState[chatId]; // Сбрасываем состояние
    }
}

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const callbackData = query.data;
    const [action, id] = callbackData.split('_');

    const users = userLoad(bot, chatId)

    if (action === 'ankets') {
        const isSubscribed = await examination(bot, chatId);

        if (isSubscribed) {
        userResponses[chatId] = []; // Инициализируем массив для ответов
        await askQuestion(chatId, 0); // Начинаем с первого вопроса
        } else {
            bot.sendMessage(id, 'Пожалуйста, подпишитесь на канал, чтобы отправить заявку.');
        }
    }
    
    if (action === 'accept') {
        bot.deleteMessage(chatId, query.message.message_id);

        if (!users[id]) {
            users[id] = {
                balance: 0,
                balanceAll: 0,
                link: `https://t.me/dfdffdfsse233Bot?start=${id}`,
                refs: [],
                status: {}
            }
            userSave(users);
        }
        // bot.sendMessage(id, 'Ваша заявка принята! Пропишите /start для начала работы)\n\nДобро пожаловать в WINZER TEAM :)')
        menu(bot, id)
        return;
    }

    if (action === 'link') {
        const users = userLoad(bot, chatId)
        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, `<b>Ваша ссылка:</b>\n${users[id].link}`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Меню', callback_data: 'back_to_menu' }]
                ]
            }
        })
    }

})

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id
    const data = query.data

    if (data === 'back_to_menu') {
        bot.deleteMessage(chatId, query.message.message_id);
        menu(bot, chatId)
    }

    if (data === 'profile') {
        bot.deleteMessage(chatId, query.message.message_id)
        profile(bot, chatId)
    }

    if (data === 'referals') {
        bot.deleteMessage(chatId, query.message.message_id)
        referals(bot, chatId)
    }

    if (data === 'stats') {
        bot.deleteMessage(chatId, query.message.message_id)
        stats(bot, chatId)
    }

    if (data === 'information') {
        bot.deleteMessage(chatId, query.message.message_id)
        information(bot, chatId)
    }

    if (data === 'system') {
        bot.deleteMessage(chatId, query.message.message_id)
        system(bot, chatId)
    }

    if (adminChatIds.includes(chatId.toString())) {
        if (data === 'user_balance') {
            bot.deleteMessage(chatId, query.message.message_id);
            bot.sendMessage(chatId, 'Введите Id работника и новый баланс через пробел (например: 12345 100):');
            userState[chatId] = { step: 'getNewBalance' };  // Сохраняем состояние для админа
        }

        if (data === 'delete_user') {
            bot.deleteMessage(chatId, query.message.message_id);
            bot.sendMessage(chatId, 'Введите ID пользователя для удаления:');
            userState[chatId] = { step: 'deleteUser' };
        }

        if (data === 'unblocked_user') {
            bot.deleteMessage(chatId, query.message.message_id)
            bot.sendMessage(chatId, 'Введите ID пользователя для разблокировки:')
            userState[chatId] = { step: 'unblockedUser'}
        }

        if (data === 'messageAllUsers') {
            bot.deleteMessage(chatId, query.message.message_id)
            bot.sendMessage(chatId, 'Введите сообщение:')
            userState[chatId] = { step: 'messageAllUsers'}
        }

        if (data === 'statsAll') {
            const users = userLoad()
            const statsAll = generateStatsAll(users);
            const fileName = './stats_all.txt';
            sendStatsToAdmin(bot, chatId, statsAll, fileName);
        } 
        
        if (data === 'statsUser') { 
            bot.sendMessage(chatId, 'Введите id пользователя статистику,которого хотите посмотреть:');
            userState[chatId] = {step: 'IdStats'}
        }
    }
})

bot.on('callback_query', async (query) => {
    const { id, data, message } = query;  

    if (data === 'finance') {
        await bot.answerCallbackQuery(id, {
            text: 'Выплата осуществляется \nсуббота - вск\nС 15:00 - 18:00 мск\n\nПо поводу выплате: @Traffer096',  
            show_alert: true  
        });
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (userState[chatId] && userState[chatId].step === 'answer') {
        const questionIndex = userState[chatId].questionIndex; // Получаем индекс текущего вопроса
        userResponses[chatId][questionIndex] = msg.text.trim(); // Сохраняем ответ
        await askQuestion(chatId, questionIndex + 1); // Переходим к следующему вопросу
    }
    if (userState[chatId] && userState[chatId].step === 'IdStats') {
        const idStats = msg.text.trim()
        const users = userLoad()
        const statsUser  = generateStatsUser(idStats, users);
        const fileName = `./src/stats_${idStats}.txt`;
        sendStatsToAdmin(bot, chatId, statsUser , fileName);

        delete userState[chatId]
    }
    if (userState[chatId] && userState[chatId].step === 'messageAllUsers') {
        const msgUsers = msg.text.trim();
    
        sendMessageToAllUsers(msgUsers)
        bot.sendMessage(chatId, 'Рассылка запущена!')
        delete userState[chatId]
    }

    if (userState[chatId] && userState[chatId].step === 'deleteUser') {
        const userId = msg.text.trim();

        const users = userLoad(bot);
        if (!isNaN(userId) && !users[userId].status ) {
            users[userId].status = 'blocked';
            userSave(users);
            await bot.sendMessage(userId, 'Вы были заблокированы!'); 
            await bot.sendMessage(chatId, 'Пользователь был успешно заблокирован!');
            try {
                await bot.deleteMessage(chatId, userState[chatId].msgId);
            } catch (error) {
                console.error(`Ошибка при удалении сообщения: ${error.message}`);
            }
        } else {
            await bot.sendMessage(chatId, `Пользователь с ID ${userId} уже заблокирован или такого пользователя не существует!`);
        }
    
        delete userState[chatId]; 
    }

    // Обработка разблокировки
    if (userState[chatId] && userState[chatId].step === 'unblockedUser') {
        const userId = msg.text.trim();

        const users = userLoad(bot);
        if (!isNaN(userId) && users[userId].status === 'blocked') {
            users[userId].status = '';
            userSave(users);
            await bot.sendMessage(userId, 'Вы были разблокированы! Пропишите /start для доступа к меню.');
            await bot.sendMessage(chatId, 'Пользователь был успешно разблокирован!');
        } else {
            await bot.sendMessage(chatId, `Пользователь с ID ${userId} уже разблокирован или не найден!`);
        }

        // Удаляем сообщение с запросом на ввод ID
        try {
            await bot.deleteMessage(chatId, userState[chatId].requestMessageId); // Используем сохраненный ID сообщения
        } catch (deleteError) {
            console.error(`Ошибка при удалении сообщения:`, deleteError.message);
        }

        delete userState[chatId]; 
    }

    // Проверяем, что администратор находится в процессе запроса ID и баланса
    if (userState[chatId] && userState[chatId].step === 'getNewBalance') {
        const input = msg.text.trim();
        const [workerId, newBalanceText] = input.split(' ');  // Разделяем строку по пробелу

        // Проверяем, что обе части введены
        if (!workerId || !newBalanceText) {
            bot.sendMessage(chatId, 'Пожалуйста, введите и ID работника, и новый баланс через пробел. Пример: "12345 100".');
            return;
        }

        const newBalance = parseFloat(newBalanceText); 

        if (isNaN(newBalance)) {
            bot.sendMessage(chatId, 'Баланс должен быть числом. Пожалуйста, введите новый баланс еще раз.');
            return;
        }

        const users = userLoad(bot); 
        if (users[workerId]) {
            users[workerId].balance = newBalance;
            userSave(users)

            bot.sendMessage(chatId, `Баланс для работника с ID ${workerId} обновлен на ${newBalance}`);
        } else {
            bot.sendMessage(chatId, `Работник с ID ${workerId} не найден. Попробуйте снова.`);
        }

        delete userState[chatId];
    }
});

bot.onText(/\/send_message (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const message = match[1];

    if (adminChatIds.includes(chatId.toString())) {
        sendMessageToAllUsers(message)
            .then(() => {
                bot.sendMessage(chatId, 'Сообщение было отправлено всем пользователям.');
            })
            .catch(error => {
                bot.sendMessage(chatId, 'Произошла ошибка при отправке сообщения.');
                console.error('Ошибка при отправке сообщения:', error);
            });
    } else {
        bot.sendMessage(chatId, 'У вас нет прав для рассылки сообщений.');
    }
});