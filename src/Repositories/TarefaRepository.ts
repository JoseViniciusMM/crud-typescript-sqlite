import { getDatabaseInstance } from './Database';
import { Tarefa, TarefaInput } from '../Models/Tarefa';

export class TarefaRepository {

    async save(tarefa: TarefaInput): Promise<Tarefa> {
        const db = await getDatabaseInstance();
        const result = await db.run(
            `INSERT INTO tarefas (usuario_id, titulo, descricao, status, data_criacao) 
             VALUES (?, ?, ?, ?, datetime('now'))`,
            [tarefa.usuario_id, tarefa.titulo, tarefa.descricao || '', tarefa.status || 'pendente']
        );
        
        return {
            id: result.lastID!,
            ...tarefa,
            status: tarefa.status || 'pendente',
            data_criacao: new Date()
        } as Tarefa;
    }

    async findAllByUsuario(usuario_id: number): Promise<Tarefa[]> {
        const db = await getDatabaseInstance();
        const sql = 'SELECT * FROM tarefas WHERE usuario_id = ?';
        return await db.all<Tarefa[]>(sql, [usuario_id]);
    }

    async updateStatus(id: number, status: string): Promise<boolean> {
        const db = await getDatabaseInstance();
        const sql = 'UPDATE tarefas SET status = ? WHERE id = ?';
        const result = await db.run(sql, [status, id]);
        return (result.changes || 0) > 0;
    }

    async delete(id: number): Promise<boolean> {
        const db = await getDatabaseInstance();
        const sql = 'DELETE FROM tarefas WHERE id = ?';
        const result = await db.run(sql, [id]);
        return (result.changes || 0) > 0;
    }

    async associarCategoria(tarefaId: number, categoriaId: number): Promise<void> {
        const db = await getDatabaseInstance();
        await db.run(
            `INSERT OR IGNORE INTO tarefas_categorias (tarefa_id, categoria_id) VALUES (?, ?)`,
            [tarefaId, categoriaId]
        );
    }
}