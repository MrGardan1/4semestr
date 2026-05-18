import datetime

# Слой доступа к данным
class DataRepository:
    def __init__(self):
        self.users = {
            "1": {"name": "Лосев", "role": "SecurityOfficer"},
            "2": {"name": "Чивчян", "role": "Admin"},
            "3": {"name": "Цареградцев", "role": "Auditor"}
        }

        self.passes = {}
        self.pass_counter = 100
        self.audit_logs = []
    
    def get_user(self, user_id):
        return self.users.get(user_id)

    def create_pass(self, zone):
        self.pass_counter +=1
        pass_id = str(self.pass_counter)
        self.passes[pass_id] = {"zone": zone, "status": "Active"}
        return pass_id
    def get_pass(self, pass_id):
        return self.passes.get(pass_id)
    
    def update_pass_status(self, pass_id, status):
        if pass_id in self.passes:
            self.passes[pass_id]["status"] = status
            return True
        return false

    def insert_audit_log(self, user_id, action, status):
        log_entry = {
            "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "user_id": user_id,
            "action": action,
            "status": status
        }
        self.audit_logs.append(log_entry)
    
    def get_all_logs(self):
        return self.audit_logs
# слой бизнес-логики

class SecurityService:
    def __init__(self, repository):
        self.repo = repository
    def authenticate(self, user_id):
        user = self.repo.get_user(user_id)
        if user:
            self.repo.insert_audit_log(user_id, "Вход в систему", "Успех")
            return user
        self.repo.insert_audit_log(user_id or "Unknown", "Попытка входа", "Отказ: неверный ID")
        return None

    def issue_pass(self, current_user_id, zone):
        user = self.repo.get_user(current_user_id)
        if user and user["role"] == "SecurityOfficer":
            pass_id = self.repo.create_pass(zone)
            self.repo.insert_audit_log(current_user_id, f"Выдача пропуска N{pass_id}", "Успех")
            return f"Пропуск N{pass_id} успешно выдан для зоны: {zone}"
        self.repo.insert_audit_log(current_user_id, "Попытка выдачи пропуска", "Отказ: нет прав доступа")
        return "Ошибка: недостаточно прав для выдачи пропуска"
    
    def view_audit_logs(self, current_user_id):
        user = self.repo.get_user(current_user_id)
        if user and user["role"] == "Auditor":
            self.repo.insert_audit_log(current_user_id, "Выгрузка журнала аудита", "Успешно")
            return self.repo.get_all_logs()
        
        self.repo.insert_audit_log(current_user_id, "Попытка чтения журнала", "Отказ: недостаточно прав доступа")
        return "Ошибка: недостаточно прав доступа для просмотра журнала аудита"

# Слой представления

class ConsoleApp:
    def __init__(self, service):
        self.service = service
        self.current_user_id = None

    def start(self):
        print("Система безопасности аэропорта")
        user_id = input("Введите ID (1-Сотрудник, 2-Админ, 3-Аудитор): ")
        user = self.service.authenticate(user_id)

        if user:
            self.current_user_id = user_id
            print(f"Успешный вход, {user['name']}")
            self.main_menu()
        else:
            print("Пользователь не найден. Доступ закрыт.")
        
    def main_menu(self):
        while True:
            print("Действия: ")
            print("1. Выдать новый пропуск")
            print("2. Просмотреть журнал аудита")
            print("0. Выход")

            choice = input("Выбор: ")

            if choice == "1":
                zone = input("Введите зону доступа: ")
                result = self.service.issue_pass(self.current_user_id, zone)
                print(f"[{result}]")

            elif choice == "2":
                result = self.service.view_audit_logs(self.current_user_id)
                if isinstance(result, list):
                    print("Журнал аудита")
                    for log in  result:
                        print(f"[{log['time']}] User:{log['user_id']} | Действие: {log['action']} | Статус: {log['status']}")                        
                    print("------------------------------")
                else:
                    print(f"[{result}]")

            elif choice == "0":
                print("Выход")
                break
            else:
                print("Неизвестная команда")

if __name__ == "__main__":
    db = DataRepository()
    logic = SecurityService(db)
    app = ConsoleApp(logic)

    app.start()
