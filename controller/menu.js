import fs from 'fs'
import {userLoad} from '../controller/user.js'


const menu = (bot, chatId) => {

    const menuMsg = `
    🥷  Добро пожаловать в <b>WINZER Team Bot!</b>
    `

    const keyMenu = {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: '💻 Профиль', callback_data: 'profile'},
                    {text: '📊 Статистика', callback_data: 'stats'}
                ],
                [
                    {text: 'ℹ️ Информация', callback_data: 'information'},
                    {text: '⚙️ Наша система', callback_data: 'system'}
                ]
            ]
        }
    }

    bot.sendPhoto(chatId, './image/main.jpg', {
        caption: menuMsg,
        ...keyMenu,
        parse_mode: 'HTML'
    })
}

const referals = (bot,chatId) => {
    const users = userLoad(bot,chatId)

    const refMsg = `
    👥<b> ‒ Рефералка</b>

<b>Ваша ссылка:</b> <code>${users[chatId].link}</code>

<b>Всего приглашено: </b> <code>${users[chatId].refs.length}</code>

<b>Всего заработано с реф ссылки:</b> <code>${users[chatId].balanceAll}$</code>
    `

    const refKey = {
        reply_markup: {
            inline_keyboard: [
                [{text: '⬅️ Назад',callback_data: 'back_to_menu'}]
            ]
        }
    }
    bot.sendPhoto(chatId, './image/main.jpg', {
        caption: refMsg,
        ...refKey,
        parse_mode: 'HTML'
    })
}
const profile = (bot, chatId) => {
    const users = userLoad(bot,chatId)
    
    const profileMessage = `
    🥷 <b>WINZER TEAM</b>

📊 ‒ <b>Профиль:</b> 
 ⊢🆔 <b>Мой Id:</b> ${chatId}
 ⊢💰 <b>Баланс:</b> ${users[chatId].balance}$
 ⊢👥 <b>Рефералы:</b> ${users[chatId].refs.length}
 ⊢🕔 <b>Время в тиме:</b> Скоро...
    `

    const keyProfile = {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: '💰 Выплата', callback_data: `finance`},
                    {text: '👥 Рефералы', callback_data: 'referals'}
                ],
                [{text: '⬅️ Назад', callback_data: 'back_to_menu'}]
                
            ]
        }
    }

    bot.sendPhoto(chatId, './image/main.jpg', {
        caption: profileMessage,
        ...keyProfile,
        parse_mode: 'HTML'
    })
}

const stats = (bot,chatId) => {
    const user = JSON.parse(fs.readFileSync('./db/users.json'))

    const userCount = Object.keys(user).length;
    const totalBalanceAll = Object.values(user)
      .reduce((total, user) => total + user.balanceAll, 0);

    const statsMsg = `
    🥷 <b>WINZER TEAM</b>

📊 ‒ <b>Профиль:</b> 
⊢ Всего пользователей: <code>${userCount}</code>
⊢ Всего выплаченно: <code>${totalBalanceAll}$</code>
`
    const statKey = {
        reply_markup: {
            inline_keyboard: [
                [{text: '⬅️ Назад', callback_data: 'back_to_menu'}]
            ]
        }
    }

    bot.sendPhoto(chatId, './image/main.jpg', {
        caption: statsMsg,
        ...statKey,
        parse_mode: 'HTML'
    })
}

const information = (bot, chatId) => {
    const infoMsg = `
    📌<b>Напоминаю какой трафик не оплачивается:</b>

- Боты, накрут, дети, арабы, новореги, девочки (не ца), анимешники.

<b>От нас:</b>
<i>
1) Большое комьюнити

2) O,6$ за 1 пдп

3) Карьерный рост

4) Обучение новичков

5) Поддержка 24/7
</i>
<b>Бота сделал - @sh3ydiiicoder, насчёт проблем писать ему.</b>
    `
    const infoKey = {
        reply_markup: {
            inline_keyboard: [
                [{text: '⬅️ Назад', callback_data: 'back_to_menu'}]
            ]
        }
    }

    bot.sendPhoto(chatId, './image/main.jpg', {
        caption: infoMsg,
        ...infoKey,
        parse_mode: 'HTML'
    })
}

const system = (bot, chatId) => {
    const sysMsg = `
    ⚙️ <b>Посмотри все разделы нашей тимы!</b>

<b>Здесь вы найдёте всё необходимое для работы с нашей командой:</b>
<blockquote>💬Чат — общение и поддержка 
💵 Выплаты — информация о выплатах 
📋 Мануалы — инструкции и руководства 
📰 Новости— последние обновления
</blockquote>
    `
    const sysKey = {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Чат', url: 'https://t.me/sh3ydii'},
                    {text: 'Выплаты', url: 'https://t.me/sh3ydii'}
                ],
                [
                    {text: 'Мануалы', url: 'https://t.me/sh3ydii'},
                    {text: 'Новости', url: 'https://t.me/sh3ydii'}
                ],
                [{text: 'Назад', callback_data: 'back_to_menu'}]
            ]
        }
    }

    bot.sendPhoto(chatId, './image/main.jpg', {
        caption: sysMsg,
        ...sysKey,
        parse_mode: 'HTML'
    })
}
export {profile, menu, referals, stats, information, system}