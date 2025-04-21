package com.example.taskservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGSERIAL")
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "created_at", nullable = false, columnDefinition = "DATE")
    private LocalDate createdAt;

    @Column(name = "deadline", nullable = false, columnDefinition = "DATE")
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 255)
    private TaskStatus status;

    @Column(name = "created_by", nullable = false, columnDefinition = "BIGINT")
    private Long createdBy;
}