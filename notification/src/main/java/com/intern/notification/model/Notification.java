package com.intern.notification.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public  Notification() {}

    public Notification(Integer userId, String message) {
        this.userId = userId;
        this.message = message;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId() { this.id = id; }

    public Integer getUserId() { return  userId; }
    public void setUserId() { this.userId = userId; }

    public  String getMessage() { return  message; }
    public  void setMessage() { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public  void setCreatedAt() { this.createdAt = createdAt; }

}
