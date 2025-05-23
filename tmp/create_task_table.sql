CREATE TABLE task (
                      id SERIAL PRIMARY KEY,
                      task_title VARCHAR(255) NOT NULL,
                      task_description TEXT,
                      task_due_date DATE NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      completed_at TIMESTAMP,
                      status VARCHAR(50) DEFAULT 'Активна'
);

CREATE INDEX idx_task_due_date ON task(task_due_date);

