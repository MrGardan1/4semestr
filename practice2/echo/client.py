import socket
def client():
    HOST = '217.71.129.139'
    PORT = 5388

    print("Система управления пропусками\n")
    print("Введите 'help' для просмотра команд\n")

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.connect((HOST, PORT))
            while True:
                cmd = input(">> ")
                if not cmd.strip():
                    continue
                s.sendall(cmd.encode('utf-8'))

                if cmd == 'bye':
                    print("Выход")
                    break
                
                data = s.recv(4096)
                print(data.decode('utf-8'))
        except Exception as e:
            print(f"Ошибка подключения: {e}")

if __name__ == '__main__':
    client()