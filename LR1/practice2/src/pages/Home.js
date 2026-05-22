import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function deletePass(id) {
    axios.delete(`http://localhost:5000/passes/${id}`)
        .then(() => {
            console.log(`Пропуск ${id} удален`);
            data = data.filter(pass => pass.id !== id); //пересоздает массив исключая id
        })
        .catch(error => console.error("Ошибка удаления: ", error));
}

const Home = () => {
    const [passes, SetPasses] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/passes")
            .then(response => SetPasses(response.data))
            .catch(error => console.error("Ошибка получения данных: ", error));
    }, [])

    return (
        <div>
            <h1>Список пропусков</h1>
            <ul>
                {passes.map(pass => (
                    <li key={pass.id} style ={{ marginBottom: "10px"}}>
                        <Link to={`/detail/${pass.id}`}>
                            Пропуск: {pass.owner} ({pass.accessZone})
                        </Link>
                    </li>
                ))}

            </ul>
            <Link to={"/add"}>Выдать новый пропуск</Link>
        </div>
    );
};
export default Home;