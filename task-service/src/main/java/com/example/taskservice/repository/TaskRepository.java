package com.example.taskservice.repository;

import com.example.taskservice.model.Task;
import com.example.taskservice.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByCreatedBy(Long userId);
    List<Task> findAllByStatus(TaskStatus status);
    List<Task> findAllByCreatedByAndStatus(Long userId, TaskStatus status);
}