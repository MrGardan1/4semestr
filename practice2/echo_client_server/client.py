import socket

def start_client():
    HOST = '217.71.129.139'
    PORT = 6170

    print("Клиент системы управления пропусками\n")
    print("Команды для ввода:")
    print("- ADD ID Данные - Создать пропуск")
    print("- DEL ID - Удалить пропуск")
    print("- LIST - Посмотреть все пропуска")
    print("- CHECK ID - Проверить пропуск по ID")
    print("- bye - Завершить работу программы")

    with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
        s.connect((HOST, PORT ))
        while True:
            cmd = input("\nВведите команду >> ")
            if not cmd.strip():
                continue
                
            if cmd.lower() == 'bye':
                s.sendall(cmd.encode('utf-8'))
                data = s.recv(1024)
                print(data.decode('utf-8') )
                print("Завершение работы...")
                break
                
            s.sendall(cmd.encode('utf-8'))
            data = s.recv(1024)
            print(data.decode('utf-8'))

if __name__ == '__main__':
    start_client()