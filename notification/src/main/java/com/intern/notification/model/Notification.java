package com.intern.notification.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "receiver_username")
    private String receiverUsername;

    @Column(nullable = false)
    private String message;

    @Column(name = "delivered", columnDefinition = "boolean default false")
    private boolean delivered = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Default Constructor (Required by JPA/Hibernate)
    public Notification() {}

    // Parameterized Constructor
    public Notification(String receiverUsername, String message) {
        this.receiverUsername = receiverUsername;
        this.message = message;
    }

    public Notification(Integer userId, String receiverUsername, String message) {
        this.userId = userId;
        this.receiverUsername = receiverUsername;
        this.message = message;
    }

    // --- CORRECTED GETTERS AND SETTERS ---

    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public Integer getUserId() { 
        return userId; 
    }
    
    public void setUserId(Integer userId) { 
        this.userId = userId; 
    }

    public String getReceiverUsername() {
        return receiverUsername;
    }

    public void setReceiverUsername(String receiverUsername) {
        this.receiverUsername = receiverUsername;
    }

    public String getMessage() { 
        return message; 
    }
    
    public void setMessage(String message) { 
        this.message = message; 
    }

    public boolean isDelivered() {
        return delivered;
    }

    public void setDelivered(boolean delivered) {
        this.delivered = delivered;
    }

    public LocalDateTime getCreatedAt() { 
        return createdAt; 
    }
    
    public void setCreatedAt(LocalDateTime createdAt) { 
        this.createdAt = createdAt; 
    }
}