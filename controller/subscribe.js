const examination = async (bot, chatId) => {
    const channelId = '@sh3ydii'; 
    let isSubscribed = false;

    try {
        const chatMember = await bot.getChatMember(channelId, chatId);

        if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
            isSubscribed = true; 
        }
    } catch (error) {
        console.error('Ошибка при проверке подписки:', error);
        if (error.response && error.response.error_code === 400) {
            isSubscribed = false;
        } else {
            bot.sendMessage(chatId, 'Произошла ошибка при проверке вашей подписки. Пожалуйста, попробуйте позже.');
            return null; 
        }
    }

    return isSubscribed; 
};

export {examination}
