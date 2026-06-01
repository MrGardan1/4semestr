import React, {useState, useContext, useEffect, useRef} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import { PassContext } from '../context/PassContext';

const Edit = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {currentPass, setCurrentPass} = useContext(PassContext);

    const [error, setError] = useState('');

    const ownerRef = useRef(null);
    const positionRef = useRef(null);
    const birthDateRef = useRef(null);
    const passTypeRef = useRef(null);
    const accessZoneRef = useRef(null);
    const issueDateRef = useRef(null);
    const validUntilRef = useRef(null);
    const statusRef = useRef(null);

    useEffect(() => {
        axios.get(`http://localhost:5754/passes/${id}`)
            .then(response => {setCurrentPass(response.data); setError('');})
            .catch(error => {
                setError("Ошибка загрузки данных формы. Проверьте соединение.");
            });
    }, [id, setCurrentPass]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const ownerValue = ownerRef.current.value.trim();
        const accessZoneValue = accessZoneRef.current.value.trim();

        if (ownerValue.length < 3) {
            setError("Ошибка: ФИО должно содержать минимум 3 буквы");
            return;
        }

        setError('');

        const updateData = {
            owner: ownerValue,
            position: positionRef.current.value.trim(),
            birthDate: birthDateRef.current.value,
            passType: passTypeRef.current.value,
            accessZone: accessZoneValue,
            issueDate: issueDateRef.current.value,
            validUntil: validUntilRef.current.value,
            status: statusRef.current.value
        };

        axios.put(`http://localhost:5754/passes/${id}`, JSON.stringify(updateData), {
            headers: {"Content-Type": "application/json"}
        })
        .then(() => {
            alert("Данные успешно сохранены");
            navigate(`/detail/${id}`);
        })
        .catch(error =>  {
            setError("Ошибка сохранения на сервере.");
        });
    };

    if (!currentPass && error) {
        return (
            <div style={{padding:'20px'}}>
                <div className="error-box">{error}</div>
                <Link to="/">Вернуться к списку пропусков</Link>
            </div>
        );
    }

    if (!currentPass) return <div>Загрузка формы редактирования...</div>;

    return (
        <div className="container">
            <h1>Редактирование пропуска N{id}</h1>
            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit} className="form-group">
                <label>ФИО Владельца: </label>
                <input type="text" ref={ownerRef} defaultValue={currentPass.owner} required />

                <label>Должность:</label>
                <input type="text" ref={positionRef} defaultValue={currentPass.position} required />

                <label>Дата рождения:</label>
                <input type="date" ref={birthDateRef} defaultValue={currentPass.birthDate} required style={{padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px'}} />

                <label>Тип пропуска:</label>
                <select ref={passTypeRef} defaultValue={currentPass.passType} required>
                    <option value="Постоянный">Постоянный</option>
                    <option value="Временный">Временный</option>
                    <option value="Разовый">Разовый</option>
                </select>

                <label>Зона доступа: </label>
                <input type="text" ref={accessZoneRef} defaultValue={currentPass.accessZone} required />

                <label>Дата выдачи:</label>
                <input type="date" ref={issueDateRef} defaultValue={currentPass.issueDate} required style={{padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px'}} />

                <label>Действителен до:</label>
                <input type="date" ref={validUntilRef} defaultValue={currentPass.validUntil} required style={{padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px'}} />

                <label>Статус:</label>
                <select ref={statusRef} defaultValue={currentPass.status} required>
                    <option value="Активен">Активен</option>
                    <option value="Аннулирован">Аннулирован</option>
                </select>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px'}}>
                    Сохранить изменения
                </button>
            </form>
            <br/>
            <Link to={`/detail/${id}`} className="btn btn-secondary" style={{textDecoration: 'none', display: 'inline-block'}}>
                Отмена
            </Link>
        </div>
    );
};

export default Edit;