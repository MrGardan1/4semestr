import React, {useState, useEffect} from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

const Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pass, setPass] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/passes/${id}`)
            .then(response => setPass(response.data))
            .catch(error => console.error("Ошибка загрузки пропуска: ", error));
    }, [id]);

    const handleDelete = () => {
        if (window.confirm("Вы уверены, что хотите удалить данный пропуск?")) {
            axios.delete(`http://localhost:5000/passes/${id}`)
                .then(() => {
                    alert("Пропуск удален");
                    navigate('/');
                })
                .catch(error => console.error("Ошибка удаления:", error));
        }
    };

    if (!pass) {
        return <div>Загрузка информации о пропуске N{id}...</div>;
    }

    return (
        <div>
            <h1>Информация о пропуске {id}</h1>
            <div style={{border: '1px solid #ccc', padding: '15px', width: '400px', backgroundColor: '#f9f9f9'}}>
                <p><strong>ФИО Владельца: </strong>{pass.owner} </p>
                <p><strong>Зона доступа: </strong>{pass.accessZone}</p>
                <p><strong>Статус: </strong>{pass.status}</p>
            </div>

            <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                <Link to={`/edit/${id}`}>
                    <button style={{ padding: '6px 12px', cursor: 'pointer'}}>
                        Редактирование
                    </button>
                </Link>

                <button onClick={handleDelete} style={{ padding: '6px 12px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer'}}>
                    Удалить
                </button>
            </div>

            <br/>
            <Link to="/">Назад к списку</Link>
        </div>
    );

};

export default Detail;