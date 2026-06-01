const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({static: './build'});

server.use(middlewares);
server.use(router);

setInterval(() => {
    const now = new Date();
    const db = router.db;

    const delPasses = db.get('passes')
        .filter(pass => pass.passType === 'Временный' && new Date(pass.validUntil) < now)
        .value();

    if (delPasses.length >0) {
        delPasses.forEach(pass => {
            db.get('passes').remove({id: pass.id}).write();
            console.log(`Удаление просроченного пропуска: ${pass.owner} ID: ${pass.id}`);
        }); 
    }
}, 10000); //каждый 10 сек проверка

const PORT = 5754;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен, порт ${PORT}`);
});