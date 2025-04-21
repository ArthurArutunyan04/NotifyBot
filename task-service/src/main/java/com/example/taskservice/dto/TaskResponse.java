package com.example.taskservice.dto;

import com.example.taskservice.model.TaskStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class TaskResponse {
    Long id;
    String title;
    String description;

    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate deadline;

    TaskStatus status;
    Long createdBy;
}