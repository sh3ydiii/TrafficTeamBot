import fs from 'fs'

const userSave = (users) => {
    const userPath = './db/users.json'; 

    // Записываем обновленный объект пользователей в файл
    fs.writeFileSync(userPath, JSON.stringify(users, null, 2)); // Форматируем JSON для удобства чтения
};

const userLoad = () => {
    const userPath = './db/users.json'

    const user = JSON.parse(fs.readFileSync(userPath))

    return user;
}

export {userLoad, userSave}