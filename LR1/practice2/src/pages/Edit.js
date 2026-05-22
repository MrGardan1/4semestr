import React, {useState, useEffect, useRef} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

const Edit = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [pass, setPass] = useState(null);

    const ownerRef = useRef(null);
    const accessZoneRef = useRef(null);
    const statusRef = useRef(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/passes/${id}`)
            .then(response => setPass(response.data))
            .catch(error => console.error("Ошибка загрузки формы:", error));
    }, [id]);

    const handleSubmit =(e) => {
        e.preventDefault();

        const updateData = {
            owner: ownerRef.current.value,
            accessZone: accessZoneRef.current.value,
            status:statusRef.current.value
        };

        axios.put(`http://localhost:5000/passes/${id}`, JSON.stringify(updateData), {
            headers: {"Content-Type": "application/json"}
        })
        .then(() => {
            alert("Данные успешно сохранены");
            navigate(`/detail/${id}`);
        })
        .catch(error => console.error("Ошибка обновления: ", error));
    };

    if (!pass) {
        return <div>Загрузка формы редактирования...</div>
    }

    return (
        <div>
            <h1>Редактирование пропуска N{id}</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px'}}>
                <label>ФИО Владельца: </label>
                <input type="text" ref={ownerRef} defaultValue={pass.owner} required />

                <label>Зона доступа: </label>
                <input type="text" ref={accessZoneRef} defaultValue={pass.accessZone} required />

                <label>Статус:</label>
                <select ref={statusRef} defaultValue={pass.status} requiered>
                    <option value="Активен">Активен</option>
                    <option value="Аннулирован">Аннулирован</option>
                </select>

                <button type="submit" style={{ marginTop: '10px', padding: '6px', cursor: 'pointer'}}>
                    Сохранить
                </button>
            </form>
            <br/>
            <Link to={`/detail/${id}`}>Отмена</Link>
        </div>
    );
};

export default Edit;