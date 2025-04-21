package com.example.taskservice.service;

import com.example.taskservice.dto.CreateTaskRequest;
import com.example.taskservice.exception.TaskNotFoundException;
import com.example.taskservice.model.Task;
import com.example.taskservice.model.TaskStatus;
import com.example.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;

    @Transactional
    public Task createTask(CreateTaskRequest request, Long userId) {
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .createdAt(LocalDate.now())
                .deadline(request.getDeadline())
                .status(TaskStatus.IN_PROGRESS)
                .createdBy(userId)
                .build();
        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Task> findByCreatedBy(Long userId) {
        return taskRepository.findAllByCreatedBy(userId);
    }

    @Transactional
    public Task updateStatus(Long taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));
        task.setStatus(status);
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteById(Long id) {
        taskRepository.deleteById(id);
    }

    @Transactional
    public Task completeTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));

        if (!task.getCreatedBy().equals(userId)) {
            throw new SecurityException("You can only complete your own tasks");
        }

        task.setStatus(TaskStatus.COMPLETED);
        return taskRepository.save(task);
    }
}