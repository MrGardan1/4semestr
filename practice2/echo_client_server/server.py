import socket

passes_db = {
    "7452": "Цареградцев А.П. (Служба досмотра)",
    "8921": "Чивчян Г.Т. (Техник терминала)"
}

def handle_command(request_text):
    parts = request_text.strip().split(" ", 2)
    command = parts[0].upper()

    if command =="ADD":
        if len( parts) < 3:
            return "ОШИБКА! Формат: ADD ID ФИО должность"
        
        pass_id = parts[1]
        info =parts[2]
        passes_db[pass_id] = info
        return f"УСПЕШНО! Пропуск {pass_id} для '{info}' создан."

    elif command == "DEL":
        if len( parts ) < 2:
            return "ОШИБКА! Формат: DEL ID"
        pass_id = parts[1]
        if pass_id in passes_db:
            deleted_info = passes_db.pop(pass_id)
            return f"УСПЕШНО! Пропуск {pass_id} ({deleted_info}) удален."
        else:
            return f"ОШИБКА! Пропуск {pass_id} не найден."

    elif command == "LIST":
        if not passes_db:
            return "База данных пустая."
        result = "Список действующих пропусков\n"
        for pid, pinfo in passes_db.items():
            result += f"   {pid} : {pinfo}\n"
        return result.strip()

    elif command == "CHECK":
        if len(parts) < 2:
            return "ОШИБКА! Формат: CHECK ID"
        pass_id = parts[1]
        if pass_id in passes_db:
            return f"ПРОГРАММА ДОПУСКА! Пропуск {pass_id} Действителен. Владелец: {passes_db[pass_id]}"
        else:
            return f"ОТКАЗ В ДОСТУПЕ! Пропуск {pass_id} не найден в системе."

    else:
        return "ОШИБКА! Неизвестная команда. Доступно: ADD, DEL, LIST, CHECK"

def start_server():
    HOST = '172.17.34.241'
    PORT = 6548

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print(f"Сервер управления пропусками запущен на {HOST}:{PORT}")
        
        while True:
            conn, addr = s.accept()
            with conn:
                print(f"Подключился новый терминал: {addr}")
                while True:
                    data = conn.recv(1024)
                    if not data:
                        break
                    
                    request = data.decode('utf-8').strip()
                    
                    if request.lower() == 'bye':
                        print(f"Терминал {addr} разорвал соединение.")
                        conn.sendall("[СЕРВЕР] Соединение закрыто. До свидания!".encode('utf-8'))
                        break
                    
                    response = handle_command(request)
                    conn.sendall(response.encode('utf-8'))

if __name__ == '__main__':
    start_server()