package com.example.taskservice.controller;

import com.example.taskservice.dto.CreateTaskRequest;
import com.example.taskservice.dto.TaskResponse;
import com.example.taskservice.exception.TaskNotFoundException;
import com.example.taskservice.model.Task;
import com.example.taskservice.model.TaskStatus;
import com.example.taskservice.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @RequestHeader("X-User-Id") Long userId) {

        Task task = taskService.createTask(request, userId);
        return ResponseEntity.ok(toResponse(task));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id) {
        Task task = taskService.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));
        return ResponseEntity.ok(toResponse(task));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok().body("{\"status\":\"UP\"}");
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getUserTasks(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(
                taskService.findByCreatedBy(userId).stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList())
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {
        Task task = taskService.updateStatus(id, status);
        return ResponseEntity.ok(toResponse(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .createdAt(task.getCreatedAt())
                .deadline(task.getDeadline())
                .status(task.getStatus())
                .createdBy(task.getCreatedBy())
                .build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> completeTask(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        Task task = taskService.completeTask(id, userId);
        return ResponseEntity.ok(toResponse(task));
    }

}