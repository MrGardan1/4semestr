import socket

PASSES = {
    "1234": {"owner": "Бекренев И.А.", "position": "Директор", "status": "активен", "zone": "Все зоны"},
    "4321": {"owner": "Антонов А.А.", "position": "Пилот", "status": "активен", "zone": "Терминал А"},
    "4972": {"owner": "Цареградцев А.П.", "position": "Служба досмотра", "status": "активен", "zone": "Зона досмотра"}
}

def process_command(text):
    original = text.strip()
    parts = original.split()
    if not parts:
        return ""
    
    cmd = parts[0]

    if cmd == "help":
        return ("  Система управления пропусками\n"
                "Доступные команды:\n"
                " help                        - вывод списка команд\n"
                " passes                      - список всех пропусков\n"
                " pass <ID>                   - подробности по пропуску\n"
                " add <ID> <Zone> <ФИО> <Должность>  - добавить новый пропуск (ФИО и зону писать через _ )\n"
                " del <ID>                    - удалить пропуск\n"
                " check <ID>                  - проверить пропуск на КПП\n"
                " bye                         - выход")
    
    elif cmd == "passes":
        if not PASSES: return "База данных пуста"
        res = f"Список пропусков:\nКоличество: {len(PASSES)}\n"
        for k, v in PASSES.items():
            res += f"ID {k}: {v['owner']} ({v['position']})\n"
        return res.strip()

    elif cmd == "pass" and len(parts) > 1:
        pid = parts[1]
        if pid in PASSES:
            v = PASSES[pid]
            return f"Пропуск {pid}: {v['owner']}, {v['position']}, Статус: {v['status']}, Зона: {v['zone']}"
        return f"Пропуск {pid} не найден"

    elif cmd == "add" and len(parts) >= 5:
        pid = parts[1]
        zone = parts[2].replace("_", " ")
        owner = parts[3].replace("_", " ")
        position = " ".join(parts[4:])

        PASSES[pid] = {"owner": owner, "position": position, "status": "активен", "zone": zone}
        return f"Пропуск {pid} добавлен. Разрешенная зона: {zone}"

    elif cmd == "del" and len(parts) > 1:
        pid = parts[1]
        if pid in PASSES:
            PASSES.pop(pid)
            return f"Пропуск {pid} удален"
        return f"Пропуск {pid} не найден"

    elif cmd == "check" and len(parts) > 1:
        pid = parts[1]
        if pid in PASSES:
            return f"Доступ разрешен. Владелец: {PASSES[pid]['owner']}, Зона: {PASSES[pid]['zone']}"
        return f"Доступ отказан. Пропуск {pid} не найден в системе"

    else:
        return original

def server():
    HOST = '172.17.20.59'
    PORT = 4000 
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen(1)
        print(f"Сервер запущен на {HOST}:{PORT}")

        while True:
            conn, addr = s.accept()
            print(f"Подключение от {addr}")
            with conn:
                while True:
                    data = conn.recv(2048)
                    if not data:
                        break
                    
                    req = data.decode('utf-8').strip()
                    if not req:
                        continue
                    if req == 'bye':
                        break
                    
                    resp = process_command(req)
                    conn.sendall(f"{resp}\n".encode('utf-8'))

if __name__ == '__main__':
    server()
    